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

        $this->info("Updated $updatedCount heroes from Fribbels data. Not found: $notFoundCount");
        
        if ($notFoundCount > 0) {
            $this->warn("Some heroes from Fribbels data were not found in your database. You may need to add them first.");
        }

        // Apply custom hero overrides (balance patches)
        $this->applyCustomHeroOverrides($dryRun);

        return 0;
    }

    /**
     * Apply custom hero data overrides from custom_heroes.json.
     * This includes balance patch corrections.
     */
    private function applyCustomHeroOverrides(bool $dryRun): void
    {
        $customPath = database_path('data/custom_heroes.json');
        
        if (!file_exists($customPath)) {
            return;
        }

        $this->newLine();
        $this->info("Applying custom hero overrides (balance patches)...");

        $customData = json_decode(file_get_contents($customPath), true);
        if (!$customData) {
            $this->warn("Invalid custom_heroes.json");
            return;
        }

        // Remove metadata
        unset($customData['_meta']);

        $overrideCount = 0;

        foreach ($customData as $slug => $override) {
            $hero = Hero::where('slug', $slug)->first();
            
            if (!$hero && isset($override['code'])) {
                $hero = Hero::where('code', $override['code'])->first();
            }

            if (!$hero) {
                $this->line("  Override skipped (hero not found): {$slug}");
                continue;
            }

            $changes = [];

            // Apply self_devotion override (imprint)
            if (isset($override['self_devotion'])) {
                $oldType = $hero->self_devotion['type'] ?? 'unknown';
                $newType = $override['self_devotion']['type'];
                
                if ($oldType !== $newType) {
                    $changes[] = "Imprint: {$oldType} → {$newType}";
                    $hero->self_devotion = $override['self_devotion'];
                }
            }

            // Apply skill overrides
            if (isset($override['skills'])) {
                $existingSkills = $hero->skills ?? [];

                foreach ($override['skills'] as $skillKey => $skillData) {
                    $oldSkill = $existingSkills[$skillKey] ?? [];
                    
                    // IMPORTANT: Replace skill completely instead of merging
                    // This ensures soulburn fields are removed when not present in override
                    $existingSkills[$skillKey] = $skillData;
                    
                    if (isset($skillData['name']) && ($oldSkill['name'] ?? '') !== $skillData['name']) {
                        $changes[] = "{$skillKey}: {$skillData['name']}";
                    } elseif (isset($skillData['description'])) {
                        $changes[] = "{$skillKey} description updated";
                    }
                }

                $hero->skills = $existingSkills;
            }

            if (!empty($changes)) {
                $this->line("  ✓ {$hero->name}: " . implode(', ', $changes));
                
                if (!$dryRun) {
                    $hero->save();
                }
                $overrideCount++;
            }
        }

        $this->info("Applied {$overrideCount} custom hero overrides");
    }
}
