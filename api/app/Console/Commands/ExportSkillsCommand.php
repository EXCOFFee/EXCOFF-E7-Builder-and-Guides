<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Export all hero skills from Fribbels API to JSON for translation.
 * 
 * Usage: php artisan skills:export
 * 
 * This generates a JSON file with all skill descriptions that can be translated.
 */
class ExportSkillsCommand extends Command
{
    protected $signature = 'skills:export 
                            {--output= : Output file path (default: storage/app/skills_en.json)}
                            {--include-custom : Also include custom_heroes.json data}';

    protected $description = 'Export all hero skill descriptions to JSON for translation';

    private const HERO_URL = 'http://e7-optimizer-game-data.s3-accelerate.amazonaws.com/herodata.json';

    public function handle(): int
    {
        $outputPath = $this->option('output') ?: storage_path('app/skills_en.json');
        $includeCustom = $this->option('include-custom');

        $this->info('📥 Fetching hero data from Fribbels...');

        try {
            $response = Http::timeout(60)->get(self::HERO_URL);

            if (!$response->successful()) {
                $this->error('Failed to fetch hero data: ' . $response->status());
                return self::FAILURE;
            }

            $heroesData = $response->json();
            $this->info('Found ' . count($heroesData) . ' heroes from Fribbels');

            $skills = [];
            $heroCount = 0;
            $skillCount = 0;

            $bar = $this->output->createProgressBar(count($heroesData));
            $bar->start();

            foreach ($heroesData as $heroData) {
                $heroId = $heroData['_id'] ?? Str::slug($heroData['name'] ?? 'unknown');
                $heroName = $heroData['name'] ?? 'Unknown';
                $heroSkills = $heroData['skills'] ?? [];

                if (!empty($heroSkills)) {
                    $parsedSkills = $this->parseSkills($heroSkills);
                    if (!empty($parsedSkills)) {
                        $skills[$heroId] = [
                            '_name' => $heroName,
                            'skills' => $parsedSkills,
                        ];
                        $heroCount++;
                        $skillCount += count($parsedSkills);
                    }
                }

                $bar->advance();
            }

            $bar->finish();
            $this->newLine();

            // Include custom heroes if requested
            if ($includeCustom) {
                $customSkills = $this->loadCustomHeroesSkills();
                $customCount = 0;
                foreach ($customSkills as $heroId => $data) {
                    if (!isset($skills[$heroId])) {
                        $skills[$heroId] = $data;
                        $heroCount++;
                        $skillCount += count($data['skills'] ?? []);
                        $customCount++;
                    }
                }
                $this->info("Added {$customCount} heroes from custom_heroes.json");
            }

            // Sort by hero ID for consistency
            ksort($skills);

            // Write to file
            $json = json_encode($skills, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            file_put_contents($outputPath, $json);

            $this->newLine();
            $this->info("✅ Exported {$heroCount} heroes with {$skillCount} skills");
            $this->info("📁 Output: {$outputPath}");

            return self::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            return self::FAILURE;
        }
    }

    /**
     * Parse skills from Fribbels format.
     * Fribbels uses keys like 's1', 's2', 's3' or sometimes numeric indices.
     */
    private function parseSkills(array $heroSkills): array
    {
        $parsed = [];

        foreach ($heroSkills as $key => $skill) {
            // Skip if skill is not an array (might be metadata)
            if (!is_array($skill)) {
                continue;
            }

            // Normalize skill key to S1, S2, S3 format
            if (is_string($key)) {
                // Handle 's1', 's2', 's3' format
                $skillKey = strtoupper($key);
            } else {
                // Handle numeric index
                $skillKey = 'S' . ($key + 1);
            }
            
            $skillData = [
                'name' => $skill['name'] ?? "Skill {$skillKey}",
            ];

            // Add description if available
            if (!empty($skill['description'])) {
                $skillData['description'] = $skill['description'];
            }

            // Add soulburn info if available
            if (!empty($skill['soulburn_description'])) {
                $skillData['soulburn_effect'] = $skill['soulburn_description'];
            } elseif (!empty($skill['soulburn'])) {
                // Some skills have soulburn as a nested object
                if (is_array($skill['soulburn']) && !empty($skill['soulburn']['description'])) {
                    $skillData['soulburn_effect'] = $skill['soulburn']['description'];
                }
            }

            // Add enhance description if available
            if (!empty($skill['enhancement_text'])) {
                $skillData['enhance'] = $skill['enhancement_text'];
            }

            $parsed[$skillKey] = $skillData;
        }

        return $parsed;
    }

    /**
     * Load skills from custom_heroes.json.
     */
    private function loadCustomHeroesSkills(): array
    {
        $path = database_path('data/custom_heroes.json');
        
        if (!file_exists($path)) {
            return [];
        }

        $data = json_decode(file_get_contents($path), true);
        $skills = [];

        foreach ($data as $heroId => $heroData) {
            if ($heroId === '_meta') continue;
            
            $heroSkills = $heroData['skills'] ?? [];
            if (empty($heroSkills)) continue;

            $parsedSkills = [];
            foreach ($heroSkills as $key => $skill) {
                $parsedSkills[$key] = [
                    'name' => $skill['name'] ?? "Skill {$key}",
                ];

                if (!empty($skill['description'])) {
                    $parsedSkills[$key]['description'] = $skill['description'];
                }

                if (!empty($skill['soulburn_effect'])) {
                    $parsedSkills[$key]['soulburn_effect'] = $skill['soulburn_effect'];
                }
            }

            if (!empty($parsedSkills)) {
                $skills[$heroId] = [
                    '_name' => $heroData['name'] ?? $heroId,
                    'skills' => $parsedSkills,
                ];
            }
        }

        return $skills;
    }
}
