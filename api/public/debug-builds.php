<?php
// Debug script for build creation - DELETE AFTER TESTING
error_reporting(E_ALL);
ini_set('display_errors', 1);

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "<pre>";
echo "=== BUILD CREATION DEBUG ===\n\n";

// Check if heroes table has data
$heroCount = DB::table('heroes')->count();
echo "Heroes in database: $heroCount\n";

// Check if artifacts table has data
$artifactCount = DB::table('artifacts')->count();
echo "Artifacts in database: $artifactCount\n";

// Check if user_builds table exists
try {
    $buildCount = DB::table('user_builds')->count();
    echo "Builds in database: $buildCount\n";
} catch (Exception $e) {
    echo "ERROR with user_builds table: " . $e->getMessage() . "\n";
}

// Check storage directory
$storagePath = storage_path('app/public/builds');
if (file_exists($storagePath)) {
    echo "\nStorage path exists: $storagePath\n";
    echo "Storage is writable: " . (is_writable($storagePath) ? 'YES' : 'NO') . "\n";
} else {
    echo "\nStorage path does NOT exist: $storagePath\n";
    echo "Trying to create...\n";
    if (mkdir($storagePath, 0755, true)) {
        echo "Created successfully!\n";
    } else {
        echo "Failed to create directory!\n";
    }
}

// Check storage link
$publicStorage = public_path('storage');
if (file_exists($publicStorage) || is_link($publicStorage)) {
    echo "Storage link exists: $publicStorage\n";
} else {
    echo "Storage link does NOT exist!\n";
    echo "Run: php artisan storage:link\n";
}

// Test a simple hero lookup
echo "\n=== Testing Hero Lookup ===\n";
$hero = DB::table('heroes')->first();
if ($hero) {
    echo "First hero: " . $hero->name . " (ID: " . $hero->id . ")\n";
} else {
    echo "No heroes found!\n";
}

echo "\n=== Testing Build Insert ===\n";
// Try to insert a test build to see if there are any errors
try {
    // Get first user
    $user = DB::table('users')->first();
    if ($user && $hero) {
        echo "Attempting to create test build...\n";
        echo "User ID: " . $user->id . "\n";
        echo "Hero ID: " . $hero->id . "\n";

        // Check what columns exist in user_builds
        $columns = DB::select("SHOW COLUMNS FROM user_builds");
        echo "\nColumns in user_builds table:\n";
        foreach ($columns as $col) {
            echo "- " . $col->Field . " (" . $col->Type . ")\n";
        }
    } else {
        echo "No users or heroes found for testing\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}

echo "\n=== DONE ===\n";
echo "DELETE THIS FILE AFTER TESTING!\n";
echo "</pre>";
