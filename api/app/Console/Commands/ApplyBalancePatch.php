<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Hero;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

/**
 * Apply balance patch corrections to hero data.
 * Reads from balance patch JSON files and updates hero skills and imprints.
 */
class ApplyBalancePatch extends Command
{
    protected $signature = 'heroes:apply-balance-patch 
                            {--file= : Specific balance patch file to apply}
                            {--hero= : Only apply to specific hero slug}
                            {--dry-run : Preview changes without saving}';

    protected $description = 'Apply balance patch corrections to hero skill data';

    public function handle(): int
    {
        $dataPath = database_path('data');
        $specificFile = $this->option('file');
        $specificHero = $this->option('hero');
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No changes will be saved');
        }

        // Find balance patch files
        $files = [];
        if ($specificFile) {
            $files = ["{$dataPath}/{$specificFile}"];
        } else {
            $files = glob("{$dataPath}/balance_patch_*.json");
        }

        if (empty($files)) {
            $this->error('No balance patch files found.');
            return 1;
        }

        $totalUpdated = 0;

        foreach ($files as $file) {
            if (!File::exists($file)) {
                $this->warn("File not found: {$file}");
                continue;
            }

            $this->info("Processing: " . basename($file));
            $patchData = json_decode(File::get($file), true);

            if (!$patchData) {
                $this->error("Invalid JSON in: {$file}");
                continue;
            }

            // Skip metadata
            unset($patchData['_meta']);

            foreach ($patchData as $slug => $heroData) {
                // Skip if filtering by hero
                if ($specificHero && $slug !== $specificHero) {
                    continue;
                }

                $hero = Hero::where('slug', $slug)->first();

                if (!$hero) {
                    $this->warn("  Hero not found in database: {$slug}");
                    continue;
                }

                $changes = [];

                // Update imprint (self_devotion) if provided
                if (isset($heroData['self_devotion'])) {
                    $oldImprint = $hero->self_devotion['type'] ?? 'unknown';
                    $newImprint = $heroData['self_devotion']['type'];
                    
                    if ($oldImprint !== $newImprint) {
                        $changes[] = "Imprint: {$oldImprint} → {$newImprint}";
                        
                        if (!$dryRun) {
                            $hero->self_devotion = $heroData['self_devotion'];
                        }
                    }
                }

                // Update skills if provided
                if (isset($heroData['skills'])) {
                    $existingSkills = $hero->skills ?? [];
                    
                    foreach ($heroData['skills'] as $skillKey => $skillData) {
                        $oldSkill = $existingSkills[$skillKey] ?? [];
                        
                        // Merge new skill data with existing
                        $mergedSkill = array_merge($oldSkill, $skillData);
                        $existingSkills[$skillKey] = $mergedSkill;
                        
                        // Track what changed
                        if (isset($skillData['name'])) {
                            $oldName = $oldSkill['name'] ?? 'N/A';
                            if ($oldName !== $skillData['name']) {
                                $changes[] = "{$skillKey} name: {$oldName} → {$skillData['name']}";
                            }
                        }
                        
                        if (isset($skillData['description'])) {
                            $oldDesc = $oldSkill['description'] ?? '';
                            if ($oldDesc !== $skillData['description']) {
                                $changes[] = "{$skillKey} description updated";
                            }
                        }
                    }
                    
                    if (!$dryRun) {
                        $hero->skills = $existingSkills;
                    }
                }

                if (!empty($changes)) {
                    $this->line("  ✓ {$hero->name}:");
                    foreach ($changes as $change) {
                        $this->line("      - {$change}");
                    }
                    
                    if (!$dryRun) {
                        $hero->save();
                    }
                    $totalUpdated++;
                } else {
                    $this->line("  - {$hero->name}: No changes needed");
                }
            }
        }

        $this->newLine();
        if ($dryRun) {
            $this->info("DRY RUN: Would update {$totalUpdated} heroes");
        } else {
            $this->info("Updated {$totalUpdated} heroes from balance patch data");
        }

        return 0;
    }
}
