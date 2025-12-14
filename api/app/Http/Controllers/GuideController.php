<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Guide;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class GuideController extends Controller
{
    /**
     * List guides with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Guide::with(['user'])
            ->where('is_published', true);

        // Filter by category
        if ($request->has('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }

        // Filter by hero
        if ($request->has('hero_id')) {
            $query->where('hero_id', $request->input('hero_id'));
        }

        // Filter by language
        if ($request->has('language') && $request->input('language') !== 'all') {
            $query->where('language', $request->input('language'));
        }

        // Search
        if ($request->has('search')) {
            $query->where('title', 'like', "%{$request->input('search')}%");
        }

        $guides = $query->orderBy('vote_score', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($guides);
    }

    /**
     * Show a guide
     */
    public function show(Guide $guide): JsonResponse
    {
        $guide->load(['user']);
        $guide->increment('views');

        return response()->json($guide);
    }

    /**
     * Store a new guide
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|in:general,pve,rta,guild_war,arena',
            'hero_id' => 'nullable|exists:heroes,id',
            'description' => 'nullable|string',
            'gameplay_content' => 'required|string',
            'video_url' => 'nullable|url',
            'images' => 'nullable|array',
            'language' => 'nullable|string|max:5',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);
        $validated['user_id'] = $request->user()->id;
        $validated['is_published'] = true;
        $validated['language'] = $validated['language'] ?? 'en';

        // Extract video thumbnail if YouTube URL provided
        if (!empty($validated['video_url'])) {
            $validated['video_platform'] = $this->detectVideoPlatform($validated['video_url']);
            $validated['video_thumbnail'] = $this->extractThumbnail($validated['video_url'], $validated['video_platform']);
        }

        $guide = Guide::create($validated);

        return response()->json($guide, 201);
    }

    /**
     * Update a guide
     */
    public function update(Request $request, Guide $guide): JsonResponse
    {
        // Check ownership
        if ($guide->user_id !== $request->user()->id && !$request->user()->isModerator()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'category' => 'sometimes|in:general,pve,rta,guild_war,arena',
            'description' => 'nullable|string',
            'gameplay_content' => 'sometimes|string',
            'video_url' => 'nullable|url',
            'images' => 'nullable|array',
            'is_published' => 'sometimes|boolean',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $guide->title) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);
        }

        if (!empty($validated['video_url']) && $validated['video_url'] !== $guide->video_url) {
            $validated['video_platform'] = $this->detectVideoPlatform($validated['video_url']);
            $validated['video_thumbnail'] = $this->extractThumbnail($validated['video_url'], $validated['video_platform']);
        }

        $guide->update($validated);

        return response()->json($guide);
    }

    /**
     * Delete a guide
     */
    public function destroy(Request $request, Guide $guide): JsonResponse
    {
        // Check ownership
        if ($guide->user_id !== $request->user()->id && !$request->user()->isModerator()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $guide->delete();

        return response()->json(['message' => 'Guide deleted successfully']);
    }

    /**
     * Detect video platform from URL
     */
    private function detectVideoPlatform(string $url): string
    {
        if (str_contains($url, 'youtube.com') || str_contains($url, 'youtu.be')) {
            return 'youtube';
        }
        if (str_contains($url, 'twitch.tv')) {
            return 'twitch';
        }
        if (str_contains($url, 'bilibili.com')) {
            return 'bilibili';
        }
        return 'other';
    }

    /**
     * Extract video thumbnail
     */
    private function extractThumbnail(string $url, string $platform): ?string
    {
        if ($platform === 'youtube') {
            // Extract video ID
            preg_match('/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/', $url, $matches);
            if (!empty($matches[1])) {
                return "https://img.youtube.com/vi/{$matches[1]}/hqdefault.jpg";
            }
        }
        return null;
    }
}
