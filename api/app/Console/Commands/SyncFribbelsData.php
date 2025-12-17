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

            foreach ($heroesData as $heroData) {
                $result = $this->upsertHero($heroData, $force);

                match ($result) {
                    'created' => $created++,
                    'updated' => $updated++,
                    'skipped' => $skipped++,
                };

                $bar->advance();
            }

            $bar->finish();
            $this->newLine();
            $this->info("Heroes: {$created} created, {$updated} updated, {$skipped} skipped");

        } catch (\Exception $e) {
            $this->error('Error syncing heroes: ' . $e->getMessage());
        }
    }

    /**
     * Upsert a single hero record.
     */
    private function upsertHero(array $data, bool $force): string
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

        // Check if hero exists
        $existingHero = Hero::where('code', $code)->first();

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

        // Get image from assets or fallback - use imageCode for local images
        $imageUrl = $data['assets']['thumbnail']
            ?? $data['assets']['icon']
            ?? $this->getHeroImageUrl($imageCode);

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
            $existingHero->update($heroData);
            return 'updated';
        }

        Hero::create($heroData);
        return 'created';
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
        $code = $data['_id'] ?? $data['id'] ?? null;
        if (!$code) {
            return 'skipped';
        }

        // Map class
        $artifactClass = strtolower($data['role'] ?? $data['class'] ?? 'warrior');
        $artifactClass = self::CLASS_MAP[$artifactClass] ?? 'warrior';

        $artifactData = [
            'code' => $code,
            'name' => $data['name'] ?? 'Unknown',
            'slug' => Str::slug($data['name'] ?? $code),
            'class' => $artifactClass,
            'rarity' => (int) ($data['rarity'] ?? 5),
            'description' => $data['skill']['description'] ?? null,
            'image_url' => $this->getArtifactImageUrl($code),
        ];

        $existing = Artifact::where('code', $code)->first();

        if ($existing) {
            $existing->update($artifactData);
            return 'updated';
        }

        Artifact::create($artifactData);
        return 'created';
    }

    /**
     * Get hero portrait image URL.
     * Uses local datamined images from DBE7/face folder.
     * Images should be copied to public/images/heroes/ on the server.
     */
    private function getHeroImageUrl(string $code): string
    {
        // Use app URL + local path for datamined images
        $baseUrl = config('app.url');
        return "{$baseUrl}/images/heroes/{$code}_l.png";
    }

    /**
     * Get artifact image URL.
     * Uses local datamined images from DBE7/item_arti folder.
     * Images should be copied to public/images/artifacts/ on the server.
     * Fallback to Fribbels GitHub if local image not available.
     */
    private function getArtifactImageUrl(string $code): string
    {
        // Datamine uses art{NNNN}_l.jpg format
        // If code already matches (e.g., art0001), use it directly
        if (preg_match('/^art\d+$/', $code)) {
            $baseUrl = config('app.url');
            return "{$baseUrl}/images/artifacts/{$code}_l.jpg";
        }
        
        // Fallback to Fribbels GitHub for other codes
        return "https://raw.githubusercontent.com/fribbels/Fribbels-Epic-7-Optimizer/main/images/artifact/{$code}.png";
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
                $result = $this->upsertHero($heroData, $force);

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

                $existing = Artifact::where('code', $code)->first();

                if ($existing) {
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
