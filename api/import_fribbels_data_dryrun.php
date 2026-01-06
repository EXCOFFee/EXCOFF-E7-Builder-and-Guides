<?php

use App\Models\Hero;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$jsonPath = 'e:\Proyectos\EpicSeven\EpicSevenAssetRipper\herodata.json';

if (!file_exists($jsonPath)) {
    die("Hero data JSON not found at: $jsonPath\n");
}

$data = json_decode(file_get_contents($jsonPath), true);
$updatedCount = 0;
$notFoundCount = 0;

echo "Starting import of hero data...\n";

foreach ($data as $heroName => $heroData) {
    if ($heroName === 'temp') continue; // Skip temp entries

    $heroCode = $heroData['code'] ?? null;
    
    // Some Fribbels data uses 'c1001' format.
    // Let's try to find the hero by code first, then slug/name.
    $hero = Hero::where('code', $heroCode)->first();

    if (!$hero) {
        $hero = Hero::where('name', $heroName)->first();
    }

    if ($hero) {
        echo "Updating: {$hero->name} ($heroCode)...\n";

        // Update Base Stats (lv60SixStarFullyAwakened)
        $stats = $heroData['calculatedStatus']['lv60SixStarFullyAwakened'] ?? null;
        if ($stats) {
            $baseStats = $hero->base_stats ?? [];
            $baseStats['lv60'] = $stats;
            $hero->base_stats = $baseStats;
        }

        // Update Skills
        $skills = [];
        foreach (['S1', 'S2', 'S3'] as $skillKey) {
            if (isset($heroData['skills'][$skillKey])) {
                $fribbelsSkill = $heroData['skills'][$skillKey];
                
                // Structure for our DB
                $skills[$skillKey] = [
                    'id' => $skillKey,
                    // We don't have English strings in herodata.json? 
                    // WAIT, checking herodata.json structure again...
                    // It seems herodata.json DOES NOT contain name/description strings! 
                    // It only contains multipliers and game logic numbers.
                    // This is a problem.
                ];
            }
        }
        
        // $hero->save();
        $updatedCount++;
    } else {
        // echo "Hero not found: $heroName ($heroCode)\n";
        $notFoundCount++;
    }
}

echo "Done. Updated: $updatedCount, Not Found: $notFoundCount\n";
