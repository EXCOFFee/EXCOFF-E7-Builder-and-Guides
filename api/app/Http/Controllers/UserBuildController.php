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
     * Get all builds for a hero
     */
    public function indexByHero(Hero $hero): JsonResponse
    {
        $builds = UserBuild::with(['user', 'artifact'])
            ->where('hero_id', $hero->id)
            ->where('status', 'published')
            ->orderBy('likes', 'desc')
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
        ]);

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
