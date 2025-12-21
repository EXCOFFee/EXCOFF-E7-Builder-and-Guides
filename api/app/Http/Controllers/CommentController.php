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
     * Maximum comments to return per request (KISS: simple limit)
     */
    private const MAX_COMMENTS = 50;
    /**
     * Get comments for a build
     */
    public function getBuildComments(UserBuild $build): JsonResponse
    {
        $comments = Comment::with(['user', 'replies.user'])
            ->where('build_id', $build->id)
            ->whereNull('parent_id')
            ->orderBy('created_at', 'desc')
            ->take(self::MAX_COMMENTS)
            ->get()
            ->map(fn ($comment) => $this->formatComment($comment));

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
            ->take(self::MAX_COMMENTS)
            ->get()
            ->map(fn ($comment) => $this->formatComment($comment));

        return response()->json($comments);
    }

    /**
     * Store a new comment
     */
    public function store(Request $request): JsonResponse
    {
        // Support both parameter naming conventions
        $type = $request->input('type') ?? $request->input('commentable_type');
        $id = $request->input('id') ?? $request->input('commentable_id');

        if (!$type || !$id) {
            return response()->json(['error' => 'Type and ID are required'], 422);
        }

        if (!in_array($type, ['build', 'guide'])) {
            return response()->json(['error' => 'Invalid type'], 422);
        }

        $content = $request->input('content');
        if (!$content || empty(trim(strip_tags($content)))) {
            return response()->json(['error' => 'Comment content cannot be empty'], 422);
        }

        // Validate content is text only (strip HTML)
        $cleanContent = strip_tags($content);

        $comment = Comment::create([
            'user_id' => $request->user()->id,
            'build_id' => $type === 'build' ? $id : null,
            'guide_id' => $type === 'guide' ? $id : null,
            'content' => $cleanContent,
            'is_anonymous' => $request->boolean('is_anonymous', false),
            'parent_id' => $request->input('parent_id'),
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
