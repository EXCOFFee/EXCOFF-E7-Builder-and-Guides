<?php

namespace App\Console\Commands;

use App\Models\Hero;
use Illuminate\Console\Command;

class AnalyzeSkillTranslations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'analyze:skill-translations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Analyze heroes and identify missing skill translations in non-English languages.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting skill translation analysis...');

        $heroes = Hero::all();
        $missingTranslations = [];
        $languages = ['es', 'pt', 'ko', 'ja', 'zh']; // Target languages (English 'en' is default)

        $bar = $this->output->createProgressBar(count($heroes));
        $bar->start();

        foreach ($heroes as $hero) {
            $skills = $hero->skills;
            if (empty($skills) || !is_array($skills)) {
                $bar->advance();
                continue;
            }

            foreach ($skills as $skill) {
                // Determine skill identifier (e.g. S1, S2, S3 or fallback to name)
                $skillName = $skill['name'] ?? 'Unknown Skill';
                
                foreach ($languages as $lang) {
                    $key = "name_{$lang}";
                    // Check if translation exists and is not empty
                    if (!isset($skill[$key]) || empty($skill[$key]) || $skill[$key] === $skillName) {
                        // Note: Checks if it's identical to English (often means not translated backup)? 
                        // Actually, some names might be same, but usually not. 
                        // Better strict check: !isset or empty.
                        
                        $missingTranslations[$lang][$hero->name][] = $skillName;
                    }
                }
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Analysis Complete. Found missing translations:");

        foreach ($languages as $lang) {
            if (isset($missingTranslations[$lang]) && count($missingTranslations[$lang]) > 0) {
                $count = count($missingTranslations[$lang]);
                $this->warn("Language: " . strtoupper($lang) . " - $count heroes missing skills");
                
                // Detailed report for user
                // $this->line(json_encode($missingTranslations[$lang], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            } else {
                $this->info("Language: " . strtoupper($lang) . " - All good!");
            }
        }

        // Export to file for easier reading
        $reportPath = storage_path('app/skill_translation_report.json');
        file_put_contents($reportPath, json_encode($missingTranslations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $this->info("Detailed report saved to: $reportPath");
    }
}
