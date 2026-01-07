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
    public function buildStats(string $slug): JsonResponse
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

        $cacheKey = "heroes:stats:{$slug}";
        
        $stats = Cache::remember($cacheKey, 300, function () use ($hero) { // 5 min cache
            $builds = \App\Models\UserBuild::where('hero_id', $hero->id)
                ->where('status', 'approved')
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
                ->map(function($group, $artifactId) use ($totalBuilds) {
                    $artifact = \App\Models\Artifact::find($artifactId);
                    return [
                        'artifact_id' => $artifactId,
                        'name' => $artifact ? $artifact->name : 'Unknown',
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

            return [
                'total_builds' => $totalBuilds,
                'primary_sets' => $primarySets,
                'secondary_sets' => $secondarySets,
                'artifacts' => $artifacts,
                'average_ratings' => !empty($averageRatings) ? $averageRatings : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
