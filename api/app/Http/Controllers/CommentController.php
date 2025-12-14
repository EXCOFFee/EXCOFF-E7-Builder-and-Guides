<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\UserBuild;
use App\Models\Guide;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CommentController extends Controller
{
    /**
     * Get comments for a build
     */
    public function getBuildComments(UserBuild $build): JsonResponse
    {
        $comments = Comment::with(['user', 'replies.user'])
            ->where('build_id', $build->id)
            ->whereNull('parent_id')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($comment) {
                return $this->formatComment($comment);
            });

        return response()->json($comments);
    }

    /**
     * Get comments for a guide
     */
    public function getGuideComments(Guide $guide): JsonResponse
    {
        $comments = Comment::with(['user', 'replies.user'])
            ->where('guide_id', $guide->id)
            ->whereNull('parent_id')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($comment) {
                return $this->formatComment($comment);
            });

        return response()->json($comments);
    }

    /**
     * Store a new comment
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:build,guide',
            'id' => 'required|integer',
            'content' => 'required|string|max:2000',
            'is_anonymous' => 'nullable|boolean',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        // Validate content is text only (strip HTML)
        $content = strip_tags($validated['content']);
        if (empty(trim($content))) {
            return response()->json(['error' => 'Comment content cannot be empty'], 422);
        }

        $comment = Comment::create([
            'user_id' => $request->user()->id,
            'build_id' => $validated['type'] === 'build' ? $validated['id'] : null,
            'guide_id' => $validated['type'] === 'guide' ? $validated['id'] : null,
            'content' => $content,
            'is_anonymous' => $validated['is_anonymous'] ?? false,
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        $comment->load('user');

        return response()->json($this->formatComment($comment), 201);
    }

    /**
     * Delete a comment (owner or admin only)
     */
    public function destroy(Request $request, Comment $comment): JsonResponse
    {
        $user = $request->user();

        // Check if user is owner or admin
        if ($comment->user_id !== $user->id && !$user->is_admin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully']);
    }

    /**
     * Format comment for API response
     */
    private function formatComment(Comment $comment): array
    {
        return [
            'id' => $comment->id,
            'content' => $comment->content,
            'is_anonymous' => $comment->is_anonymous,
            'user' => $comment->is_anonymous ? null : [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'avatar' => $comment->user->avatar,
            ],
            'created_at' => $comment->created_at,
            'replies' => $comment->replies->map(function ($reply) {
                return $this->formatComment($reply);
            }),
        ];
    }
}
