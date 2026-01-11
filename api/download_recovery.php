<?php

$baseUrl = "https://raw.githubusercontent.com/EXCOFFee/EXCOFF-E7-Builder-and-Guides/main/api/";

$files = [
    'recovered_skills_en.json',
    'recovered_skills_es.json',
    'recovered_skills_ko.json',
    'recovered_skills_ja.json',
    'recovered_skills_zh.json',
    'recovered_skills_pt.json',
    'app/Console/Commands/ImportSkillTranslations.php'
];

echo "Downloading files from GitHub...\n";

foreach ($files as $file) {
    $url = $baseUrl . $file;
    $destination = __DIR__ . '/' . $file;
    
    // Ensure directory exists for the command file
    $dir = dirname($destination);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    
    echo "Downloading: $file ... ";
    
    $content = file_get_contents($url);
    
    if ($content === false) {
        echo "[FAILED]\n";
        echo "Error downloading $url\n";
    } else {
        if (file_put_contents($destination, $content)) {
            echo "[OK]\n";
        } else {
            echo "[WRITE ERROR]\n";
        }
    }
}

echo "\nDone! You can now run:\nphp artisan skills:import-translations\n";
