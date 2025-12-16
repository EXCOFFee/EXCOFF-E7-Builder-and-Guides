<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Scrape hero skill data from Epic7x.com to enhance local hero database.
 * 
 * Usage:
 *   php artisan hero:scrape "Swift Flagbearer Sigret"
 *   php artisan hero:scrape --all
 */
class ScrapeEpic7xData extends Command
{
    protected $signature = 'hero:scrape 
                            {name? : Hero name to scrape (optional)}
                            {--all : Scrape all heroes}
                            {--update-json : Update custom_heroes.json with scraped data}';

    protected $description = 'Scrape hero skill data from Epic7x.com';

    private const EPIC7X_BASE = 'https://www.epic7x.com';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $heroName = $this->argument('name');
        $all = $this->option('all');

        if (!$heroName && !$all) {
            $this->error('Please provide a hero name or use --all flag');
            $this->info('Usage: php artisan hero:scrape "Swift Flagbearer Sigret"');
            return self::FAILURE;
        }

        if ($heroName) {
            $this->scrapeHero($heroName);
        } else {
            $this->info('Scraping all heroes is not yet implemented.');
            $this->info('Please specify a hero name.');
        }

        return self::SUCCESS;
    }

    /**
     * Scrape a single hero's data from Epic7x.
     */
    private function scrapeHero(string $heroName): void
    {
        $slug = Str::slug($heroName);
        $url = self::EPIC7X_BASE . "/character/{$slug}/";

        $this->info("🔍 Fetching data for: {$heroName}");
        $this->info("   URL: {$url}");

        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                ])
                ->get($url);

            if (!$response->successful()) {
                $this->error("Failed to fetch page: HTTP {$response->status()}");
                return;
            }

            $html = $response->body();
            $heroData = $this->parseEpic7xPage($html, $heroName);

            if ($heroData) {
                $this->displayHeroData($heroData);

                if ($this->option('update-json')) {
                    $this->updateCustomHeroesJson($heroData);
                }
            }

        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
        }
    }

    /**
     * Parse Epic7x HTML page to extract hero data.
     */
    private function parseEpic7xPage(string $html, string $heroName): ?array
    {
        $heroData = [
            'name' => $heroName,
            'slug' => Str::slug($heroName),
            'skills' => [],
            'image_url' => null,
        ];

        // Extract hero image
        if (preg_match('/<img[^>]+class="[^"]*character-icon[^"]*"[^>]+src="([^"]+)"/', $html, $matches)) {
            $heroData['image_url'] = $matches[1];
        }

        // Alternative image extraction
        if (!$heroData['image_url'] && preg_match('/wp-content\/uploads\/[^"]+' . preg_quote(Str::slug($heroName), '/') . '[^"]+\.png/i', $html, $matches)) {
            $heroData['image_url'] = 'https://www.epic7x.com/' . $matches[0];
        }

        // Extract skills using regex patterns
        // Epic7x uses a specific structure for skills
        $skillPatterns = [
            'S1' => '/Skill 1[^<]*<\/h[23]>.*?<p[^>]*>([^<]+)<\/p>/is',
            'S2' => '/Skill 2[^<]*<\/h[23]>.*?<p[^>]*>([^<]+)<\/p>/is',
            'S3' => '/Skill 3[^<]*<\/h[23]>.*?<p[^>]*>([^<]+)<\/p>/is',
        ];

        // Alternative: Look for skill descriptions in a more flexible way
        // Epic7x typically has skill info in divs with specific classes
        
        // Try to find skill names and descriptions
        if (preg_match_all('/<h[34][^>]*>([^<]*(?:S[123]|Skill)[^<]*)<\/h[34]>.*?<p[^>]*class="[^"]*skill[^"]*"[^>]*>([^<]+)<\/p>/is', $html, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $skillName = trim($match[1]);
                $description = trim($match[2]);
                
                // Determine skill key
                if (stripos($skillName, 'S1') !== false || stripos($skillName, 'Skill 1') !== false) {
                    $heroData['skills']['S1'] = ['name' => $skillName, 'description' => $description];
                } elseif (stripos($skillName, 'S2') !== false || stripos($skillName, 'Skill 2') !== false) {
                    $heroData['skills']['S2'] = ['name' => $skillName, 'description' => $description];
                } elseif (stripos($skillName, 'S3') !== false || stripos($skillName, 'Skill 3') !== false) {
                    $heroData['skills']['S3'] = ['name' => $skillName, 'description' => $description];
                }
            }
        }

        // Fallback: Try to extract any skill-related content
        if (empty($heroData['skills'])) {
            // Look for common skill description patterns
            if (preg_match_all('/<div[^>]*class="[^"]*skill-desc[^"]*"[^>]*>(.*?)<\/div>/is', $html, $matches)) {
                foreach ($matches[1] as $index => $desc) {
                    $skillKey = 'S' . ($index + 1);
                    $heroData['skills'][$skillKey] = [
                        'name' => "Skill {$skillKey}",
                        'description' => strip_tags(trim($desc))
                    ];
                }
            }
        }

        // Extract element and class if available
        if (preg_match('/class="[^"]*element[^"]*"[^>]*>([^<]+)</', $html, $matches)) {
            $heroData['element'] = strtolower(trim($matches[1]));
        }

        if (preg_match('/class="[^"]*class-type[^"]*"[^>]*>([^<]+)</', $html, $matches)) {
            $heroData['class'] = strtolower(trim($matches[1]));
        }

        $this->info("✅ Parsed hero data");

        return $heroData;
    }

    /**
     * Display scraped hero data.
     */
    private function displayHeroData(array $heroData): void
    {
        $this->newLine();
        $this->info("═══════════════════════════════════════");
        $this->info("  📋 HERO DATA: {$heroData['name']}");
        $this->info("═══════════════════════════════════════");

        if ($heroData['image_url']) {
            $this->info("  🖼️  Image: {$heroData['image_url']}");
        } else {
            $this->warn("  ⚠️  No image found");
        }

        if (!empty($heroData['skills'])) {
            $this->newLine();
            $this->info("  ⚔️  SKILLS:");
            foreach ($heroData['skills'] as $key => $skill) {
                $this->info("  [{$key}] {$skill['name']}");
                if (isset($skill['description'])) {
                    $desc = Str::limit($skill['description'], 100);
                    $this->line("       {$desc}");
                }
            }
        } else {
            $this->warn("  ⚠️  No skills found (Epic7x page structure may have changed)");
        }

        $this->newLine();
    }

    /**
     * Update custom_heroes.json with scraped data.
     */
    private function updateCustomHeroesJson(array $heroData): void
    {
        $jsonPath = database_path('data/custom_heroes.json');

        if (!file_exists($jsonPath)) {
            $existingData = [];
        } else {
            $existingData = json_decode(file_get_contents($jsonPath), true) ?? [];
        }

        $slug = $heroData['slug'];

        if (isset($existingData[$slug])) {
            // Update existing hero
            if ($heroData['image_url']) {
                $existingData[$slug]['assets']['thumbnail'] = $heroData['image_url'];
                $existingData[$slug]['assets']['icon'] = $heroData['image_url'];
            }
            foreach ($heroData['skills'] as $key => $skill) {
                if (isset($existingData[$slug]['skills'][$key])) {
                    $existingData[$slug]['skills'][$key]['name'] = $skill['name'];
                    if (isset($skill['description'])) {
                        $existingData[$slug]['skills'][$key]['description'] = $skill['description'];
                    }
                } else {
                    $existingData[$slug]['skills'][$key] = $skill;
                }
            }
            $this->info("✅ Updated {$slug} in custom_heroes.json");
        } else {
            // Add new hero
            $existingData[$slug] = [
                'code' => 'unknown',
                '_id' => $slug,
                'name' => $heroData['name'],
                'rarity' => 5,
                'attribute' => $heroData['element'] ?? 'fire',
                'role' => $heroData['class'] ?? 'warrior',
                'assets' => [
                    'icon' => $heroData['image_url'] ?? '',
                    'thumbnail' => $heroData['image_url'] ?? '',
                ],
                'skills' => $heroData['skills'],
                'source' => 'epic7x',
            ];
            $this->info("✅ Added {$slug} to custom_heroes.json");
        }

        file_put_contents($jsonPath, json_encode($existingData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }
}
