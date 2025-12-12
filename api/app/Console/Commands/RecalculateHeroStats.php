<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\HeroStatsCalculator;
use Illuminate\Console\Command;

/**
 * Recalculate hero usage statistics from community guides.
 * 
 * Usage: php artisan stats:recalculate
 */
class RecalculateHeroStats extends Command
{
    protected $signature = 'stats:recalculate 
                            {--hero= : Recalculate only for specific hero ID}';

    protected $description = 'Recalculate hero usage statistics from community guides';

    public function handle(HeroStatsCalculator $calculator): int
    {
        $this->info('📊 Recalculating hero statistics...');

        if ($heroId = $this->option('hero')) {
            $hero = \App\Models\Hero::find($heroId);
            if (!$hero) {
                $this->error("Hero with ID {$heroId} not found.");
                return self::FAILURE;
            }

            $calculator->calculateForHero($hero);
            $this->info("✅ Statistics recalculated for {$hero->name}");
        } else {
            $count = $calculator->calculateAll();
            $this->info("✅ Statistics recalculated for {$count} heroes");
        }

        return self::SUCCESS;
    }
}
