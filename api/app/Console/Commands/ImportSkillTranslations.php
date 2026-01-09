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
    protected $signature = 'skills:import-translations {--dry-run : Show what would be updated without making changes} {--check-missing : List heroes with missing translations} {--force : Overwrite existing translations}';

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
        
        if ($this->option('dry-run')) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        // Logic to check missing translations
        if ($this->option('check-missing')) {
           $this->checkMissing($basePath);
           return 0;
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
        
        $force = $this->option('force');
        
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
                    
                    // Add/Update translated name
                    if (!empty($langSkill['name'])) {
                        if ($force || empty($skill["name_{$lang}"])) {
                            // Check if different from current value
                            if (($skill["name_{$lang}"] ?? '') !== $langSkill['name']) {
                                $skill["name_{$lang}"] = $langSkill['name'];
                                $modified = true;
                            }
                        }
                    }
                    
                    // Add/Update translated description
                    if (!empty($langSkill['description'])) {
                        if ($force || empty($skill["description_{$lang}"])) {
                             if (($skill["description_{$lang}"] ?? '') !== $langSkill['description']) {
                                $skill["description_{$lang}"] = $langSkill['description'];
                                $modified = true;
                            }
                        }
                    }
                    
                    // Add/Update translated soulburn effect
                    if (!empty($langSkill['soulburn_effect'])) {
                        if ($force || empty($skill["soulburn_effect_{$lang}"])) {
                             if (($skill["soulburn_effect_{$lang}"] ?? '') !== $langSkill['soulburn_effect']) {
                                $skill["soulburn_effect_{$lang}"] = $langSkill['soulburn_effect'];
                                $modified = true;
                            }
                        }
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

    private function checkMissing($basePath)
    {
        $enPath = $basePath . "recovered_skills_en.json";
        if (!File::exists($enPath)) {
            $this->error("EN file not found");
            return;
        }
        $en = json_decode(File::get($enPath), true);
        
        foreach ($this->languages as $lang) {
            if ($lang === 'en') continue;
            
            $path = $basePath . "recovered_skills_{$lang}.json";
            if (!File::exists($path)) continue;
            
            $data = json_decode(File::get($path), true);
            $missingCount = 0;
            $missingList = [];
            
            foreach ($en as $slug => $skills) {
                // If not in other lang, it's missing
                if (!isset($data[$slug])) {
                    $missingList[] = $slug;
                    $missingCount++;
                    continue;
                }
                
                // If S1 description matches EN, it's likely not translated
                $enDesc = trim(preg_replace('/\s+/', ' ', $skills['S1']['description'] ?? ''));
                $targetDesc = trim(preg_replace('/\s+/', ' ', $data[$slug]['S1']['description'] ?? ''));
                
                if ($enDesc && $targetDesc && $enDesc === $targetDesc) {
                     $missingList[] = $slug;
                     $missingCount++;
                }
            }
            
            $this->info("Language {$lang}: {$missingCount} missing translations.");
            if ($missingCount > 0) {
                $this->line("Heroes: " . implode(', ', array_slice($missingList, 0, 50)) . (count($missingList) > 50 ? '...' : ''));
            }
        }
    }
}
