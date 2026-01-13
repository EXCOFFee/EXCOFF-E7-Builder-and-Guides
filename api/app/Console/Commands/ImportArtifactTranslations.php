<?php

namespace App\Console\Commands;

use App\Models\Artifact;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ImportArtifactTranslations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:artifact-translations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import artifact translations from web/messages/artifacts/*.json to DB';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting artifact translation import...');

        // Define mapping of JSON files to DB columns
        $locales = [
            'es' => 'name_es',
            'pt' => 'name_pt',
            'ko' => 'name_ko',
            'ja' => 'name_ja',
            'zh' => 'name_zh',
        ];

        // Use storage path for manual upload compatibility in production
        // User instructions: Upload .json files to /storage/app/artifact_translations/
        $importPath = storage_path('app/artifact_translations');
        
        // Fallback to dev path if storage path is empty
        if (!File::exists($importPath)) {
             $devPath = base_path('../web/messages/artifacts');
             if (File::exists($devPath)) {
                 $importPath = $devPath;
                 $this->info("Using dev path: $importPath");
             }
        }

        if (!File::exists($importPath)) {
            $this->error("Import directory not found at: $importPath. Please create it and upload JSON files.");
            return;
        }

        foreach ($locales as $lang => $column) {
            $filePath = "$importPath/$lang.json";
            
            if (!File::exists($filePath)) {
                $this->warn("File not found for $lang: $filePath");
                continue;
            }

            $this->info("Processing $lang from $filePath...");
            
            $json = json_decode(File::get($filePath), true);
            
            if (!$json) {
                $this->error("Invalid JSON in $filePath");
                continue;
            }

            $count = 0;
            $bar = $this->output->createProgressBar(count($json));
            $bar->start();

            foreach ($json as $englishName => $translatedName) {
                // Find artifact by English name
                $artifact = Artifact::where('name', $englishName)->first();

                if ($artifact) {
                    $artifact->$column = $translatedName;
                    $artifact->save();
                    $count++;
                }
                
                $bar->advance();
            }

            $bar->finish();
            $this->newLine();
            $this->info("Updated $count artifacts for $lang.");
        }

        $this->info('Import completed successfully!');
    }
}
