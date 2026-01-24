<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Artifact;
use Illuminate\Support\Facades\File;

class UpdateArtifactSpanishTranslationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Path to the frontend es.json file
        // We are in api/database/seeders
        // We need to go up to root/web/messages/artifacts/es.json
        $jsonPath = base_path('../web/messages/artifacts/es.json');

        if (!File::exists($jsonPath)) {
            $this->command->error("File not found: {$jsonPath}");
            return;
        }

        $jsonContent = File::get($jsonPath);
        $translations = json_decode($jsonContent, true);

        if (!$translations) {
            $this->command->error("Failed to decode JSON");
            return;
        }

        $updatedCount = 0;
        $missingCount = 0;

        foreach ($translations as $englishName => $spanishName) {
            // Find the artifact by its default (English) name
            $artifact = Artifact::where('name', $englishName)->first();

            if ($artifact) {
                // Update the Spanish name
                $artifact->name_es = $spanishName;
                $artifact->save();
                $updatedCount++;
                // $this->command->info("Updated: {$englishName} -> {$spanishName}");
            } else {
                $missingCount++;
                // $this->command->warn("Artifact not found in DB: {$englishName}");
            }
        }

        $this->command->info("Seeding complete!");
        $this->command->info("Updated {$updatedCount} artifacts.");
        if ($missingCount > 0) {
            $this->command->warn("Skipped {$missingCount} translations (Artifact not found in DB).");
        }
    }
}
