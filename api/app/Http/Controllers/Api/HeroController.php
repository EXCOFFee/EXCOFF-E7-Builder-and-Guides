<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\HeroResource;
use App\Http\Resources\HeroSummaryResource;
use App\Models\Hero;
use App\Services\HeroBuildStatsService;
use App\Support\BuildCache;
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

    private const LOCALES = ['en', 'es', 'pt', 'ko', 'ja', 'zh'];

    /**
     * List all heroes with optional filters.
     * 
     * GET /api/v1/heroes
     * Query params: element, class, rarity, search
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        // Build cache key from query parameters (v2: summary columns only)
        $cacheKey = 'heroes:index:v2:' . md5(json_encode($request->query()));

        $heroes = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($request) {
            $query = Hero::query()->select(HeroSummaryResource::COLUMNS);

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

        return HeroSummaryResource::collection($heroes);
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
    public function buildStats(Request $request, string $slug, HeroBuildStatsService $service): JsonResponse
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

        // Solo idiomas de la web: un lang libre crearía una entrada de caché por valor
        $lang = in_array($request->query('lang'), self::LOCALES, true) ? $request->query('lang') : 'en';

        // 5 min; la clave cambia sola cuando se guarda o borra una build (BuildCache)
        $stats = Cache::remember(
            BuildCache::key("hero-stats:{$slug}:{$lang}"),
            300,
            fn () => $service->forHero($hero, $lang)
        );

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
