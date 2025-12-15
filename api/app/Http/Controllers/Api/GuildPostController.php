<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GuildPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GuildPostController extends Controller
{
    /**
     * List all guild posts with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = GuildPost::query()->active()->with('user:id,name,avatar');

        // Filter by server
        if ($request->has('server') && $request->input('server') !== 'all') {
            $query->byServer($request->input('server'));
        }

        // Filter by language
        if ($request->has('language') && $request->input('language') !== 'all') {
            $query->byLanguage($request->input('language'));
        }

        // Filter by tags
        if ($request->has('tags')) {
            $tags = is_array($request->input('tags')) ? $request->input('tags') : explode(',', $request->input('tags'));
            $query->byTags($tags);
        }

        // Search by title
        if ($request->has('search') && $request->input('search')) {
            $query->search($request->input('search'));
        }

        $posts = $query->orderByDesc('created_at')->paginate(12);

        return response()->json([
            'success' => true,
            'data' => $posts->items(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    /**
     * Show a single guild post.
     */
    public function show(string $slug): JsonResponse
    {
        $post = GuildPost::where('slug', $slug)
            ->active()
            ->with('user:id,name,avatar')
            ->first();

        if (!$post) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'POST_NOT_FOUND',
                    'message' => 'Guild post not found',
                ],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $post,
        ]);
    }

    /**
     * Create a new guild post.
     */
    public function store(Request $request): JsonResponse
    {
        // Parse JSON strings that come from FormData
        $tags = $request->input('tags');
        if (is_string($tags)) {
            $tags = json_decode($tags, true) ?? [];
        }

        // Handle image URLs from form
        $imageUrls = $request->input('image_urls');
        if (is_string($imageUrls)) {
            $imageUrls = json_decode($imageUrls, true) ?? [];
        }

        // Validate first (without images, we'll handle them separately)
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'server' => 'required|in:' . implode(',', GuildPost::SERVERS),
            'language' => 'required|in:' . implode(',', GuildPost::LANGUAGES),
            'tags' => 'nullable',
        ]);

        // Process images - handle file uploads
        $imagePaths = [];
        
        // Handle uploaded files
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                if ($image->isValid()) {
                    $path = $image->store('guilds', 'public');
                    $imagePaths[] = '/storage/' . $path;
                }
            }
        }
        
        // Also add any image URLs provided
        if (!empty($imageUrls) && is_array($imageUrls)) {
            $imagePaths = array_merge($imagePaths, array_slice($imageUrls, 0, 5 - count($imagePaths)));
        }

        // Limit to 5 images max
        $imagePaths = array_slice($imagePaths, 0, 5);

        $post = GuildPost::create([
            'user_id' => $request->user()->id,
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'server' => $request->input('server'),
            'language' => $request->input('language'),
            'tags' => $tags ?? [],
            'images' => $imagePaths,
            'is_active' => true,
            'likes' => 0,
            'dislikes' => 0,
        ]);

        return response()->json([
            'success' => true,
            'data' => $post->load('user:id,name,avatar'),
        ], 201);
    }

    /**
     * Update a guild post.
     */
    public function update(Request $request, string $slug): JsonResponse
    {
        $post = GuildPost::where('slug', $slug)->first();

        // Check if user owns the post or is admin
        if (!$post || ($post->user_id !== $request->user()->id && !$request->user()->is_admin)) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'POST_NOT_FOUND',
                    'message' => 'Guild post not found or you are not authorized',
                ],
            ], 404);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|max:5000',
            'server' => 'sometimes|in:' . implode(',', GuildPost::SERVERS),
            'language' => 'sometimes|in:' . implode(',', GuildPost::LANGUAGES),
            'tags' => 'nullable|array',
            'tags.*' => 'in:' . implode(',', GuildPost::TAGS),
            'images' => 'nullable|array|max:5',
            'images.*' => 'string|url',
            'is_active' => 'sometimes|boolean',
        ]);

        $post->update($request->only([
            'title',
            'description',
            'server',
            'language',
            'tags',
            'images',
            'is_active'
        ]));

        return response()->json([
            'success' => true,
            'data' => $post->fresh()->load('user:id,name,avatar'),
        ]);
    }

    /**
     * Delete a guild post.
     */
    public function destroy(Request $request, string $slug): JsonResponse
    {
        $post = GuildPost::where('slug', $slug)->first();

        // Check if user owns the post or is admin
        if (!$post || ($post->user_id !== $request->user()->id && !$request->user()->is_admin)) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'POST_NOT_FOUND',
                    'message' => 'Guild post not found or you are not authorized',
                ],
            ], 404);
        }

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Guild post deleted successfully',
        ]);
    }

    /**
     * Get available servers, languages and tags for forms.
     */
    public function options(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'servers' => GuildPost::SERVERS,
                'languages' => GuildPost::LANGUAGES,
                'tags' => GuildPost::TAGS,
            ],
        ]);
    }
}
