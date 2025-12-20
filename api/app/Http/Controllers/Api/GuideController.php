<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGuideRequest;
use App\Http\Resources\GuideResource;
use App\Models\Guide;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

/**
 * Guide API Controller - CRUD for community guides.
 */
class GuideController extends Controller
{
    /**
     * Cache duration in seconds (5 minutes for guide listings)
     */
    private const CACHE_TTL = 300;

    /**
     * List guides with advanced filtering (RF-13).
     * 
     * GET /api/v1/guides
     * Query params: hero_id, type, min_spd, min_hp, min_atk, sort
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        // Build cache key from query parameters
        $cacheKey = 'guides:index:' . md5(json_encode($request->query()));
        
        $guides = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($request) {
            $query = Guide::where('is_published', true)
                ->with(['hero', 'user', 'artifact']);

            // Filter by hero
            if ($request->has('hero_id')) {
                $query->where('hero_id', $request->hero_id);
            }

            // Filter by type
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            // Filter by category
            if ($request->has('category')) {
                $query->where('category', $request->category);
            }

            // Advanced stat filters (RF-13)
            if ($request->has('min_spd')) {
                $query->whereRaw("JSON_EXTRACT(stats, '$.spd') >= ?", [$request->min_spd]);
            }
            if ($request->has('min_hp')) {
                $query->whereRaw("JSON_EXTRACT(stats, '$.hp') >= ?", [$request->min_hp]);
            }
            if ($request->has('min_atk')) {
                $query->whereRaw("JSON_EXTRACT(stats, '$.atk') >= ?", [$request->min_atk]);
            }

            // Search by title
            if ($request->has('search') && !empty($request->search)) {
                $query->where('title', 'like', '%' . $request->search . '%');
            }

            // Sorting
            $sort = $request->get('sort', 'votes');
            match ($sort) {
                'newest' => $query->orderByDesc('created_at'),
                'oldest' => $query->orderBy('created_at'),
                default => $query->orderByDesc('vote_score'),
            };

            return $query->paginate(20);
        });

        return GuideResource::collection($guides);
    }

    /**
     * Create a new guide.
     * 
     * POST /api/v1/guides
     */
    public function store(StoreGuideRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Generate unique slug
        $baseSlug = Str::slug($validated['title'] . '-' . $validated['hero_id']);
        $slug = $baseSlug;
        $counter = 1;

        while (Guide::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        // Handle image upload
        $proofImage = null;
        if ($request->hasFile('proof_image')) {
            $proofImage = $request->file('proof_image')->store('guides', 'public');
        }

        $guide = Guide::create([
            'user_id' => $request->user()->id,
            'hero_id' => $validated['hero_id'],
            'artifact_id' => $validated['artifact_id'] ?? null,
            'alt_artifacts' => $validated['alt_artifacts'] ?? null,
            'title' => $validated['title'],
            'slug' => $slug,
            'type' => $validated['type'],
            'sets' => $validated['sets'],
            'stats' => $validated['stats'],
            'stat_priority' => $validated['stat_priority'] ?? null,
            'synergies' => $validated['synergies'] ?? null,
            'counters' => $validated['counters'] ?? null,
            'gameplay_content' => $validated['gameplay_content'],
            'proof_image' => $proofImage,
            'is_published' => true,
        ]);

        return response()->json([
            'success' => true,
            'data' => new GuideResource($guide->load(['hero', 'user', 'artifact'])),
        ], 201);
    }

    /**
     * Get a single guide by slug.
     * 
     * GET /api/v1/guides/{slug}
     */
    public function show(string $slug): GuideResource|JsonResponse
    {
        $guide = Guide::where('slug', $slug)
            ->where('is_published', true)
            ->with(['hero', 'user', 'artifact', 'comments.user', 'comments.replies.user'])
            ->first();

        if (!$guide) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'GUIDE_NOT_FOUND',
                    'message' => "Guide with slug '{$slug}' not found",
                ],
            ], 404);
        }

        return new GuideResource($guide);
    }

    /**
     * Update an existing guide.
     * 
     * PUT /api/v1/guides/{guide}
     */
    public function update(StoreGuideRequest $request, Guide $guide): JsonResponse
    {
        // Check ownership
        if ($guide->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'FORBIDDEN',
                    'message' => 'You can only edit your own guides',
                ],
            ], 403);
        }

        $validated = $request->validated();

        // Handle image upload
        if ($request->hasFile('proof_image')) {
            $validated['proof_image'] = $request->file('proof_image')->store('guides', 'public');
        }

        $guide->update($validated);

        return response()->json([
            'success' => true,
            'data' => new GuideResource($guide->fresh(['hero', 'user', 'artifact'])),
        ]);
    }

    /**
     * Delete a guide.
     * 
     * DELETE /api/v1/guides/{guide}
     */
    public function destroy(Request $request, Guide $guide): JsonResponse
    {
        // Check ownership
        if ($guide->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'FORBIDDEN',
                    'message' => 'You can only delete your own guides',
                ],
            ], 403);
        }

        $guide->delete();

        return response()->json([
            'success' => true,
            'message' => 'Guide deleted successfully',
        ]);
    }
}
