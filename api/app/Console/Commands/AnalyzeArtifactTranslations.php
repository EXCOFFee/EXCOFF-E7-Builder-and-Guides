<?php

namespace App\Console\Commands;

use App\Models\Artifact;
use Illuminate\Console\Command;

class AnalyzeArtifactTranslations extends Command
{
    protected $signature = 'analyze:artifact-translations';
    protected $description = 'Analyze which artifacts are missing translations and why.';

    public function handle()
    {
        $this->info('Analyzing artifact translations...');

        // Get all artifacts from database
        $artifacts = Artifact::all();
        $this->info("Total artifacts in database: " . $artifacts->count());

        // Load translation JSONs
        $translationPath = base_path('../web/messages/artifacts');
        $storagePath = storage_path('app/artifact_translations');
        
        $basePath = is_dir($storagePath) ? $storagePath : $translationPath;
        $this->info("Using translation path: $basePath");

        $languages = ['ko', 'ja', 'zh', 'es', 'pt'];
        $translations = [];
        
        foreach ($languages as $lang) {
            $file = "$basePath/$lang.json";
            if (file_exists($file)) {
                $content = json_decode(file_get_contents($file), true);
                $translations[$lang] = $content ?? [];
                $this->info("Loaded $lang.json: " . count($translations[$lang]) . " entries");
            } else {
                $this->warn("File not found: $file");
                $translations[$lang] = [];
            }
        }

        // Analyze database columns
        $this->newLine();
        $this->info("=== Database Column Analysis ===");
        
        $missingByLang = [];
        $hasIconIssues = [];
        
        foreach ($artifacts as $artifact) {
            // Check icon
            if (empty($artifact->icon)) {
                $hasIconIssues[] = $artifact->name;
            }
            
            // Check each language column
            foreach ($languages as $lang) {
                $column = "name_$lang";
                if (empty($artifact->$column)) {
                    $missingByLang[$lang][] = $artifact->name;
                }
            }
        }

        $this->newLine();
        $this->info("=== Artifacts with Missing Icons ===");
        $this->line(count($hasIconIssues) . " artifacts have no icon");
        if (count($hasIconIssues) > 0 && count($hasIconIssues) <= 20) {
            foreach ($hasIconIssues as $name) {
                $this->line("  - $name");
            }
        }

        $this->newLine();
        $this->info("=== Artifacts Missing Translations (by language) ===");
        foreach ($languages as $lang) {
            $missing = $missingByLang[$lang] ?? [];
            $this->line(strtoupper($lang) . ": " . count($missing) . " missing");
        }

        // Check which artifacts in DB are NOT in JSON files
        $this->newLine();
        $this->info("=== Artifacts in DB but NOT in JSON (sample) ===");
        foreach ($languages as $lang) {
            $jsonKeys = array_keys($translations[$lang]);
            $notInJson = [];
            foreach ($artifacts as $artifact) {
                if (!in_array($artifact->name, $jsonKeys)) {
                    $notInJson[] = $artifact->name;
                }
            }
            if (count($notInJson) > 0) {
                $this->line(strtoupper($lang) . " missing from JSON: " . count($notInJson));
                // Show first 10
                foreach (array_slice($notInJson, 0, 10) as $name) {
                    $this->line("  - $name");
                }
                if (count($notInJson) > 10) {
                    $this->line("  ... and " . (count($notInJson) - 10) . " more");
                }
            }
        }

        // Save detailed report
        $reportPath = storage_path('app/artifact_translation_report.json');
        file_put_contents($reportPath, json_encode([
            'missing_icons' => $hasIconIssues,
            'missing_translations' => $missingByLang,
            'json_counts' => array_map(fn($t) => count($t), $translations),
            'db_count' => $artifacts->count(),
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        $this->newLine();
        $this->info("Report saved to: $reportPath");
    }
}
