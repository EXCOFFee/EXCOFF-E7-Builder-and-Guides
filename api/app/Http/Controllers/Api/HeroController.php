<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\HeroResource;
use App\Http\Resources\HeroSummaryResource;
use App\Models\Hero;
use App\Models\UserBuild;
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

        // Builds publicadas por héroe: consulta chica aparte, así la lista (500 héroes, 1 h de caché)
        // no se recalcula cada vez que se guarda una build
        $counts = Cache::remember(BuildCache::key('hero-build-counts'), 300, fn () => UserBuild::published()
            ->selectRaw('hero_id, count(*) as total')
            ->groupBy('hero_id')
            ->pluck('total', 'hero_id')
            ->all());

        // Copia: con el store "array" el paginador cacheado es el mismo objeto en cada pedido
        $page = clone $heroes;
        $page->setCollection($heroes->getCollection()->map(
            fn (Hero $hero) => (clone $hero)->setAttribute('builds_count', (int) ($counts[$hero->id] ?? 0))
        ));

        return HeroSummaryResource::collection($page);
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
     * Stats mínimos de las builds publicadas del héroe, ordenados por stat.
     *
     * GET /api/heroes/{slug}/build-stat-distribution
     */
    public function buildStatDistribution(string $slug, HeroBuildStatsService $service): JsonResponse
    {
        $hero = Hero::where('slug', $slug)->firstOrFail();

        $data = Cache::remember(BuildCache::key("stat-distribution:{$slug}"), 300, fn () => $service->statDistribution($hero));

        return response()->json(['success' => true, 'data' => (object) $data]);
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
