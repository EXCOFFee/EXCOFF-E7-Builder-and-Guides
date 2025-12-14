<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Artifact;
use App\Models\Hero;
use Illuminate\Console\Command;

/**
 * Apply localized names from JSON file to database.
 * 
 * Usage: php artisan localize:apply
 */
class ApplyLocalizedNames extends Command
{
    protected $signature = 'localize:apply';

    protected $description = 'Apply localized names (KO, JA, ZH) from JSON file to heroes and artifacts';

    public function handle(): int
    {
        $this->info('🌏 Applying localized names...');

        $jsonPath = database_path('data/localized_names.json');

        if (!file_exists($jsonPath)) {
            $this->error('localized_names.json not found!');
            return self::FAILURE;
        }

        $data = json_decode(file_get_contents($jsonPath), true);

        // Apply hero translations
        if (isset($data['heroes'])) {
            $this->info('📥 Applying hero translations...');
            $count = 0;

            foreach ($data['heroes'] as $slug => $names) {
                $hero = Hero::where('slug', $slug)->first();

                if ($hero) {
                    $hero->update([
                        'name_ko' => $names['ko'] ?? null,
                        'name_ja' => $names['ja'] ?? null,
                        'name_zh' => $names['zh'] ?? null,
                    ]);
                    $count++;
                }
            }

            $this->info("✅ Updated {$count} heroes");
        }

        // Apply artifact translations
        if (isset($data['artifacts'])) {
            $this->info('📥 Applying artifact translations...');
            $count = 0;

            foreach ($data['artifacts'] as $slug => $names) {
                $artifact = Artifact::where('slug', $slug)->first();

                if ($artifact) {
                    $artifact->update([
                        'name_ko' => $names['ko'] ?? null,
                        'name_ja' => $names['ja'] ?? null,
                        'name_zh' => $names['zh'] ?? null,
                    ]);
                    $count++;
                }
            }

            $this->info("✅ Updated {$count} artifacts");
        }

        $this->newLine();
        $this->info('🎉 Localization complete!');

        return self::SUCCESS;
    }
}
