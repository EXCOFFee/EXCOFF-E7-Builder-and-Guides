<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Guide;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Comment Controller - Nested comments (RF-12).
 * Supports 1-level deep replies.
 */
class CommentController extends Controller
{
    /**
     * Get all comments for a guide (with replies).
     * 
     * GET /api/v1/guides/{guide}/comments
     */
    public function index(Guide $guide): AnonymousResourceCollection
    {
        $comments = Comment::where('guide_id', $guide->id)
            ->whereNull('parent_id') // Only top-level comments
            ->with(['user', 'replies.user'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return CommentResource::collection($comments);
    }

    /**
     * Create a new comment or reply.
     * 
     * POST /api/v1/guides/{guide}/comments
     * Body: { "content": "...", "parent_id": null }
     */
    public function store(Request $request, Guide $guide): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|max:2000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        // If replying, verify parent belongs to same guide
        if ($validated['parent_id']) {
            $parent = Comment::find($validated['parent_id']);
            if ($parent->guide_id !== $guide->id) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'INVALID_PARENT',
                        'message' => 'Parent comment does not belong to this guide',
                    ],
                ], 422);
            }

            // Prevent nested replies (only 1 level deep)
            if ($parent->parent_id !== null) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'NESTING_LIMIT',
                        'message' => 'Cannot reply to a reply. Only 1 level of nesting allowed.',
                    ],
                ], 422);
            }
        }

        $comment = Comment::create([
            'user_id' => $request->user()->id,
            'guide_id' => $guide->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'content' => $validated['content'],
        ]);

        return response()->json([
            'success' => true,
            'data' => new CommentResource($comment->load('user')),
        ], 201);
    }
}
