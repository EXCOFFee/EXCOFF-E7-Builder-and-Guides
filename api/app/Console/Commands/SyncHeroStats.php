<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Hero;
use App\Services\FribbelsStatsService;
use Illuminate\Console\Command;

/**
 * Sync hero usage statistics from Fribbels Hero Library API.
 * 
 * Usage: 
 *   php artisan stats:sync                    # Sync all heroes
 *   php artisan stats:sync --hero=1           # Sync specific hero by ID
 *   php artisan stats:sync --name="Arbiter Vildred"  # Sync by name
 */
class SyncHeroStats extends Command
{
    protected $signature = 'stats:sync 
                            {--hero= : Sync specific hero by ID}
                            {--name= : Sync specific hero by name}';

    protected $description = 'Synchronize hero usage statistics from Fribbels Hero Library';

    public function handle(FribbelsStatsService $statsService): int
    {
        $this->info('📊 Syncing hero usage statistics from Fribbels...');
        $this->newLine();

        // Single hero by ID
        if ($heroId = $this->option('hero')) {
            return $this->syncSingleHero($statsService, Hero::find($heroId));
        }

        // Single hero by name
        if ($heroName = $this->option('name')) {
            return $this->syncSingleHero(
                $statsService,
                Hero::where('name', $heroName)->first()
            );
        }

        // All heroes
        return $this->syncAllHeroes($statsService);
    }

    private function syncSingleHero(FribbelsStatsService $statsService, ?Hero $hero): int
    {
        if (!$hero) {
            $this->error('Hero not found.');
            return self::FAILURE;
        }

        $this->info("Syncing stats for {$hero->name}...");

        $success = $statsService->syncHeroStats($hero);

        if ($success) {
            $this->info("✅ Stats synced for {$hero->name}");
            $this->table(
                ['Sets', 'Artifacts', 'Avg Speed', 'Builds'],
                [
                    [
                        count($hero->popular_sets ?? []) . ' combos',
                        count($hero->popular_artifacts ?? []) . ' artifacts',
                        ($hero->avg_stats['spd'] ?? 'N/A') . ' SPD',
                        $hero->guides_count . ' builds',
                    ]
                ]
            );
        } else {
            $this->warn("⚠️ No builds found for {$hero->name}");
        }

        return self::SUCCESS;
    }

    private function syncAllHeroes(FribbelsStatsService $statsService): int
    {
        // Only sync heroes that don't have builds yet
        $heroes = Hero::where(function ($q) {
            $q->whereNull('guides_count')
                ->orWhere('guides_count', 0);
        })->get();

        $alreadySynced = Hero::where('guides_count', '>', 0)->count();

        $this->info("Found {$heroes->count()} heroes without builds data");
        $this->info("({$alreadySynced} heroes already have builds data)");

        if ($heroes->count() === 0) {
            $this->info("✅ All heroes already have builds data!");
            return self::SUCCESS;
        }

        $bar = $this->output->createProgressBar($heroes->count());
        $bar->start();

        $synced = 0;
        $failed = 0;
        $retryCount = 0;
        $maxRetries = 2;

        foreach ($heroes as $hero) {
            $success = false;

            // Try up to maxRetries times
            for ($attempt = 0; $attempt <= $maxRetries && !$success; $attempt++) {
                if ($attempt > 0) {
                    $retryCount++;
                    usleep(2000000); // 2s delay before retry
                }

                $success = $statsService->syncHeroStats($hero);
            }

            if ($success) {
                $synced++;
            } else {
                $failed++;
            }

            $bar->advance();

            // Rate limiting - 1 second delay between heroes
            usleep(1000000); // 1s delay
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("✅ Sync complete!");
        $this->table(
            ['Status', 'Count'],
            [
                ['Synced this run', $synced],
                ['No builds found', $failed],
                ['Retries performed', $retryCount],
                ['Total with builds', $alreadySynced + $synced],
            ]
        );

        return self::SUCCESS;
    }
}
