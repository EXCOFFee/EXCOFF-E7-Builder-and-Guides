<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Hero;
use Illuminate\Support\Facades\Http;

class ImportHeroData extends Command
{
    protected $signature = 'import:hero-data {--dry-run : Run without saving to database}';
    protected $description = 'Import hero stats and multipliers from Fribbels data (downloads from GitHub)';

    private const HERODATA_URL = 'https://raw.githubusercontent.com/fribbels/Fribbels-Epic-7-Optimizer/main/data/cache/herodata.json';

    public function handle()
    {
        $this->info("Downloading hero data from Fribbels...");
        
        try {
            $response = Http::timeout(60)->get(self::HERODATA_URL);
            
            if (!$response->successful()) {
                $this->error("Failed to download hero data. HTTP Status: " . $response->status());
                return 1;
            }
            
            $data = $response->json();
        } catch (\Exception $e) {
            $this->error("Error downloading data: " . $e->getMessage());
            return 1;
        }

        $this->info("Downloaded " . count($data) . " heroes. Starting import...");
        
        $updatedCount = 0;
        $notFoundCount = 0;
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->warn("DRY RUN MODE - No changes will be saved");
        }

        foreach ($data as $heroName => $heroData) {
            if ($heroName === 'temp') continue;

            $heroCode = $heroData['code'] ?? null;
            if (!$heroCode) continue;

            // Find hero by code (preferred) or name
            $hero = Hero::where('code', $heroCode)->first();
            
            if (!$hero) {
                $hero = Hero::where('name', $heroName)->first();
            }

            if ($hero) {
                $this->line("Updating: {$hero->name} ($heroCode)");

                // 1. Update Base Stats (lv60)
                $stats = $heroData['calculatedStatus']['lv60SixStarFullyAwakened'] ?? null;
                if ($stats) {
                    $baseStats = $hero->base_stats ?? [];
                    $baseStats['lv60'] = $stats;
                    $hero->base_stats = $baseStats;
                }

                // 2. Update Skills (Multipliers)
                $skills = $hero->skills ?? [];
                
                foreach (['S1', 'S2', 'S3'] as $skillKey) {
                    if (isset($heroData['skills'][$skillKey])) {
                        $fribbelsSkill = $heroData['skills'][$skillKey];
                        $currentSkill = $skills[$skillKey] ?? [];
                        
                        $mergedSkill = array_merge($currentSkill, [
                            'rate' => $fribbelsSkill['rate'] ?? null,
                            'pow' => $fribbelsSkill['pow'] ?? null,
                            'targets' => $fribbelsSkill['targets'] ?? null,
                            'selfHpScaling' => $fribbelsSkill['selfHpScaling'] ?? null,
                            'selfDefScaling' => $fribbelsSkill['selfDefScaling'] ?? null,
                            'selfSpdScaling' => $fribbelsSkill['selfSpdScaling'] ?? null,
                            'selfAtkScaling' => $fribbelsSkill['selfAtkScaling'] ?? null,
                        ]);

                        // Remove null values
                        $skills[$skillKey] = array_filter($mergedSkill, fn($v) => $v !== null);
                    }
                }
                $hero->skills = $skills;

                // 3. Update Self Devotion if available
                if (isset($heroData['self_devotion'])) {
                    $existingSkills = $hero->skills ?? [];
                    $existingSkills['self_devotion'] = $heroData['self_devotion'];
                    $hero->skills = $existingSkills;
                }

                // 4. Fill missing basic info
                if (!$hero->element && isset($heroData['attribute'])) {
                    $hero->element = ucfirst($heroData['attribute']);
                }
                if (!$hero->class && isset($heroData['role'])) {
                    $hero->class = ucfirst($heroData['role']);
                }
                if (!$hero->rarity && isset($heroData['rarity'])) {
                    $hero->rarity = $heroData['rarity'];
                }

                if (!$dryRun) {
                    $hero->save();
                }
                $updatedCount++;
            } else {
                $notFoundCount++;
            }
        }

        $this->info("Done. Updated: $updatedCount, Not Found in DB: $notFoundCount");
        
        if ($notFoundCount > 0) {
            $this->warn("Some heroes from Fribbels data were not found in your database. You may need to add them first.");
        }

        return 0;
    }
}
