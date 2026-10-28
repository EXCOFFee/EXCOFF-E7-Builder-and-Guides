<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Artifact;
use App\Models\Hero;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Sync heroes and artifacts data from Fribbels Epic 7 Optimizer repository.
 * 
 * Usage: php artisan data:sync
 * 
 * Source: https://github.com/fribbels/Fribbels-Epic-7-Optimizer
 */
class SyncFribbelsData extends Command
{
    protected $signature = 'data:sync 
                            {--heroes-only : Only sync heroes}
                            {--artifacts-only : Only sync artifacts}
                            {--force : Force update all records, ignoring hash}';

    protected $description = 'Synchronize hero and artifact data from Fribbels repository';

    private const HERO_URL = 'http://e7-optimizer-game-data.s3-accelerate.amazonaws.com/herodata.json';
    private const ARTIFACT_URL = 'http://e7-optimizer-game-data.s3-accelerate.amazonaws.com/artifactdata.json';

    /**
     * Element mapping from Fribbels format.
     */
    private const ELEMENT_MAP = [
        'fire' => 'fire',
        'ice' => 'ice',
        'wind' => 'earth',
        'earth' => 'earth',
        'light' => 'light',
        'dark' => 'dark',
    ];

    /**
     * Class mapping from Fribbels format.
     */
    private const CLASS_MAP = [
        'knight' => 'knight',
        'warrior' => 'warrior',
        'assassin' => 'thief',
        'thief' => 'thief',
        'ranger' => 'ranger',
        'mage' => 'mage',
        'manauser' => 'soul_weaver',
        'soul-weaver' => 'soul_weaver',
    ];

    /**
     * Skill keys Fribbels owns (damage multipliers). Everything else in a skill
     * (name, description, cooldown, soulburn, passive) comes from CeciliaBot/custom data.
     */
    private const SCALING_KEYS = ['rate', 'pow', 'targets', 'selfHpScaling', 'selfDefScaling', 'selfSpdScaling', 'penetration'];

    /**
     * Heroes whose Fribbels stats are known to be wrong and must not be applied.
     * diene: Fribbels lists stats identical to Ivana's (suspected copy error, audit 2026-10-27).
     */
    private const SKIP_FRIBBELS_STATS = ['diene'];

    public function handle(): int
    {
        $this->info('🔄 Starting E7-Hub data synchronization...');
        $this->newLine();

        $syncHeroes = !$this->option('artifacts-only');
        $syncArtifacts = !$this->option('heroes-only');
        $force = $this->option('force');

        if ($syncHeroes) {
            $this->syncHeroes($force);
            $this->syncCustomHeroes($force);
        }

        if ($syncArtifacts) {
            $this->syncArtifacts($force);
            $this->syncCustomArtifacts();
        }

        $this->newLine();
        $this->info('✅ Synchronization complete!');

        return self::SUCCESS;
    }

    /**
     * Sync heroes from Fribbels repository.
     */
    private function syncHeroes(bool $force): void
    {
        $this->info('📥 Fetching hero data...');

        try {
            $response = Http::timeout(30)->get(self::HERO_URL);

            if (!$response->successful()) {
                $this->error('Failed to fetch hero data: ' . $response->status());
                return;
            }

            $heroesData = $response->json();
            $this->info('Found ' . count($heroesData) . ' heroes');

            $bar = $this->output->createProgressBar(count($heroesData));
            $bar->start();

            $created = 0;
            $updated = 0;
            $skipped = 0;

            $failed = 0;
            foreach ($heroesData as $heroData) {
                // One bad record must not abort the rest of the sync
                try {
                    $result = $this->upsertHero($heroData, $force);
                } catch (\Throwable $e) {
                    $result = 'failed';
                    report($e);
                }

                match ($result) {
                    'created' => $created++,
                    'updated' => $updated++,
                    'skipped' => $skipped++,
                    'failed' => $failed++,
                };

                $bar->advance();
            }

            $bar->finish();
            $this->newLine();
            $this->info("Heroes: {$created} created, {$updated} updated, {$skipped} skipped, {$failed} failed");

        } catch (\Exception $e) {
            $this->error('Error syncing heroes: ' . $e->getMessage());
        }
    }

    /**
     * Upsert a single hero record.
     *
     * Fribbels data (authoritative = false) only refreshes stats, imprint, element, class and
     * skill multipliers of an existing hero: names, slugs, images and skill texts are kept.
     * Curated data from custom_heroes.json (authoritative = true) replaces the record.
     */
    private function upsertHero(array $data, bool $force, bool $authoritative = false): string
    {
        // Use _id for DB lookup (maintains compatibility with existing records)
        $code = $data['_id'] ?? $data['id'] ?? null;
        if (!$code) {
            return 'skipped';
        }
        
        // For image URL, prefer the actual hero code (e.g., 'c5072') over the slug
        $imageCode = $data['code'] ?? $code;

        // Calculate hash for change detection
        $dataHash = hash('sha256', json_encode($data));

        // Check if hero exists. Some heroes were seeded with the numeric game code (c6024)
        // or a different code, so also match by that code and by slug.
        $existingHero = Hero::where('code', $code)->first()
            ?? Hero::where('code', $imageCode)->orWhere('slug', $code)->first();

        if ($existingHero && !$force && $existingHero->data_hash === $dataHash) {
            return 'skipped';
        }

        // Map element
        $element = strtolower($data['attribute'] ?? $data['element'] ?? 'fire');
        $element = self::ELEMENT_MAP[$element] ?? 'fire';

        // Map class
        $heroClass = strtolower($data['role'] ?? $data['class'] ?? 'warrior');
        $heroClass = self::CLASS_MAP[$heroClass] ?? 'warrior';

        // Extract base stats from calculatedStatus (Fribbels format)
        $status = $data['calculatedStatus']['lv60SixStarFullyAwakened'] ?? null;

        if ($status) {
            $baseStats = [
                'atk' => (int) ($status['atk'] ?? 0),
                'def' => (int) ($status['def'] ?? 0),
                'hp' => (int) ($status['hp'] ?? 0),
                'spd' => (int) ($status['spd'] ?? 0),
                // chc is 0.15 format, convert to 15%
                'crit_chance' => (int) round(($status['chc'] ?? 0.15) * 100),
                // chd is 1.5 format, convert to 150%
                'crit_dmg' => (int) round(($status['chd'] ?? 1.5) * 100),
                'eff' => (int) round(($status['eff'] ?? 0) * 100),
                'res' => (int) round(($status['efr'] ?? 0) * 100),
            ];
        } else {
            // Fallback for old format
            $baseStats = [
                'atk' => (int) ($data['baseAtk'] ?? 0),
                'def' => (int) ($data['baseDef'] ?? 0),
                'hp' => (int) ($data['baseHp'] ?? 0),
                'spd' => (int) ($data['baseSpd'] ?? 0),
                'crit_chance' => 15,
                'crit_dmg' => 150,
                'eff' => 0,
                'res' => 0,
            ];
        }

        // Extract skills if available
        $skills = $data['skills'] ?? null;

        // Extract self_devotion (Memory Imprint) if available
        $selfDevotion = $data['self_devotion'] ?? null;

        // Always use local API image URL (from Hostinger) instead of Fribbels GitHub
        // This ensures images are served with proper CORS headers for export
        $imageUrl = $this->getHeroImageUrl($imageCode);

        $heroData = [
            'code' => $code,
            'hero_code' => $imageCode, // Numeric code for skill icons (e.g., 'c1144')
            'name' => $data['name'] ?? 'Unknown',
            'slug' => Str::slug($data['name'] ?? $code),
            'element' => $element,
            'class' => $heroClass,
            'rarity' => (int) ($data['rarity'] ?? 5),
            'base_stats' => $baseStats,
            'skills' => $skills,
            'self_devotion' => $selfDevotion,
            'image_url' => $imageUrl,
            'data_hash' => $dataHash,
        ];

        if ($existingHero) {
            if (!$authoritative) {
                $heroData = $this->preserveCuratedHeroFields($existingHero, $heroData, $code);
            }
            $existingHero->update($heroData);
            return 'updated';
        }

        Hero::create($heroData);
        return 'created';
    }

    /**
     * Keep what Fribbels does not own on an existing hero: identity (code, name, slug, image),
     * skill texts/cooldowns/soulburn, and stats flagged as wrong in Fribbels.
     *
     * @param array<string, mixed> $heroData
     * @return array<string, mixed>
     */
    private function preserveCuratedHeroFields(Hero $existing, array $heroData, string $code): array
    {
        unset($heroData['code'], $heroData['name'], $heroData['slug'], $heroData['image_url']);

        if (in_array($code, self::SKIP_FRIBBELS_STATS, true)) {
            unset($heroData['base_stats']);
        }

        $heroData['skills'] = $this->mergeScaling($existing->skills ?? [], $heroData['skills'] ?? []);

        return $heroData;
    }

    /**
     * Copy only the Fribbels multiplier keys into the existing skills.
     *
     * @param array<string, mixed> $existingSkills
     * @param array<string, mixed>|null $fribbelsSkills
     * @return array<string, mixed>
     */
    private function mergeScaling(array $existingSkills, ?array $fribbelsSkills): array
    {
        if (empty($existingSkills)) {
            return $fribbelsSkills ?? [];
        }

        foreach ($fribbelsSkills ?? [] as $skillKey => $fribbelsSkill) {
            if (!isset($existingSkills[$skillKey]) || !is_array($existingSkills[$skillKey]) || !is_array($fribbelsSkill)) {
                continue;
            }
            foreach (self::SCALING_KEYS as $key) {
                unset($existingSkills[$skillKey][$key]);
                if (isset($fribbelsSkill[$key]) && $fribbelsSkill[$key] !== 0) {
                    $existingSkills[$skillKey][$key] = $fribbelsSkill[$key];
                }
            }
        }

        return $existingSkills;
    }

    /**
     * Sync artifacts from Fribbels repository.
     */
    private function syncArtifacts(bool $force): void
    {
        $this->info('📥 Fetching artifact data...');

        try {
            $response = Http::timeout(30)->get(self::ARTIFACT_URL);

            if (!$response->successful()) {
                $this->error('Failed to fetch artifact data: ' . $response->status());
                return;
            }

            $artifactsData = $response->json();
            $this->info('Found ' . count($artifactsData) . ' artifacts');

            $bar = $this->output->createProgressBar(count($artifactsData));
            $bar->start();

            $created = 0;
            $updated = 0;

            foreach ($artifactsData as $artifactData) {
                $result = $this->upsertArtifact($artifactData);

                match ($result) {
                    'created' => $created++,
                    'updated' => $updated++,
                    default => null,
                };

                $bar->advance();
            }

            $bar->finish();
            $this->newLine();
            $this->info("Artifacts: {$created} created, {$updated} updated");

        } catch (\Exception $e) {
            $this->error('Error syncing artifacts: ' . $e->getMessage());
        }
    }

    /**
     * Upsert a single artifact record.
     */
    private function upsertArtifact(array $data): string
    {
        // Fribbels data uses artifact name as key, with 'code' field containing the ID (e.g., ef317)
        $fribbelsCode = $data['code'] ?? null;
        $name = $data['name'] ?? 'Unknown';
        
        if (!$fribbelsCode || !$name) {
            return 'skipped';
        }

        // Map class
        $artifactClass = strtolower($data['role'] ?? $data['class'] ?? 'warrior');
        $artifactClass = self::CLASS_MAP[$artifactClass] ?? 'warrior';

        $artifactData = [
            'code' => $fribbelsCode,
            'name' => $name,
            'slug' => Str::slug($name),
            'class' => $artifactClass,
            'rarity' => (int) ($data['rarity'] ?? 5),
            'description' => $data['skill']['description'] ?? null,
            'image_url' => $this->getArtifactImageUrl(Str::slug($name)),
        ];

        $existing = Artifact::where('code', $fribbelsCode)
            ->orWhere('slug', Str::slug($name))
            ->first();

        if ($existing) {
            // Fribbels has no artifact skill text and its image guess may not exist yet:
            // only refresh class and rarity, keep code/name/slug/description/image of the record
            $existing->update(['class' => $artifactClass, 'rarity' => $artifactData['rarity']]);
            return 'updated';
        }

        Artifact::create($artifactData);
        return 'created';
    }

    /**
     * Get hero portrait image URL.
     * Uses CeciliaBot GitHub raw assets for high-quality images.
     * URL: https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/{code}_su.png
     */
    private function getHeroImageUrl(string $code): string
    {
        // CeciliaBot E7Assets-Temp repository - same codes as Fribbels (c1001, c2004, etc.)
        return "https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/{$code}_su.png";
    }

    /**
     * Get artifact image URL.
     * Uses local Hostinger images since CeciliaBot uses different code format (art#### vs ef###).
     * Fallback: epic7db if local not available
     */
    private function getArtifactImageUrl(string $slug): string
    {
        // Use local Hostinger images for artifacts (more reliable mapping with slug)
        $baseUrl = config('app.url');
        return "https://epic7db.com/images/artifact/icon/{$slug}.webp";
    }

    /**
     * Sync custom heroes from local JSON file.
     * Used for heroes not yet available in Fribbels API.
     */
    private function syncCustomHeroes(bool $force): void
    {
        $customHeroesPath = database_path('data/custom_heroes.json');

        if (!file_exists($customHeroesPath)) {
            $this->info('📁 No custom heroes file found, skipping...');
            return;
        }

        $this->info('📥 Loading custom heroes...');

        try {
            $customHeroes = json_decode(file_get_contents($customHeroesPath), true);

            if (!$customHeroes) {
                $this->warn('Custom heroes file is empty or invalid');
                return;
            }

            $created = 0;
            $updated = 0;
            $skipped = 0;

            foreach ($customHeroes as $heroData) {
                // custom_heroes.json is curated (texts + stats): it replaces the whole record
                $result = $this->upsertHero($heroData, $force, authoritative: true);

                match ($result) {
                    'created' => $created++,
                    'updated' => $updated++,
                    'skipped' => $skipped++,
                };
            }

            $this->info("Custom Heroes: {$created} created, {$updated} updated, {$skipped} skipped");

        } catch (\Exception $e) {
            $this->error('Error syncing custom heroes: ' . $e->getMessage());
        }
    }

    /**
     * Sync custom artifacts from local JSON file.
     * Used for artifacts not yet available in Fribbels API.
     */
    private function syncCustomArtifacts(): void
    {
        $customArtifactsPath = database_path('data/custom_artifacts.json');

        if (!file_exists($customArtifactsPath)) {
            $this->info('📁 No custom artifacts file found, skipping...');
            return;
        }

        $this->info('📥 Loading custom artifacts...');

        try {
            $customArtifacts = json_decode(file_get_contents($customArtifactsPath), true);

            if (!$customArtifacts) {
                $this->warn('Custom artifacts file is empty or invalid');
                return;
            }

            $created = 0;
            $updated = 0;

            foreach ($customArtifacts as $artifactData) {
                $code = $artifactData['code'] ?? $artifactData['_id'] ?? null;
                if (!$code) continue;

                $artifactClass = strtolower($artifactData['role'] ?? 'warrior');
                $artifactClass = self::CLASS_MAP[$artifactClass] ?? 'warrior';

                $data = [
                    'code' => $code,
                    'name' => $artifactData['name'] ?? 'Unknown',
                    'slug' => Str::slug($artifactData['name'] ?? $code),
                    'class' => $artifactClass,
                    'rarity' => (int) ($artifactData['rarity'] ?? 5),
                    'description' => $artifactData['skill']['description'] ?? null,
                    'image_url' => $artifactData['image_url'] ?? "https://epic7db.com/images/artifact/icon/{$artifactData['_id']}.webp",
                ];

                $existing = Artifact::where('code', $code)
                    ->orWhere('slug', Str::slug($artifactData['name'] ?? $code))
                    ->first();

                if ($existing) {
                    // Without a curated image keep the current one: the epic7db guess often 404s
                    if (empty($artifactData['image_url']) && !empty($existing->image_url)) {
                        unset($data['image_url']);
                    }
                    $existing->update($data);
                    $updated++;
                } else {
                    Artifact::create($data);
                    $created++;
                }
            }

            $this->info("Custom Artifacts: {$created} created, {$updated} updated");

        } catch (\Exception $e) {
            $this->error('Error syncing custom artifacts: ' . $e->getMessage());
        }
    }
}
