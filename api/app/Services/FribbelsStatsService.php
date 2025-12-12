<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Hero;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service to fetch hero builds from Fribbels Hero Library API
 * and calculate usage statistics.
 */
class FribbelsStatsService
{
    private const API_URL = 'https://krivpfvxi0.execute-api.us-west-2.amazonaws.com/dev/getBuilds';

    /**
     * Mapping of set codes to readable names.
     */
    private const SET_NAMES = [
        'set_speed' => 'Speed',
        'set_att' => 'Attack',
        'set_cri' => 'Critical',
        'set_cri_dmg' => 'Destruction',
        'set_def' => 'Defense',
        'set_max_hp' => 'Health',
        'set_acc' => 'Hit',
        'set_res' => 'Resist',
        'set_lifesteal' => 'Lifesteal',
        'set_counter' => 'Counter',
        'set_immunity' => 'Immunity',
        'set_rage' => 'Rage',
        'set_unity' => 'Unity',
        'set_penetrate' => 'Penetration',
        'set_revenge' => 'Revenge',
        'set_injury' => 'Injury',
        'set_torrent' => 'Torrent',
        'set_protection' => 'Protection',
    ];

    /**
     * Fetch builds for a hero from Fribbels API.
     */
    public function fetchBuildsForHero(string $heroName): array
    {
        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept' => 'application/json, text/plain, */*',
                    'Origin' => 'https://fribbels.github.io',
                    'Referer' => 'https://fribbels.github.io/',
                ])
                ->withBody($heroName, 'text/plain')
                ->post(self::API_URL);

            if (!$response->successful()) {
                Log::warning("Fribbels API failed for hero: {$heroName}", [
                    'status' => $response->status(),
                ]);
                return [];
            }

            return $response->json('data') ?? [];
        } catch (\Exception $e) {
            Log::error("Fribbels API error for hero: {$heroName}", [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Calculate usage statistics for a hero.
     */
    public function calculateStatsForHero(Hero $hero): array
    {
        $builds = $this->fetchBuildsForHero($hero->name);

        if (empty($builds)) {
            return [
                'popular_sets' => [],
                'popular_artifacts' => [],
                'avg_stats' => null,
                'builds_count' => 0,
            ];
        }

        return [
            'popular_sets' => $this->calculatePopularSets($builds),
            'popular_artifacts' => $this->calculatePopularArtifacts($builds),
            'avg_stats' => $this->calculateAverageStats($builds),
            'builds_count' => count($builds),
        ];
    }

    /**
     * Calculate popular set combinations.
     */
    private function calculatePopularSets(array $builds): array
    {
        $setComboCounts = [];
        $totalBuilds = count($builds);

        foreach ($builds as $build) {
            $sets = $build['sets'] ?? [];
            if (empty($sets)) {
                continue;
            }

            // Convert sets to full set notation
            $fullSets = $this->convertToFullSets($sets);
            $setComboKey = json_encode($fullSets);

            if (!isset($setComboCounts[$setComboKey])) {
                $setComboCounts[$setComboKey] = [
                    'sets' => $fullSets,
                    'count' => 0,
                ];
            }
            $setComboCounts[$setComboKey]['count']++;
        }

        // Sort by count descending
        usort($setComboCounts, fn($a, $b) => $b['count'] - $a['count']);

        // Take top 5 and calculate percentage
        $topSets = array_slice($setComboCounts, 0, 5);

        return array_map(function ($combo) use ($totalBuilds) {
            return [
                'sets' => array_map(
                    fn($code) => self::SET_NAMES[$code] ?? $code,
                    $combo['sets']
                ),
                'set_codes' => $combo['sets'],
                'count' => $combo['count'],
                'percentage' => round(($combo['count'] / $totalBuilds) * 100, 1),
            ];
        }, $topSets);
    }

    /**
     * Convert set piece counts to full sets array.
     */
    private function convertToFullSets(array $sets): array
    {
        $fullSets = [];

        foreach ($sets as $setCode => $pieceCount) {
            // 4-piece sets
            if (in_array($setCode, ['set_speed', 'set_att', 'set_cri_dmg', 'set_lifesteal', 'set_counter', 'set_rage', 'set_revenge', 'set_injury'])) {
                $setCount = intdiv($pieceCount, 4);
            } else {
                // 2-piece sets
                $setCount = intdiv($pieceCount, 2);
            }

            for ($i = 0; $i < $setCount; $i++) {
                $fullSets[] = $setCode;
            }
        }

        sort($fullSets);
        return $fullSets;
    }

    /**
     * Calculate popular artifacts.
     */
    private function calculatePopularArtifacts(array $builds): array
    {
        $artifactCounts = [];
        $totalBuilds = count($builds);

        foreach ($builds as $build) {
            $artifactCode = $build['artifactCode'] ?? null;
            if (!$artifactCode) {
                continue;
            }

            if (!isset($artifactCounts[$artifactCode])) {
                $artifactCounts[$artifactCode] = 0;
            }
            $artifactCounts[$artifactCode]++;
        }

        // Sort by count descending
        arsort($artifactCounts);

        // Take top 5
        $topArtifacts = array_slice($artifactCounts, 0, 5, true);

        return array_map(function ($code, $count) use ($totalBuilds) {
            return [
                'code' => $code,
                'count' => $count,
                'percentage' => round(($count / $totalBuilds) * 100, 1),
            ];
        }, array_keys($topArtifacts), $topArtifacts);
    }

    /**
     * Calculate average stats from builds.
     */
    private function calculateAverageStats(array $builds): array
    {
        $statSums = [
            'atk' => 0,
            'def' => 0,
            'hp' => 0,
            'spd' => 0,
            'crit_chance' => 0,
            'crit_dmg' => 0,
            'eff' => 0,
            'res' => 0,
        ];

        $count = count($builds);

        foreach ($builds as $build) {
            $statSums['atk'] += (int) ($build['atk'] ?? 0);
            $statSums['def'] += (int) ($build['def'] ?? 0);
            $statSums['hp'] += (int) ($build['hp'] ?? 0);
            $statSums['spd'] += (int) ($build['spd'] ?? 0);
            $statSums['crit_chance'] += (int) ($build['chc'] ?? 0);
            $statSums['crit_dmg'] += (int) ($build['chd'] ?? 0);
            $statSums['eff'] += (int) ($build['eff'] ?? 0);
            $statSums['res'] += (int) ($build['efr'] ?? 0);
        }

        return [
            'atk' => (int) round($statSums['atk'] / $count),
            'def' => (int) round($statSums['def'] / $count),
            'hp' => (int) round($statSums['hp'] / $count),
            'spd' => (int) round($statSums['spd'] / $count),
            'crit_chance' => (int) round($statSums['crit_chance'] / $count),
            'crit_dmg' => (int) round($statSums['crit_dmg'] / $count),
            'eff' => (int) round($statSums['eff'] / $count),
            'res' => (int) round($statSums['res'] / $count),
        ];
    }

    /**
     * Sync stats for a hero and update the database.
     */
    public function syncHeroStats(Hero $hero): bool
    {
        $stats = $this->calculateStatsForHero($hero);

        if ($stats['builds_count'] === 0) {
            return false;
        }

        $hero->update([
            'popular_sets' => $stats['popular_sets'],
            'popular_artifacts' => $stats['popular_artifacts'],
            'avg_stats' => $stats['avg_stats'],
            'guides_count' => $stats['builds_count'],
            'stats_updated_at' => now(),
        ]);

        return true;
    }

    /**
     * Sync stats for all heroes.
     */
    public function syncAllHeroStats(?callable $progressCallback = null): int
    {
        $heroes = Hero::all();
        $synced = 0;

        foreach ($heroes as $hero) {
            $success = $this->syncHeroStats($hero);
            if ($success) {
                $synced++;
            }

            if ($progressCallback) {
                $progressCallback($hero, $success);
            }

            // Rate limiting to avoid overwhelming the API
            usleep(500000); // 500ms delay to avoid rate limiting
        }

        return $synced;
    }
}
