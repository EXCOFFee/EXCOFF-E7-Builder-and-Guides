<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\UserBuild;
use App\Models\Hero;
use App\Services\ImageService;
use App\Support\BuildCache;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;

class UserBuildController extends Controller
{
    /**
     * Cache duration in seconds (5 minutes for builds list)
     */
    private const CACHE_TTL = 300;

    public function __construct(
        private readonly ImageService $imageService
    ) {}
    /**
     * Get all builds (for /builds page)
     */
    public function index(Request $request): JsonResponse
    {
        // Clave por parámetros; BuildCache la renueva cuando se guarda o borra una build
        $cacheKey = BuildCache::key('list:' . md5(json_encode($request->query())));

        // Cache the paginated results for 5 minutes
        $builds = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($request) {
            $query = UserBuild::with(['user:id,name,avatar', 'artifact', 'hero'])
                ->where('status', 'published');

            // Search by title or hero name
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', '%' . $search . '%')
                        ->orWhereHas('hero', function ($q) use ($search) {
                            $q->where('name', 'like', '%' . $search . '%');
                        });
                });
            }

            // Filter by hero (slug): el link "ver todas las builds" de la ficha del héroe
            if ($request->filled('hero')) {
                $query->whereHas('hero', fn ($q) => $q->where('slug', $request->input('hero')));
            }

            // Filter by hero element
            if ($request->has('element') && !empty($request->element)) {
                $query->whereHas('hero', function ($q) use ($request) {
                    $q->where('element', $request->element);
                });
            }

            // Filter by hero class
            if ($request->has('class') && !empty($request->class)) {
                $query->whereHas('hero', function ($q) use ($request) {
                    $q->where('class', $request->class);
                });
            }

            // Filter by hero rarity
            if ($request->has('rarity') && !empty($request->rarity)) {
                $query->whereHas('hero', function ($q) use ($request) {
                    $q->where('rarity', $request->rarity);
                });
            }

            // Filter by language
            if ($request->has('language') && $request->language !== 'all') {
                $query->where('language', $request->language);
            }

            // Filter by primary set
            if ($request->has('primary_set') && !empty($request->primary_set)) {
                $query->where('primary_set', $request->primary_set);
            }

            // Filter by secondary set
            if ($request->has('secondary_set') && !empty($request->secondary_set)) {
                $query->where('secondary_set', $request->secondary_set);
            }

            // Filter by minimum stats (supports: min_speed, min_atk, min_hp, min_crit, min_cdmg, min_eff)
            // Claves tal como las guarda el formulario de builds en min_stats
            $statFilters = ['speed' => 'spd', 'atk' => 'atk', 'hp' => 'hp', 'crit' => 'crit_chance', 'cdmg' => 'crit_dmg', 'eff' => 'eff'];
            foreach ($statFilters as $param => $jsonKey) {
                $minKey = "min_{$param}";
                if ($request->has($minKey) && is_numeric($request->$minKey)) {
                    $minValue = (int) $request->$minKey;
                    // Filter builds where min_stats->jsonKey >= minValue
                    $query->whereRaw("JSON_EXTRACT(min_stats, '$.{$jsonKey}') >= ?", [$minValue]);
                }
            }

            // Tags (pros o contras): ?tags[]=a&tags[]=b exige todos; ?exclude_tags[]=c descarta.
            // Se ignoran los IDs que no están en el catálogo.
            foreach (['tags' => false, 'exclude_tags' => true] as $param => $without) {
                foreach ($this->tagFilter($request, $param) as $tagId => $field) {
                    $query->withTag($field, $tagId, $without);
                }
            }

            // Extended sorting options: newest, likes, views
            $sortBy = $request->input('sort', 'newest');
            $sortOrder = $request->input('order') === 'asc' ? 'asc' : 'desc';
            
            switch ($sortBy) {
                case 'likes':
                    $query->orderBy('likes', $sortOrder);
                    break;
                case 'views':
                    $query->orderBy('views', $sortOrder);
                    break;
                case 'newest':
                default:
                    $query->orderBy('created_at', $sortOrder);
                    break;
            }

            return $query->paginate(20);
        });

        // Localize artifacts (done outside cache since lang may vary)
        $lang = $request->query('lang', 'en');
        $builds->getCollection()->transform(function ($build) use ($lang) {
            if ($build->artifact) {
                $build->artifact->name = $this->getLocalizedArtifactName($build->artifact, $lang);
            }
            return $build;
        });

        return response()->json($builds);
    }

    /**
     * Get all builds for a hero
     */
    public function indexByHero(Request $request, Hero $hero): JsonResponse
    {
        $query = UserBuild::with(['user:id,name,avatar', 'artifact'])
            ->where('hero_id', $hero->id)
            ->where('status', 'published');

        // Filter by language
        if ($request->has('language') && $request->input('language') !== 'all') {
            $query->where('language', $request->input('language'));
        }

        $builds = $query->orderBy('likes', 'desc')
            ->paginate(20);

        // Localize artifacts
        $lang = $request->query('lang', 'en');
        $builds->getCollection()->transform(function ($build) use ($lang) {
            if ($build->artifact) {
                $build->artifact->name = $this->getLocalizedArtifactName($build->artifact, $lang);
            }
            return $build;
        });

        return response()->json($builds);
    }

    /**
     * Show a specific build
     */
    /**
     * Show a specific build
     */
    public function show(Request $request, UserBuild $build): JsonResponse
    {
        $build->load(['user:id,name,avatar', 'hero', 'artifact']);
        $build->increment('views');

        // Localize artifact
        $lang = $request->query('lang', 'en');
        if ($build->artifact) {
            $build->artifact->name = $this->getLocalizedArtifactName($build->artifact, $lang);
        }

        // Add synergy and counter heroes data
        $response = $build->toArray();
        $viewer = $this->optionalUser($request);
        $response['is_owner'] = $viewer !== null && (int) $build->user_id === (int) $viewer->id;
        $response['synergy_heroes_list'] = $build->synergy_heroes_list;
        $response['counter_heroes_list'] = $build->counter_heroes_list;

        return response()->json($response);
    }

    private function getLocalizedArtifactName($artifact, string $lang): string
    {
        return match ($lang) {
            'ko' => $artifact->name_ko ?? $artifact->name,
            'ja' => $artifact->name_ja ?? $artifact->name,
            'zh' => $artifact->name_zh ?? $artifact->name,
            'es' => $artifact->name_es ?? $artifact->name,
            'pt' => $artifact->name_pt ?? $artifact->name,
            default => $artifact->name,
        };
    }

    /**
     * Store a new build
     */
    public function store(Request $request): JsonResponse
    {
        $this->normalizeTags($request);

        $validated = $request->validate([
            'hero_id' => 'required|exists:heroes,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'min_stats' => 'nullable',
            'primary_set' => 'nullable|string|max:50',
            'secondary_set' => 'nullable|string|max:50',
            'artifact_id' => 'nullable|exists:artifacts,id',
            'synergy_heroes' => 'nullable',
            'counter_heroes' => 'nullable',
            'language' => 'nullable|string|max:5',
            'is_anonymous' => 'nullable|boolean',
            'skill_1' => 'nullable|integer|min:0|max:7',
            'skill_2' => 'nullable|integer|min:0|max:7',
            'skill_3' => 'nullable|integer|min:0|max:7',
            // Tier ratings (D=1 to S=5)
            'rating_pve' => 'nullable|integer|min:1|max:5',
            'rating_arena' => 'nullable|integer|min:1|max:5',
            'rating_gw' => 'nullable|integer|min:1|max:5',
            'rating_rta' => 'nullable|integer|min:1|max:5',
            'reason_pve' => 'nullable|string|max:255',
            'reason_arena' => 'nullable|string|max:255',
            'reason_gw' => 'nullable|string|max:255',
            'reason_rta' => 'nullable|string|max:255',
        ] + $this->tagRules() + ImageService::rules());
        unset($validated['images']);

        // Parse min_stats if JSON string
        if (isset($validated['min_stats']) && is_string($validated['min_stats'])) {
            $validated['min_stats'] = json_decode($validated['min_stats'], true);
        }


        // Parse synergy/counter heroes if JSON string
        if (isset($validated['synergy_heroes']) && is_string($validated['synergy_heroes'])) {
            $validated['synergy_heroes'] = json_decode($validated['synergy_heroes'], true);
        }
        if (isset($validated['counter_heroes']) && is_string($validated['counter_heroes'])) {
            $validated['counter_heroes'] = json_decode($validated['counter_heroes'], true);
        }

        $validated['language'] = $validated['language'] ?? 'en';
        // Convert '1'/'0' string to boolean (FormData sends as string)
        $validated['is_anonymous'] = filter_var($validated['is_anonymous'] ?? false, FILTER_VALIDATE_BOOLEAN);

        // Handle image uploads using ImageService (422 if any image is rejected)
        $validated['images'] = $this->imageService->storeUploads($request->file('images'), 'builds');

        $build = $request->user()->builds()->create($validated);

        return response()->json($build, 201);
    }

    /**
     * Update a build
     */
    public function update(Request $request, UserBuild $build): JsonResponse
    {
        // Check ownership
        if ((int) $build->user_id !== (int) $request->user()->id && !$request->user()->is_admin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Parse min_stats if JSON string
        $minStats = $request->input('min_stats');
        if (is_string($minStats)) {
            $minStats = json_decode($minStats, true);
        }

        $this->normalizeTags($request);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'primary_set' => 'nullable|string|max:50',
            'secondary_set' => 'nullable|string|max:50',
            'artifact_id' => 'nullable|exists:artifacts,id',
            'synergy_heroes' => 'nullable',
            'counter_heroes' => 'nullable',
            'status' => 'sometimes|in:draft,published,archived',
            'skill_1' => 'nullable|integer|min:0|max:7',
            'skill_2' => 'nullable|integer|min:0|max:7',
            'skill_3' => 'nullable|integer|min:0|max:7',
            // Anonymous and language options
            'is_anonymous' => 'nullable',
            'language' => 'nullable|string|max:5',
            // Tier ratings (D=1 to S=5)
            'rating_pve' => 'nullable|integer|min:1|max:5',
            'rating_arena' => 'nullable|integer|min:1|max:5',
            'rating_gw' => 'nullable|integer|min:1|max:5',
            'rating_rta' => 'nullable|integer|min:1|max:5',
            'reason_pve' => 'nullable|string|max:255',
            'reason_arena' => 'nullable|string|max:255',
            'reason_gw' => 'nullable|string|max:255',
            'reason_rta' => 'nullable|string|max:255',
        ] + $this->tagRules() + ImageService::rules());
        unset($validated['images']);


        // Parse synergy/counter heroes if JSON string
        if (isset($validated['synergy_heroes']) && is_string($validated['synergy_heroes'])) {
            $validated['synergy_heroes'] = json_decode($validated['synergy_heroes'], true);
        }
        if (isset($validated['counter_heroes']) && is_string($validated['counter_heroes'])) {
            $validated['counter_heroes'] = json_decode($validated['counter_heroes'], true);
        }
        
        // Convert '1'/'0' string to boolean (FormData sends as string)
        if (isset($validated['is_anonymous'])) {
            $validated['is_anonymous'] = filter_var($validated['is_anonymous'], FILTER_VALIDATE_BOOLEAN);
        }

        // New uploads (validated by content) + images already on this server; external URLs are dropped
        $imagePaths = array_merge(
            $this->imageService->storeUploads($request->file('images'), 'builds'),
            $this->imageService->filterOwnedUrls($request->input('image_urls'))
        );

        // Si el cliente manda las imágenes (image_urls y/o archivos), esa lista reemplaza a la anterior,
        // aunque quede vacía: así el formulario puede quitar todas. Sin esos campos, no se tocan.
        if ($request->has('image_urls') || $request->hasFile('images')) {
            $validated['images'] = array_slice($imagePaths, 0, ImageService::MAX_IMAGES);
        }

        if ($minStats !== null) {
            $validated['min_stats'] = $minStats;
        }

        $build->update($validated);

        return response()->json($build);
    }

    /**
     * Pros/contras llegan como JSON (FormData) o como array, con objetos {id, note} o IDs sueltos
     * (formato viejo). Se dejan como lista de {id, note?} antes de validar.
     */
    private function normalizeTags(Request $request): void
    {
        foreach (['pro_tags', 'con_tags'] as $field) {
            if (!$request->has($field)) {
                continue;
            }

            $tags = $request->input($field);
            if (is_string($tags) && $tags !== '') {
                $decoded = json_decode($tags, true);
                // JSON roto: queda el texto y la regla "array" responde 422 (antes borraba los tags)
                if (!is_array($decoded)) {
                    continue;
                }
                $tags = $decoded;
            }

            $request->merge([$field => is_array($tags)
                ? array_values(array_map(fn ($tag) => is_string($tag) ? ['id' => $tag] : $tag, $tags))
                : null]);
        }
    }

    /** Solo IDs del catálogo (config/build_tags.php, generado desde el de la web) */
    private function tagRules(): array
    {
        $max = config('build_tags.max_per_side');
        $noteMax = config('build_tags.max_note_length');

        return [
            'pro_tags' => "nullable|array|max:{$max}",
            'pro_tags.*' => 'array',
            'pro_tags.*.id' => ['required', 'string', 'distinct', Rule::in(config('build_tags.pro'))],
            'pro_tags.*.note' => "nullable|string|max:{$noteMax}",
            'con_tags' => "nullable|array|max:{$max}",
            'con_tags.*' => 'array',
            'con_tags.*.id' => ['required', 'string', 'distinct', Rule::in(config('build_tags.con'))],
            'con_tags.*.note' => "nullable|string|max:{$noteMax}",
        ];
    }

    /**
     * IDs de tags de un parámetro de la lista (array o separados por coma) => campo donde buscarlos.
     *
     * @return array<string, string>
     */
    private function tagFilter(Request $request, string $param): array
    {
        $ids = $request->input($param, []);
        $ids = is_array($ids) ? $ids : explode(',', (string) $ids);
        $fields = [];

        foreach (array_slice(array_filter($ids, 'is_string'), 0, 10) as $id) {
            $id = trim($id);
            if (in_array($id, config('build_tags.pro'), true)) {
                $fields[$id] = 'pro_tags';
            } elseif (in_array($id, config('build_tags.con'), true)) {
                $fields[$id] = 'con_tags';
            }
        }

        return $fields;
    }

    /**
     * Delete a build
     */
    public function destroy(Request $request, UserBuild $build): JsonResponse
    {
        // Check ownership
        if ((int) $build->user_id !== (int) $request->user()->id && !$request->user()->is_admin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $build->delete();

        return response()->json(['message' => 'Build deleted successfully']);
    }
}
