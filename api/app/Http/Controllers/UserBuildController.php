<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\UserBuild;
use App\Models\Hero;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserBuildController extends Controller
{
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

        // Filter by language
        if ($request->has('language') && $request->language !== 'all') {
            $query->where('language', $request->language);
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

        return response()->json($build);
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
            'min_stats' => 'nullable|array',
            'primary_set' => 'nullable|string|max:50',
            'secondary_set' => 'nullable|string|max:50',
            'artifact_id' => 'nullable|exists:artifacts,id',
            'synergy_heroes' => 'nullable|array',
            'counter_heroes' => 'nullable|array',
            'images' => 'nullable|array',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'language' => 'nullable|string|max:5',
            'is_anonymous' => 'nullable|boolean',
        ]);

        $validated['language'] = $validated['language'] ?? 'en';
        $validated['is_anonymous'] = $validated['is_anonymous'] ?? false;

        // Handle image uploads
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('builds', 'public');
                $imagePaths[] = '/storage/' . $path;
            }
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
        if ($build->user_id !== $request->user()->id && !$request->user()->isModerator()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'min_stats' => 'nullable|array',
            'primary_set' => 'nullable|string|max:50',
            'secondary_set' => 'nullable|string|max:50',
            'artifact_id' => 'nullable|exists:artifacts,id',
            'synergy_heroes' => 'nullable|array',
            'counter_heroes' => 'nullable|array',
            'images' => 'nullable|array',
            'status' => 'sometimes|in:draft,published,archived',
        ]);

        $build->update($validated);

        return response()->json($build);
    }

    /**
     * Delete a build
     */
    public function destroy(Request $request, UserBuild $build): JsonResponse
    {
        // Check ownership
        if ($build->user_id !== $request->user()->id && !$request->user()->isModerator()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $build->delete();

        return response()->json(['message' => 'Build deleted successfully']);
    }
}
