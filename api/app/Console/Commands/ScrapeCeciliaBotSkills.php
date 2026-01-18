<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Scrape hero skill data from CeciliaBot website.
 * 
 * Usage: php artisan ceciliabot:scrape-skills
 * 
 * This extracts skill descriptions from CeciliaBot's hero database.
 */
class ScrapeCeciliaBotSkills extends Command
{
    protected $signature = 'ceciliabot:scrape-skills 
                            {--output= : Output file path (default: ../web/src/messages/skills/en.json)}
                            {--limit= : Limit number of heroes to scrape (for testing)}
                            {--hero= : Scrape specific hero by slug}';

    protected $description = 'Scrape hero skill descriptions from CeciliaBot';

    private const CECILIABOT_BASE = 'https://ceciliabot.github.io';
    
    // CeciliaBot uses a bundled JS app, we need to find their data source
    private const HERO_LIST_URL = 'https://ceciliabot.github.io/assets/data/herodata.json';
    
    public function handle(): int
    {
        $outputPath = $this->option('output') ?: base_path('../web/src/messages/skills/en.json');
        $limit = $this->option('limit') ? (int)$this->option('limit') : null;
        $specificHero = $this->option('hero');

        $this->info('🔍 Scraping CeciliaBot for skill descriptions...');

        // First, try to find CeciliaBot's data source
        $heroData = $this->fetchCeciliaBotData();
        
        if (empty($heroData)) {
            $this->error('Could not fetch CeciliaBot data. Falling back to individual page scraping...');
            return $this->scrapeIndividualPages($outputPath, $limit, $specificHero);
        }

        $skills = [];
        $heroCount = 0;
        $skillCount = 0;

        $heroesToProcess = $specificHero ? [$specificHero => $heroData[$specificHero] ?? null] : $heroData;
        
        if ($limit) {
            $heroesToProcess = array_slice($heroesToProcess, 0, $limit, true);
        }

        $bar = $this->output->createProgressBar(count($heroesToProcess));
        $bar->start();

        foreach ($heroesToProcess as $heroId => $data) {
            if (!$data || !is_array($data)) {
                $bar->advance();
                continue;
            }

            $heroSkills = $this->extractSkillsFromData($heroId, $data);
            
            if (!empty($heroSkills)) {
                $skills[$heroId] = [
                    '_name' => $data['name'] ?? ucfirst(str_replace('-', ' ', $heroId)),
                    'skills' => $heroSkills,
                ];
                $heroCount++;
                $skillCount += count($heroSkills);
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        // Sort by hero ID
        ksort($skills);

        // Ensure directory exists
        $dir = dirname($outputPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        // Write to file
        $json = json_encode($skills, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        file_put_contents($outputPath, $json);

        $this->info("✅ Scraped {$heroCount} heroes with {$skillCount} skills");
        $this->info("📁 Output: {$outputPath}");

        return self::SUCCESS;
    }

    /**
     * Fetch CeciliaBot's hero database.
     */
    private function fetchCeciliaBotData(): array
    {
        // Try multiple possible data sources
        $urls = [
            'https://ceciliabot.github.io/assets/data/HeroData.json',
            'https://ceciliabot.github.io/assets/data/herodata.json',
            'https://ceciliabot.github.io/data/HeroDatabase.json',
            'https://raw.githubusercontent.com/CeciliaBot/E7Tools/main/public/assets/data/HeroData.json',
            'https://raw.githubusercontent.com/CeciliaBot/E7Tools/master/public/assets/data/HeroData.json',
        ];

        foreach ($urls as $url) {
            $this->line("  Trying: {$url}");
            
            try {
                $response = Http::timeout(30)
                    ->withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    ])
                    ->get($url);

                if ($response->successful()) {
                    $data = $response->json();
                    if (!empty($data)) {
                        $this->info("  ✓ Found data at {$url}");
                        return $data;
                    }
                }
            } catch (\Exception $e) {
                $this->line("  ✗ Failed: " . $e->getMessage());
            }
        }

        return [];
    }

    /**
     * Extract skills from CeciliaBot data format.
     */
    private function extractSkillsFromData(string $heroId, array $data): array
    {
        $skills = [];

        // CeciliaBot data structure varies, try multiple formats
        $skillsData = $data['skills'] ?? $data['skill'] ?? [];

        if (empty($skillsData)) {
            return [];
        }

        // Handle both array and object formats
        foreach ($skillsData as $key => $skill) {
            if (!is_array($skill)) {
                continue;
            }

            // Normalize key to S1, S2, S3 format
            $skillKey = is_string($key) ? strtoupper($key) : 'S' . ($key + 1);
            
            $skillInfo = [
                'name' => $skill['name'] ?? $skill['skillName'] ?? "Skill {$skillKey}",
            ];

            // Get description
            $description = $skill['description'] ?? $skill['desc'] ?? $skill['text'] ?? null;
            if ($description) {
                // Clean up HTML tags if present
                $skillInfo['description'] = strip_tags($description);
            }

            // Get soulburn effect
            $soulburn = $skill['soulburn'] ?? $skill['burn'] ?? $skill['soulburn_description'] ?? null;
            if ($soulburn) {
                if (is_array($soulburn)) {
                    $soulburn = $soulburn['description'] ?? $soulburn['text'] ?? null;
                }
                if ($soulburn) {
                    $skillInfo['soulburn_effect'] = strip_tags($soulburn);
                }
            }

            $skills[$skillKey] = $skillInfo;
        }

        return $skills;
    }

    /**
     * Fallback: Scrape individual hero pages from CeciliaBot.
     */
    private function scrapeIndividualPages(string $outputPath, ?int $limit, ?string $specificHero): int
    {
        $this->info('📥 Getting hero list from Fribbels for slugs...');

        // Get hero list from Fribbels to know which heroes exist
        $heroListResponse = Http::timeout(60)->get('http://e7-optimizer-game-data.s3-accelerate.amazonaws.com/herodata.json');
        
        if (!$heroListResponse->successful()) {
            $this->error('Could not fetch hero list from Fribbels');
            return self::FAILURE;
        }

        $heroList = $heroListResponse->json();
        $this->info('Found ' . count($heroList) . ' heroes');

        $skills = [];
        $heroCount = 0;
        $skillCount = 0;
        $errors = 0;

        $heroesToProcess = $specificHero 
            ? array_filter($heroList, fn($h) => ($h['_id'] ?? '') === $specificHero)
            : $heroList;

        if ($limit) {
            $heroesToProcess = array_slice($heroesToProcess, 0, $limit);
        }

        $bar = $this->output->createProgressBar(count($heroesToProcess));
        $bar->start();

        foreach ($heroesToProcess as $hero) {
            $heroId = $hero['_id'] ?? Str::slug($hero['name'] ?? 'unknown');
            $heroName = $hero['name'] ?? ucfirst(str_replace('-', ' ', $heroId));

            $heroSkills = $this->scrapeHeroPage($heroId);

            if (!empty($heroSkills)) {
                $skills[$heroId] = [
                    '_name' => $heroName,
                    'skills' => $heroSkills,
                ];
                $heroCount++;
                $skillCount += count($heroSkills);
            } else {
                $errors++;
            }

            $bar->advance();

            // Be nice to the server
            usleep(100000); // 100ms delay
        }

        $bar->finish();
        $this->newLine();

        // Sort and save
        ksort($skills);

        $dir = dirname($outputPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $json = json_encode($skills, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        file_put_contents($outputPath, $json);

        $this->info("✅ Scraped {$heroCount} heroes with {$skillCount} skills ({$errors} errors)");
        $this->info("📁 Output: {$outputPath}");

        return self::SUCCESS;
    }

    /**
     * Scrape a single hero page from CeciliaBot.
     */
    private function scrapeHeroPage(string $heroId): array
    {
        $url = self::CECILIABOT_BASE . "/#/hero/{$heroId}";
        
        // CeciliaBot is a Vue SPA, so we can't directly scrape HTML
        // Instead, we'll try to find their API endpoints
        
        // Try direct API call for hero data
        $apiUrl = self::CECILIABOT_BASE . "/api/hero/{$heroId}";
        
        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                ])
                ->get($apiUrl);

            if ($response->successful()) {
                $data = $response->json();
                return $this->extractSkillsFromData($heroId, $data);
            }
        } catch (\Exception $e) {
            // Silently fail and return empty
        }

        return [];
    }
}
