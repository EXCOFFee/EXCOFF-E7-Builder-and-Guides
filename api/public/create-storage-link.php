<?php
// Script to create storage symlink on Hostinger
// DELETE THIS FILE AFTER USE

echo "<pre>";
echo "=== Creating Storage Link ===\n\n";

// Define paths
$publicPath = __DIR__;
$storagePath = dirname(__DIR__) . '/storage/app/public';
$linkPath = $publicPath . '/storage';

echo "Public path: $publicPath\n";
echo "Storage path: $storagePath\n";
echo "Link will be created at: $linkPath\n\n";

// Check if storage path exists
if (!file_exists($storagePath)) {
    echo "Creating storage/app/public directory...\n";
    if (mkdir($storagePath, 0755, true)) {
        echo "Created successfully!\n";
    } else {
        echo "ERROR: Failed to create directory\n";
    }
}

// Check if link already exists
if (file_exists($linkPath)) {
    if (is_link($linkPath)) {
        echo "Storage link already exists and is a symlink.\n";
    } else {
        echo "WARNING: /public/storage exists but is not a symlink.\n";
        echo "You may need to delete it first.\n";
    }
} else {
    echo "Attempting to create symlink...\n";

    // Try symlink first
    if (function_exists('symlink')) {
        if (@symlink($storagePath, $linkPath)) {
            echo "SUCCESS: Symlink created!\n";
        } else {
            echo "Symlink failed. Trying alternative method...\n";

            // Alternative: Create a PHP redirect script instead
            $redirectContent = '<?php
// Redirect to actual storage
$path = str_replace("/storage/", "/storage/app/public/", $_SERVER["REQUEST_URI"]);
$file = dirname(__DIR__) . $path;
if (file_exists($file)) {
    $mime = mime_content_type($file);
    header("Content-Type: " . $mime);
    readfile($file);
    exit;
}
http_response_code(404);
';
            // Create storage directory for redirects
            if (!is_dir($linkPath)) {
                mkdir($linkPath, 0755, true);
            }
            file_put_contents($linkPath . '/index.php', $redirectContent);
            echo "Created redirect script as alternative.\n";
        }
    } else {
        echo "ERROR: symlink function not available.\n";
        echo "You'll need to create the symlink manually via File Manager.\n";
        echo "\n";
        echo "=== MANUAL INSTRUCTIONS ===\n";
        echo "1. Go to File Manager in Hostinger\n";
        echo "2. Navigate to public_html/public/\n";
        echo "3. Create a folder called 'storage'\n";
        echo "4. Or contact Hostinger support to create a symlink\n";
    }
}

// Also create builds directory if needed
$buildsPath = $storagePath . '/builds';
if (!file_exists($buildsPath)) {
    echo "\nCreating builds directory...\n";
    if (mkdir($buildsPath, 0755, true)) {
        echo "Builds directory created: $buildsPath\n";
    }
}

// Create guides directory if needed
$guidesPath = $storagePath . '/guides';
if (!file_exists($guidesPath)) {
    echo "Creating guides directory...\n";
    if (mkdir($guidesPath, 0755, true)) {
        echo "Guides directory created: $guidesPath\n";
    }
}

// Create guilds directory if needed
$guildsPath = $storagePath . '/guilds';
if (!file_exists($guildsPath)) {
    echo "Creating guilds directory...\n";
    if (mkdir($guildsPath, 0755, true)) {
        echo "Guilds directory created: $guildsPath\n";
    }
}

echo "\n=== DONE ===\n";
echo "DELETE THIS FILE (create-storage-link.php) AFTER TESTING!\n";
echo "</pre>";
