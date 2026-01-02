<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Guide;
use App\Models\UserBuild;
use App\Models\BuildRating;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class VoteController extends Controller
{
    /**
     * Toggle like on a guide (like/unlike)
     */
    public function voteGuide(Request $request, Guide $guide): JsonResponse
    {
        $userId = $request->user()->id;

        // Check if user already liked
        $existingLike = DB::table('votes')
            ->where('user_id', $userId)
            ->where('votable_type', Guide::class)
            ->where('votable_id', $guide->id)
            ->first();

        if ($existingLike) {
            // Remove like (unlike)
            DB::table('votes')
                ->where('id', $existingLike->id)
                ->delete();
            $guide->decrement('likes');
            $liked = false;
        } else {
            // Add like
            DB::table('votes')->insert([
                'user_id' => $userId,
                'votable_type' => Guide::class,
                'votable_id' => $guide->id,
                'value' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $guide->increment('likes');
            $liked = true;
        }

        return response()->json([
            'likes' => $guide->fresh()->likes,
            'liked' => $liked,
        ]);
    }

    /**
     * Toggle like on a build (like/unlike)
     */
    public function voteBuild(Request $request, UserBuild $build): JsonResponse
    {
        $userId = $request->user()->id;

        // Check if user already liked
        $existingLike = DB::table('votes')
            ->where('user_id', $userId)
            ->where('votable_type', UserBuild::class)
            ->where('votable_id', $build->id)
            ->first();

        if ($existingLike) {
            // Remove like (unlike)
            DB::table('votes')
                ->where('id', $existingLike->id)
                ->delete();
            $build->decrement('likes');
            $liked = false;
        } else {
            // Add like
            DB::table('votes')->insert([
                'user_id' => $userId,
                'votable_type' => UserBuild::class,
                'votable_id' => $build->id,
                'value' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $build->increment('likes');
            $liked = true;
        }

        return response()->json([
            'likes' => $build->fresh()->likes,
            'liked' => $liked,
        ]);
    }

    /**
     * Rate a build (1-5 stars)
     */
    public function rateBuild(Request $request, UserBuild $build): JsonResponse
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $userId = $request->user()->id;
        $rating = (int) $request->input('rating');

        // Update or create rating
        BuildRating::updateOrCreate(
            ['user_id' => $userId, 'build_id' => $build->id],
            ['rating' => $rating]
        );

        // Recalculate average rating
        $avgRating = BuildRating::where('build_id', $build->id)->avg('rating');
        $ratingCount = BuildRating::where('build_id', $build->id)->count();

        // Update build
        $build->update([
            'avg_rating' => round($avgRating, 2),
            'rating_count' => $ratingCount,
        ]);

        return response()->json([
            'avg_rating' => $build->fresh()->avg_rating,
            'rating_count' => $build->fresh()->rating_count,
            'user_rating' => $rating,
        ]);
    }

    /**
     * Get user's rating for a build
     */
    public function checkBuildRating(Request $request, UserBuild $build): JsonResponse
    {
        $userRating = null;
        if ($request->user()) {
            $rating = BuildRating::where('user_id', $request->user()->id)
                ->where('build_id', $build->id)
                ->first();
            $userRating = $rating?->rating;
        }

        return response()->json([
            'user_rating' => $userRating,
            'avg_rating' => $build->avg_rating,
            'rating_count' => $build->rating_count,
        ]);
    }

    /**
     * Check if user has liked a guide
     */
    public function checkGuideLike(Request $request, Guide $guide): JsonResponse
    {
        $liked = false;
        if ($request->user()) {
            $liked = DB::table('votes')
                ->where('user_id', $request->user()->id)
                ->where('votable_type', Guide::class)
                ->where('votable_id', $guide->id)
                ->exists();
        }

        return response()->json([
            'liked' => $liked,
            'likes' => $guide->likes,
        ]);
    }

    /**
     * Check if user has liked a build
     */
    public function checkBuildLike(Request $request, UserBuild $build): JsonResponse
    {
        $liked = false;
        if ($request->user()) {
            $liked = DB::table('votes')
                ->where('user_id', $request->user()->id)
                ->where('votable_type', UserBuild::class)
                ->where('votable_id', $build->id)
                ->exists();
        }

        return response()->json([
            'liked' => $liked,
            'likes' => $build->likes,
        ]);
    }
}
