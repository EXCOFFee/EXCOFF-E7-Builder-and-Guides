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
        }

        if ($syncArtifacts) {
            $this->syncArtifacts($force);
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
        $code = $data['_id'] ?? $data['id'] ?? null;
        if (!$code) {
            return 'skipped';
        }

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

        // Get image from assets or fallback
        $imageUrl = $data['assets']['thumbnail']
            ?? $data['assets']['icon']
            ?? $this->getHeroImageUrl($code);

        $heroData = [
            'code' => $code,
            'name' => $data['name'] ?? 'Unknown',
            'slug' => Str::slug($data['name'] ?? $code),
            'element' => $element,
            'class' => $heroClass,
            'rarity' => (int) ($data['rarity'] ?? 5),
            'base_stats' => $baseStats,
            'skills' => $skills,
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
     */
    private function getHeroImageUrl(string $code): string
    {
        return "https://raw.githubusercontent.com/fribbels/Fribbels-Epic-7-Optimizer/main/images/hero/{$code}_portrait.png";
    }

    /**
     * Get artifact image URL.
     */
    private function getArtifactImageUrl(string $code): string
    {
        return "https://raw.githubusercontent.com/fribbels/Fribbels-Epic-7-Optimizer/main/images/artifact/{$code}.png";
    }
}
