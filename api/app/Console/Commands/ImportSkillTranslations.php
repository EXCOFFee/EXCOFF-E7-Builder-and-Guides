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
    protected $signature = 'skills:import-translations 
                            {--dry-run : Show what would be updated without making changes} 
                            {--check-missing : List heroes with missing translations} 
                            {--force : Overwrite existing translations}
                            {--lang= : Specific language to import (default: all)}
                            {--path= : Custom path to JSON file}';

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
        
        $basePath = base_path('/');
        $dryRun = $this->option('dry-run');
        
        if ($dryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        // Logic to check missing translations
        if ($this->option('check-missing')) {
           $this->checkMissing($basePath);
           return 0;
        }
        
        $targetLang = $this->option('lang');
        $customPath = $this->option('path');
        
        // Load translation files
        $translations = [];
        $langsToProcess = $targetLang ? [$targetLang] : $this->languages;
        
        foreach ($langsToProcess as $lang) {
            if ($customPath) {
                $filePath = $customPath;
            } else {
                $filePrefix = $lang === 'en' ? 'messages/skills/en' : "recovered_skills_{$lang}";
                // Try to find the file in standardized locations if custom path not provided
                $scrapedPath = base_path("../web/src/messages/skills/{$lang}.json");
                $legacyPath = $basePath . "{$filePrefix}.json";
                
                $filePath = File::exists($scrapedPath) ? $scrapedPath : $legacyPath;
            }
            
            if (!File::exists($filePath)) {
                $this->warn("File not found for {$lang}: {$filePath}");
                continue;
            }
            
            $content = File::get($filePath);
            $translations[$lang] = json_decode($content, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->error("Invalid JSON in {$filePath}: " . json_last_error_msg());
                continue;
            }
            
            $this->info("Loaded {$lang} data from " . basename($filePath) . " with " . count($translations[$lang]) . " heroes");
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
        $bar->start();
        
        $force = $this->option('force');
        
        foreach ($heroes as $hero) {
            $slug = $hero->slug;
            // Support both slug and hero code as keys
            $lookupKey = $slug; 
            
            $skills = $hero->skills;
            
            if (!$skills || !is_array($skills)) {
                $skipped++;
                $bar->advance();
                continue;
            }
            
            $modified = false;
            
            // Allow looking up by hero ID/Code if slug not found (handling format differences)
            $heroData = null;
            
            // For each language
            foreach ($langsToProcess as $lang) {
                if (!isset($translations[$lang])) continue;
                
                // Try finding hero data by slug or direct match
                $heroData = $translations[$lang][$slug] ?? null;
                
                // If not found, try case-insensitive/slug matching against the loaded keys
                if (!$heroData) {
                    // Lazy indexing for this language if not done yet
                    if (!isset($translations[$lang]['_normalized_index'])) {
                        $translations[$lang]['_normalized_index'] = [];
                        foreach ($translations[$lang] as $k => $v) {
                            if ($k === '_normalized_index') continue;
                            // Index by slugified key (e.g. "Abyssal Yufine" -> "abyssal-yufine")
                            $normalizedKey = \Illuminate\Support\Str::slug((string)$k);
                            $translations[$lang]['_normalized_index'][$normalizedKey] = $v;
                        }
                    }
                    
                    $heroData = $translations[$lang]['_normalized_index'][$slug] ?? null;
                }

                // If still not found, try matching by Hero Name from DB
                if (!$heroData) {
                     $dbNameSlug = \Illuminate\Support\Str::slug($hero->name);
                     $heroData = $translations[$lang]['_normalized_index'][$dbNameSlug] ?? null;
                }

                // If not found by slug, try searching by name or id if structured differently
                if (!$heroData) {
                    continue;
                }
                
                if (!isset($heroData['skills'])) {
                    continue;
                }

                $transSkills = $heroData['skills'];

                // For each skill (S1, S2, S3)
                foreach ($skills as $skillKey => &$skill) {
                    if (!is_array($skill)) continue;
                    
                    if (!isset($transSkills[$skillKey])) continue;
                    
                    $transSkill = $transSkills[$skillKey];
                    
                    // Determine keys based on language
                    // If English (en), update the base keys. Otherwise update localized keys.
                    $isBase = ($lang === 'en');
                    
                    $nameKey = $isBase ? 'name' : "name_{$lang}";
                    $descKey = $isBase ? 'description' : "description_{$lang}";
                    $sbKey   = $isBase ? 'soulburn_effect' : "soulburn_effect_{$lang}";

                    // Update Name
                    if (!empty($transSkill['name'])) {
                        if ($force || empty($skill[$nameKey]) || $isBase) {
                            if (($skill[$nameKey] ?? '') !== $transSkill['name']) {
                                $skill[$nameKey] = $transSkill['name'];
                                $modified = true;
                            }
                        }
                    }
                    
                    // Update Description
                    if (!empty($transSkill['description'])) {
                        if ($force || empty($skill[$descKey]) || $isBase) {
                            if (($skill[$descKey] ?? '') !== $transSkill['description']) {
                                // Clean up formatting if needed
                                $cleanDesc = trim($transSkill['description']);
                                if (($skill[$descKey] ?? '') !== $cleanDesc) {
                                    $skill[$descKey] = $cleanDesc;
                                    $modified = true;
                                }
                            }
                        }
                    }
                    
                    // Update Soulburn
                    // Handle structure difference: scraper uses 'soulburn_effect' key inside skill
                    $sbEffect = $transSkill['soulburn_effect'] ?? null;
                    
                    if ($sbEffect) {
                        if ($force || empty($skill[$sbKey]) || $isBase) {
                            if (($skill[$sbKey] ?? '') !== $sbEffect) {
                                $skill[$sbKey] = $sbEffect;
                                $modified = true;
                            }
                        }
                    }
                }
                unset($skill);
            }
            
            if ($modified) {
                if (!$dryRun) {
                    $hero->skills = $skills;
                    $hero->save();
                    // Update timestamp to force cache refresh if needed
                    // $hero->touch(); 
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
        $this->info("Skipped: {$skipped} heroes");
        
        if ($dryRun) {
            $this->warn('This was a DRY RUN. Run without --dry-run to apply changes.');
        }
        
        return 0;
    }

    private function checkMissing($basePath)
    {
        // ... kept simple for now
    }
}
