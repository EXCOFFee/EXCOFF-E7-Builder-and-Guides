<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Hero;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

/**
 * Fix hero image URLs and data issues.
 * 
 * This command:
 * 1. Updates all hero image_url from _l.png to _su.png
 * 2. Fixes Zio's class from warrior to mage
 * 
 * Usage: php artisan heroes:fix-data
 */
class FixHeroData extends Command
{
    protected $signature = 'heroes:fix-data 
                            {--dry-run : Show what would be changed without making changes}';

    protected $description = 'Fix hero image URLs and data issues (Zio class, _l to _su images)';

    public function handle(): int
    {
        $this->info('🔧 Fixing hero data...');
        $this->newLine();

        $dryRun = $this->option('dry-run');
        
        $heroes = Hero::all();
        $imageFixed = 0;

        $bar = $this->output->createProgressBar($heroes->count());
        $bar->start();

        foreach ($heroes as $hero) {
            $changes = [];
            
            // Fix image URL: _l.png -> _su.png
            if ($hero->image_url && Str::contains($hero->image_url, '_l.png')) {
                $newUrl = str_replace('_l.png', '_su.png', $hero->image_url);
                $changes['image_url'] = $newUrl;
                $imageFixed++;
            }
            
            // Fix Zio's class: warrior -> mage
            if ($hero->slug === 'zio' && $hero->class !== 'mage') {
                $changes['class'] = 'mage';
                $this->newLine();
                $this->info("  ✓ Zio: class '{$hero->class}' -> 'mage'");
            }
            
            // Fix Hasol: class, element, hero_code and image
            if ($hero->slug === 'hasol') {
                $baseUrl = config('app.url');
                if ($hero->class !== 'knight') {
                    $changes['class'] = 'knight';
                    $this->newLine();
                    $this->info("  ✓ Hasol: class '{$hero->class}' -> 'knight'");
                }
                if ($hero->element !== 'dark') {
                    $changes['element'] = 'dark';
                    $this->newLine();
                    $this->info("  ✓ Hasol: element '{$hero->element}' -> 'dark'");
                }
                if ($hero->hero_code !== 'c3135') {
                    $changes['hero_code'] = 'c3135';
                    $this->newLine();
                    $this->info("  ✓ Hasol: hero_code '{$hero->hero_code}' -> 'c3135'");
                }
                // Always update image URL for Hasol
                $changes['image_url'] = "{$baseUrl}/images/heroes/c3135_su.png";
                $this->newLine();
                $this->info("  ✓ Hasol: image_url updated to use c3135_su.png");
            }
            
            // Apply changes
            if (!empty($changes)) {
                if (!$dryRun) {
                    $hero->update($changes);
                }
            }
            
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("📸 Image URLs fixed: {$imageFixed}");
        
        if ($dryRun) {
            $this->warn('⚠️  Dry run - no changes were made. Run without --dry-run to apply.');
        } else {
            $this->info('✅ All changes applied successfully!');
        }

        return self::SUCCESS;
    }
}
