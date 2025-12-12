<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guide;
use App\Models\Vote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Vote Controller - Handle guide upvotes/downvotes.
 * Implements RF-11: Unique vote per user per guide.
 */
class VoteController extends Controller
{
    /**
     * Cast or update a vote on a guide.
     * 
     * POST /api/v1/guides/{guide}/vote
     * Body: { "value": 1 } or { "value": -1 }
     */
    public function store(Request $request, Guide $guide): JsonResponse
    {
        $validated = $request->validate([
            'value' => 'required|integer|in:-1,1',
        ]);

        $userId = $request->user()->id;

        // Check if user already voted
        $existingVote = Vote::where('user_id', $userId)
            ->where('guide_id', $guide->id)
            ->first();

        if ($existingVote) {
            if ($existingVote->value === $validated['value']) {
                // Same vote = remove it (toggle behavior)
                $existingVote->delete();
                $message = 'Vote removed';
            } else {
                // Different vote = update it
                $existingVote->update(['value' => $validated['value']]);
                $message = 'Vote updated';
            }
        } else {
            // New vote
            Vote::create([
                'user_id' => $userId,
                'guide_id' => $guide->id,
                'value' => $validated['value'],
            ]);
            $message = 'Vote recorded';
        }

        // Recalculate vote score
        $guide->recalculateVoteScore();

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'vote_score' => $guide->vote_score,
            ],
        ]);
    }
}
