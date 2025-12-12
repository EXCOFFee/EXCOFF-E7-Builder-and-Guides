<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Guide;
use App\Models\UserBuild;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class VoteController extends Controller
{
    /**
     * Vote on a guide
     */
    public function voteGuide(Request $request, Guide $guide): JsonResponse
    {
        $validated = $request->validate([
            'vote' => 'required|in:up,down',
        ]);

        $userId = $request->user()->id;
        $voteValue = $validated['vote'] === 'up' ? 1 : -1;

        // Check if user already voted
        $existingVote = DB::table('votes')
            ->where('user_id', $userId)
            ->where('votable_type', Guide::class)
            ->where('votable_id', $guide->id)
            ->first();

        if ($existingVote) {
            if ($existingVote->value === $voteValue) {
                // Remove vote if same
                DB::table('votes')
                    ->where('id', $existingVote->id)
                    ->delete();
                $guide->decrement('vote_score', $voteValue);
                $guide->decrement($voteValue > 0 ? 'likes' : 'vote_score');
            } else {
                // Change vote
                DB::table('votes')
                    ->where('id', $existingVote->id)
                    ->update(['value' => $voteValue]);
                $guide->increment('vote_score', $voteValue * 2);
            }
        } else {
            // Create new vote
            DB::table('votes')->insert([
                'user_id' => $userId,
                'votable_type' => Guide::class,
                'votable_id' => $guide->id,
                'value' => $voteValue,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $guide->increment('vote_score', $voteValue);
            if ($voteValue > 0) {
                $guide->increment('likes');
            }
        }

        return response()->json([
            'vote_score' => $guide->fresh()->vote_score,
            'likes' => $guide->fresh()->likes,
        ]);
    }

    /**
     * Vote on a build
     */
    public function voteBuild(Request $request, UserBuild $build): JsonResponse
    {
        $validated = $request->validate([
            'vote' => 'required|in:up,down',
        ]);

        $userId = $request->user()->id;
        $voteValue = $validated['vote'] === 'up' ? 1 : -1;

        // Check if user already voted
        $existingVote = DB::table('votes')
            ->where('user_id', $userId)
            ->where('votable_type', UserBuild::class)
            ->where('votable_id', $build->id)
            ->first();

        if ($existingVote) {
            if ($existingVote->value === $voteValue) {
                // Remove vote if same
                DB::table('votes')
                    ->where('id', $existingVote->id)
                    ->delete();
                $build->decrement('likes', $voteValue > 0 ? 1 : 0);
            } else {
                // Change vote
                DB::table('votes')
                    ->where('id', $existingVote->id)
                    ->update(['value' => $voteValue]);
                $build->increment('likes', $voteValue > 0 ? 2 : -2);
            }
        } else {
            // Create new vote
            DB::table('votes')->insert([
                'user_id' => $userId,
                'votable_type' => UserBuild::class,
                'votable_id' => $build->id,
                'value' => $voteValue,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            if ($voteValue > 0) {
                $build->increment('likes');
            }
        }

        return response()->json([
            'likes' => $build->fresh()->likes,
        ]);
    }
}
