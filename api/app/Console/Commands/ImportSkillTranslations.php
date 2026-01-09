<?php

namespace App\Console\Commands;

use App\Models\Hero;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ImportSkillTranslations extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'skills:import-translations {--dry-run : Show what would be updated without making changes}';

    /**
     * The console command description.
     */
    protected $description = 'Import skill translations from JSON files into database';

    /**
     * Language codes to process.
     */
    protected array $languages = ['es', 'ko', 'ja', 'zh', 'pt'];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting skill translations import...');
        
        // Look for files in project root
        $basePath = base_path('/');
        $dryRun = $this->option('dry-run');
        
        if ($dryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }
        
        // Load all translation files
        $translations = [];
        foreach ($this->languages as $lang) {
            $filePath = $basePath . "recovered_skills_{$lang}.json";
            
            if (!File::exists($filePath)) {
                $this->error("File not found: {$filePath}");
                continue;
            }
            
            $content = File::get($filePath);
            $translations[$lang] = json_decode($content, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->error("Invalid JSON in {$filePath}: " . json_last_error_msg());
                continue;
            }
            
            $this->info("Loaded {$lang}.json with " . count($translations[$lang]) . " heroes");
        }
        
        if (empty($translations)) {
            $this->error('No translation files loaded!');
            return 1;
        }
        
        // Get all heroes from database
        $heroes = Hero::all();
        $this->info("Processing {$heroes->count()} heroes from database...");
        
        $updated = 0;
        $skipped = 0;
        $bar = $this->output->createProgressBar($heroes->count());
        
        foreach ($heroes as $hero) {
            $slug = $hero->slug;
            $skills = $hero->skills;
            
            if (!$skills || !is_array($skills)) {
                $skipped++;
                $bar->advance();
                continue;
            }
            
            $modified = false;
            
            // For each skill (S1, S2, S3)
            foreach ($skills as $skillKey => &$skill) {
                if (!is_array($skill)) {
                    continue;
                }
                
                // For each language
                foreach ($this->languages as $lang) {
                    if (!isset($translations[$lang][$slug][$skillKey])) {
                        continue;
                    }
                    
                    $langSkill = $translations[$lang][$slug][$skillKey];
                    
                    // Add translated name
                    if (!empty($langSkill['name']) && empty($skill["name_{$lang}"])) {
                        $skill["name_{$lang}"] = $langSkill['name'];
                        $modified = true;
                    }
                    
                    // Add translated description
                    if (!empty($langSkill['description']) && empty($skill["description_{$lang}"])) {
                        $skill["description_{$lang}"] = $langSkill['description'];
                        $modified = true;
                    }
                    
                    // Add translated soulburn effect
                    if (!empty($langSkill['soulburn_effect']) && empty($skill["soulburn_effect_{$lang}"])) {
                        $skill["soulburn_effect_{$lang}"] = $langSkill['soulburn_effect'];
                        $modified = true;
                    }
                }
            }
            unset($skill);
            
            if ($modified) {
                if (!$dryRun) {
                    $hero->skills = $skills;
                    $hero->save();
                }
                $updated++;
            } else {
                $skipped++;
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine(2);
        
        $this->info("Import complete!");
        $this->info("Updated: {$updated} heroes");
        $this->info("Skipped: {$skipped} heroes (no translations found or already has translations)");
        
        if ($dryRun) {
            $this->warn('This was a DRY RUN. Run without --dry-run to apply changes.');
        }
        
        return 0;
    }
}
