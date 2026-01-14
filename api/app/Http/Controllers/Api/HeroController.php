<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\HeroResource;
use App\Models\Hero;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

/**
 * Hero API Controller - Read-only endpoints for wiki data.
 */
class HeroController extends Controller
{
    /**
     * Cache duration in seconds (1 hour)
     */
    private const CACHE_TTL = 3600;

    /**
     * List all heroes with optional filters.
     * 
     * GET /api/v1/heroes
     * Query params: element, class, rarity, search
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        // Build cache key from query parameters
        $cacheKey = 'heroes:index:' . md5(json_encode($request->query()));
        
        $heroes = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($request) {
            $query = Hero::query();

            // Filter by element
            if ($request->has('element')) {
                $query->where('element', $request->element);
            }

            // Filter by class
            if ($request->has('class')) {
                $query->where('class', $request->class);
            }

            // Filter by rarity
            if ($request->has('rarity')) {
                $query->where('rarity', $request->rarity);
            }

            // Search by name
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            return $query->orderBy('name')->paginate(500);
        });

        return HeroResource::collection($heroes);
    }

    /**
     * Get a single hero by slug with their guides.
     * 
     * GET /api/v1/heroes/{slug}
     */
    public function show(string $slug): HeroResource|JsonResponse
    {
        $cacheKey = "heroes:show:{$slug}";
        
        $hero = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($slug) {
            return Hero::where('slug', $slug)
                ->with([
                    'guides' => function ($query) {
                        $query->where('is_published', true)
                            ->orderByDesc('vote_score')
                            ->limit(10);
                    }
                ])
                ->first();
        });

        if (!$hero) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'HERO_NOT_FOUND',
                    'message' => "Hero with slug '{$slug}' not found",
                ],
            ], 404);
        }

        return new HeroResource($hero);
    }

    /**
     * Get aggregated build statistics for a hero.
     * 
     * GET /api/v1/heroes/{slug}/stats
     * Returns: set frequencies, artifact popularity, average tier ratings
     */
    public function buildStats(Request $request, string $slug): JsonResponse
    {
        $hero = Hero::where('slug', $slug)->first();

        if (!$hero) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'HERO_NOT_FOUND',
                    'message' => "Hero with slug '{$slug}' not found",
                ],
            ], 404);
        }

        $lang = $request->query('lang', 'en');
        $cacheKey = "heroes:stats:{$slug}:{$lang}";
        
        $stats = Cache::remember($cacheKey, 300, function () use ($hero, $lang) { // 5 min cache
            $builds = \App\Models\UserBuild::where('hero_id', $hero->id)
                ->get();

            $totalBuilds = $builds->count();

            if ($totalBuilds === 0) {
                return [
                    'total_builds' => 0,
                    'primary_sets' => [],
                    'secondary_sets' => [],
                    'artifacts' => [],
                    'average_ratings' => null,
                ];
            }

            // Count primary sets
            $primarySets = $builds->groupBy('primary_set')
                ->map(fn($group, $set) => [
                    'set' => $set,
                    'count' => $group->count(),
                    'percentage' => round(($group->count() / $totalBuilds) * 100, 1),
                ])
                ->sortByDesc('count')
                ->values()
                ->toArray();

            // Count secondary sets
            $secondarySets = $builds->filter(fn($b) => !empty($b->secondary_set))
                ->groupBy('secondary_set')
                ->map(fn($group, $set) => [
                    'set' => $set,
                    'count' => $group->count(),
                    'percentage' => round(($group->count() / $totalBuilds) * 100, 1),
                ])
                ->sortByDesc('count')
                ->values()
                ->toArray();

            // Count artifacts
            $artifacts = $builds->filter(fn($b) => !empty($b->artifact_id))
                ->groupBy('artifact_id')
                ->map(function($group, $artifactId) use ($totalBuilds, $lang) {
                    $artifact = \App\Models\Artifact::find($artifactId);
                    
                    $name = 'Unknown';
                    if ($artifact) {
                        $name = match ($lang) {
                            'ko' => $artifact->name_ko ?? $artifact->name,
                            'ja' => $artifact->name_ja ?? $artifact->name,
                            'zh' => $artifact->name_zh ?? $artifact->name,
                            'es' => $artifact->name_es ?? $artifact->name,
                            'pt' => $artifact->name_pt ?? $artifact->name,
                            default => $artifact->name,
                        };
                    }

                    return [
                        'artifact_id' => $artifactId,
                        'name' => $name,
                        'icon' => $artifact ? $artifact->icon : null,
                        'count' => $group->count(),
                        'percentage' => round(($group->count() / $totalBuilds) * 100, 1),
                    ];
                })
                ->sortByDesc('count')
                ->values()
                ->take(5)
                ->toArray();

            // Calculate average tier ratings
            $ratingFields = ['rating_pve', 'rating_arena', 'rating_gw', 'rating_rta'];
            $averageRatings = [];
            
            foreach ($ratingFields as $field) {
                $validRatings = $builds->filter(fn($b) => !is_null($b->$field));
                if ($validRatings->count() > 0) {
                    $avg = $validRatings->avg($field);
                    $averageRatings[str_replace('rating_', '', $field)] = round($avg, 1);
                }
            }

            // Calculate general average
            $allRatings = [];
            foreach ($ratingFields as $field) {
                $allRatings = array_merge($allRatings, $builds->pluck($field)->filter()->toArray());
            }
            if (count($allRatings) > 0) {
                $averageRatings['general'] = round(array_sum($allRatings) / count($allRatings), 1);
            }

            // Count synergy heroes across all builds
            $synergyHeroCounts = [];
            foreach ($builds as $build) {
                if (!empty($build->synergy_heroes)) {
                    foreach ($build->synergy_heroes as $item) {
                        $heroId = is_array($item) && isset($item['id']) ? $item['id'] : $item;
                        if ($heroId) {
                            $synergyHeroCounts[$heroId] = ($synergyHeroCounts[$heroId] ?? 0) + 1;
                        }
                    }
                }
            }
            arsort($synergyHeroCounts);
            $topSynergyHeroes = array_slice($synergyHeroCounts, 0, 5, true);
            
            $synergyHeroes = [];
            foreach ($topSynergyHeroes as $heroId => $count) {
                $heroData = \App\Models\Hero::find($heroId);
                if ($heroData) {
                    $synergyHeroes[] = [
                        'hero_id' => $heroId,
                        'name' => $heroData->name,
                        'slug' => $heroData->slug,
                        'image_url' => $heroData->image_url,
                        'element' => $heroData->element,
                        'count' => $count,
                        'percentage' => round(($count / $totalBuilds) * 100, 1),
                    ];
                }
            }

            // Count counter heroes across all builds
            $counterHeroCounts = [];
            foreach ($builds as $build) {
                if (!empty($build->counter_heroes)) {
                    foreach ($build->counter_heroes as $item) {
                        $heroId = is_array($item) && isset($item['id']) ? $item['id'] : $item;
                        if ($heroId) {
                            $counterHeroCounts[$heroId] = ($counterHeroCounts[$heroId] ?? 0) + 1;
                        }
                    }
                }
            }
            arsort($counterHeroCounts);
            $topCounterHeroes = array_slice($counterHeroCounts, 0, 5, true);
            
            $counterHeroes = [];
            foreach ($topCounterHeroes as $heroId => $count) {
                $heroData = \App\Models\Hero::find($heroId);
                if ($heroData) {
                    $counterHeroes[] = [
                        'hero_id' => $heroId,
                        'name' => $heroData->name,
                        'slug' => $heroData->slug,
                        'image_url' => $heroData->image_url,
                        'element' => $heroData->element,
                        'count' => $count,
                        'percentage' => round(($count / $totalBuilds) * 100, 1),
                    ];
                }
            }

            // Calculate priority stats - average values for each stat across all builds
            $statSums = [
                'atk' => ['sum' => 0, 'count' => 0],
                'hp' => ['sum' => 0, 'count' => 0],
                'spd' => ['sum' => 0, 'count' => 0],
                'def' => ['sum' => 0, 'count' => 0],
                'chc' => ['sum' => 0, 'count' => 0],  // crit chance
                'chd' => ['sum' => 0, 'count' => 0],  // crit damage
                'eff' => ['sum' => 0, 'count' => 0],  // effectiveness
                'efr' => ['sum' => 0, 'count' => 0],  // effect resistance
            ];
            
            $statLabels = [
                'atk' => 'Attack',
                'hp' => 'HP',
                'spd' => 'Speed',
                'def' => 'Defense',
                'chc' => 'Crit Chance',
                'chd' => 'Crit Damage',
                'eff' => 'Effectiveness',
                'efr' => 'Effect Resistance',
            ];
            
            foreach ($builds as $build) {
                if (!empty($build->min_stats) && is_array($build->min_stats)) {
                    foreach ($build->min_stats as $stat => $value) {
                        if (isset($statSums[$stat]) && !empty($value) && $value > 0) {
                            $statSums[$stat]['sum'] += $value;
                            $statSums[$stat]['count']++;
                        }
                    }
                }
            }
            
            // Calculate averages - always show all 8 stats
            $priorityStats = [];
            foreach ($statSums as $stat => $data) {
                if ($data['count'] > 0) {
                    $avg = $data['sum'] / $data['count'];
                } else {
                    $avg = 0; // No data for this stat
                }
                
                // Format based on stat type
                if (in_array($stat, ['chc', 'chd', 'eff', 'efr'])) {
                    // Percentage stats
                    $formattedValue = round($avg, 1) . '%';
                } elseif ($stat === 'spd') {
                    // Speed - whole number
                    $formattedValue = (string)round($avg);
                } else {
                    // HP, ATK, DEF - format with comma
                    $formattedValue = number_format(round($avg));
                }
                $priorityStats[] = [
                    'stat' => $stat,
                    'label' => $statLabels[$stat] ?? $stat,
                    'count' => $data['count'],
                    'average_value' => round($avg, 1),
                    'formatted_value' => $formattedValue,
                ];
            }
            
            
            // Sort by count (most common stats first) - show all stats
            usort($priorityStats, fn($a, $b) => $b['count'] - $a['count']);

            // Count pro tags across all builds
            $proTagCounts = [];
            foreach ($builds as $build) {
                if (!empty($build->pro_tags) && is_array($build->pro_tags)) {
                    foreach ($build->pro_tags as $tag) {
                        $tagId = is_array($tag) ? ($tag['id'] ?? $tag['tag'] ?? $tag) : $tag;
                        if ($tagId && is_string($tagId)) {
                            $proTagCounts[$tagId] = ($proTagCounts[$tagId] ?? 0) + 1;
                        }
                    }
                }
            }
            arsort($proTagCounts);
            $topProTags = array_slice($proTagCounts, 0, 5, true);
            $proTags = [];
            foreach ($topProTags as $tagId => $count) {
                $proTags[] = [
                    'tag' => $tagId,
                    'count' => $count,
                    'percentage' => round(($count / $totalBuilds) * 100, 1),
                ];
            }

            // Count con tags across all builds
            $conTagCounts = [];
            foreach ($builds as $build) {
                if (!empty($build->con_tags) && is_array($build->con_tags)) {
                    foreach ($build->con_tags as $tag) {
                        $tagId = is_array($tag) ? ($tag['id'] ?? $tag['tag'] ?? $tag) : $tag;
                        if ($tagId && is_string($tagId)) {
                            $conTagCounts[$tagId] = ($conTagCounts[$tagId] ?? 0) + 1;
                        }
                    }
                }
            }
            arsort($conTagCounts);
            $topConTags = array_slice($conTagCounts, 0, 5, true);
            $conTags = [];
            foreach ($topConTags as $tagId => $count) {
                $conTags[] = [
                    'tag' => $tagId,
                    'count' => $count,
                    'percentage' => round(($count / $totalBuilds) * 100, 1),
                ];
            }

            return [
                'total_builds' => $totalBuilds,
                'primary_sets' => $primarySets,
                'secondary_sets' => $secondarySets,
                'artifacts' => $artifacts,
                'average_ratings' => !empty($averageRatings) ? $averageRatings : null,
                'synergy_heroes' => $synergyHeroes,
                'counter_heroes' => $counterHeroes,
                'priority_stats' => $priorityStats,
                'pro_tags' => $proTags,
                'con_tags' => $conTags,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
