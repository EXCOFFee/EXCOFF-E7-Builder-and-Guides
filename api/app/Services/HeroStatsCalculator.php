<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Guide;
use App\Models\Hero;
use Illuminate\Support\Facades\DB;

/**
 * Service to calculate hero usage statistics from community guides.
 * 
 * Calculates:
 * - Popular sets (% of guides using each set)
 * - Popular artifacts (% of guides recommending each artifact)
 * - Average stats (mean of all guide target stats)
 */
class HeroStatsCalculator
{
    /**
     * Recalculate statistics for a specific hero.
     */
    public function calculateForHero(Hero $hero): void
    {
        $guides = Guide::where('hero_id', $hero->id)
            ->where('is_published', true)
            ->get();

        if ($guides->isEmpty()) {
            $hero->update([
                'popular_sets' => null,
                'popular_artifacts' => null,
                'avg_stats' => null,
                'guides_count' => 0,
                'stats_updated_at' => now(),
            ]);
            return;
        }

        $totalGuides = $guides->count();

        // Calculate popular sets
        $setCounts = [];
        foreach ($guides as $guide) {
            $sets = $guide->sets ?? [];
            foreach ($sets as $set) {
                $setCounts[$set] = ($setCounts[$set] ?? 0) + 1;
            }
        }

        $popularSets = [];
        arsort($setCounts);
        foreach ($setCounts as $set => $count) {
            $popularSets[] = [
                'set' => $set,
                'count' => $count,
                'usage' => round(($count / $totalGuides) * 100, 1),
            ];
        }

        // Calculate popular artifacts
        $artifactCounts = [];
        foreach ($guides as $guide) {
            if ($guide->artifact_id) {
                $artifactCounts[$guide->artifact_id] = ($artifactCounts[$guide->artifact_id] ?? 0) + 1;
            }
            // Count alternative artifacts too
            $altArtifacts = $guide->alt_artifacts ?? [];
            foreach ($altArtifacts as $artifactId) {
                $artifactCounts[$artifactId] = ($artifactCounts[$artifactId] ?? 0) + 0.5; // Weight alternatives less
            }
        }

        $popularArtifacts = [];
        arsort($artifactCounts);
        $rank = 0;
        foreach ($artifactCounts as $artifactId => $count) {
            if ($rank >= 5)
                break; // Top 5 artifacts
            $popularArtifacts[] = [
                'artifact_id' => $artifactId,
                'count' => (int) $count,
                'usage' => round(($count / $totalGuides) * 100, 1),
            ];
            $rank++;
        }

        // Calculate average stats
        $statsSum = [
            'atk' => 0,
            'def' => 0,
            'hp' => 0,
            'spd' => 0,
            'crit_chance' => 0,
            'crit_dmg' => 0,
            'eff' => 0,
            'res' => 0,
        ];
        $statsCounts = array_fill_keys(array_keys($statsSum), 0);

        foreach ($guides as $guide) {
            $stats = $guide->stats ?? [];
            foreach ($statsSum as $stat => $value) {
                if (isset($stats[$stat]) && $stats[$stat] > 0) {
                    $statsSum[$stat] += $stats[$stat];
                    $statsCounts[$stat]++;
                }
            }
        }

        $avgStats = [];
        foreach ($statsSum as $stat => $sum) {
            if ($statsCounts[$stat] > 0) {
                $avgStats[$stat] = (int) round($sum / $statsCounts[$stat]);
            }
        }

        // Update hero
        $hero->update([
            'popular_sets' => $popularSets,
            'popular_artifacts' => $popularArtifacts,
            'avg_stats' => $avgStats,
            'guides_count' => $totalGuides,
            'stats_updated_at' => now(),
        ]);
    }

    /**
     * Recalculate statistics for all heroes.
     */
    public function calculateAll(): int
    {
        $heroes = Hero::all();
        $count = 0;

        foreach ($heroes as $hero) {
            $this->calculateForHero($hero);
            $count++;
        }

        return $count;
    }
}
