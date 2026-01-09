<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\UserBuild;
use App\Models\Hero;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

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
        $query = UserBuild::with(['user', 'artifact', 'hero'])
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
        $statFilters = ['speed' => 'spd', 'atk' => 'atk', 'hp' => 'hp', 'crit' => 'crit', 'cdmg' => 'cdmg', 'eff' => 'eff'];
        foreach ($statFilters as $param => $jsonKey) {
            $minKey = "min_{$param}";
            if ($request->has($minKey) && is_numeric($request->$minKey)) {
                $minValue = (int) $request->$minKey;
                // Filter builds where min_stats->jsonKey >= minValue
                $query->whereRaw("JSON_EXTRACT(min_stats, '$.{$jsonKey}') >= ?", [$minValue]);
            }
        }

        // Sort by likes or date
        $sortBy = $request->input('sort', 'likes');
        $sortOrder = $request->input('order', 'desc');
        if ($sortBy === 'likes') {
            $query->orderBy('likes', $sortOrder);
        } else {
            $query->orderBy('created_at', $sortOrder);
        }

        $builds = $query->paginate(20);

        return response()->json($builds);
    }

    /**
     * Get all builds for a hero
     */
    public function indexByHero(Request $request, Hero $hero): JsonResponse
    {
        $query = UserBuild::with(['user', 'artifact'])
            ->where('hero_id', $hero->id)
            ->where('status', 'published');

        // Filter by language
        if ($request->has('language') && $request->input('language') !== 'all') {
            $query->where('language', $request->input('language'));
        }

        $builds = $query->orderBy('likes', 'desc')
            ->paginate(20);

        return response()->json($builds);
    }

    /**
     * Show a specific build
     */
    public function show(UserBuild $build): JsonResponse
    {
        $build->load(['user', 'hero', 'artifact']);
        $build->increment('views');

        // Add synergy and counter heroes data
        $response = $build->toArray();
        $response['synergy_heroes_list'] = $build->synergy_heroes_list;
        $response['counter_heroes_list'] = $build->counter_heroes_list;

        return response()->json($response);
    }

    /**
     * Store a new build
     */
    public function store(Request $request): JsonResponse
    {
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
            'images' => 'nullable|array',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
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
            // Pros/Cons tags (JSON string or array)
            'pro_tags' => 'nullable',
            'con_tags' => 'nullable',
        ]);

        // Parse min_stats if JSON string
        if (isset($validated['min_stats']) && is_string($validated['min_stats'])) {
            $validated['min_stats'] = json_decode($validated['min_stats'], true);
        }

        // Parse tags if JSON string
        if (isset($validated['pro_tags']) && is_string($validated['pro_tags'])) {
            $validated['pro_tags'] = json_decode($validated['pro_tags'], true);
        }
        if (isset($validated['con_tags']) && is_string($validated['con_tags'])) {
            $validated['con_tags'] = json_decode($validated['con_tags'], true);
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

        // Handle image uploads using ImageService (SOLID: dependency injection)
        $imagePaths = [];
        if ($request->hasFile('images')) {
            $result = $this->imageService->processMultiple(
                $request->file('images'),
                'builds',
                5
            );
            $imagePaths = $result['urls'];
        }
        $validated['images'] = $imagePaths;

        $build = $request->user()->builds()->create($validated);

        return response()->json($build, 201);
    }

    /**
     * Update a build
     */
    public function update(Request $request, UserBuild $build): JsonResponse
    {
        // Check ownership
        if ($build->user_id !== $request->user()->id && !$request->user()->is_admin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Parse min_stats if JSON string
        $minStats = $request->input('min_stats');
        if (is_string($minStats)) {
            $minStats = json_decode($minStats, true);
        }

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
            // Pros/Cons tags (JSON string or array)
            'pro_tags' => 'nullable',
            'con_tags' => 'nullable',
        ]);

        // Parse tags if JSON string
        if (isset($validated['pro_tags']) && is_string($validated['pro_tags'])) {
            $validated['pro_tags'] = json_decode($validated['pro_tags'], true);
        }
        if (isset($validated['con_tags']) && is_string($validated['con_tags'])) {
            $validated['con_tags'] = json_decode($validated['con_tags'], true);
        }

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

        // Handle new image uploads using ImageService
        $imagePaths = [];
        if ($request->hasFile('images')) {
            $result = $this->imageService->processMultiple(
                $request->file('images'),
                'builds',
                5
            );
            $imagePaths = $result['urls'];
        }
        
        // Add existing image URLs
        $imageUrls = $request->input('image_urls');
        if (is_string($imageUrls)) {
            $imageUrls = json_decode($imageUrls, true) ?? [];
        }
        if (!empty($imageUrls) && is_array($imageUrls)) {
            $imagePaths = array_merge($imagePaths, $imageUrls);
        }
        
        // Limit to 5 and update if any images
        if (!empty($imagePaths)) {
            $validated['images'] = array_slice($imagePaths, 0, 5);
        }
        
        if ($minStats !== null) {
            $validated['min_stats'] = $minStats;
        }

        $build->update($validated);

        return response()->json($build);
    }

    /**
     * Delete a build
     */
    public function destroy(Request $request, UserBuild $build): JsonResponse
    {
        // Check ownership
        if ($build->user_id !== $request->user()->id && !$request->user()->is_admin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $build->delete();

        return response()->json(['message' => 'Build deleted successfully']);
    }
}
