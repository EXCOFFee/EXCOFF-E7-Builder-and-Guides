<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Guide;
use App\Models\User;
use App\Models\UserBuild;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Perfil público, seguir usuarios y el feed de la gente seguida. Nada anónimo cuenta ni se
 * muestra acá (sería revelar de quién es), y el email nunca sale.
 */
class UserProfileController extends Controller
{
    /** Insignias: builds verificadas para "Builder verificado", likes recibidos para "Popular" */
    private const VERIFIED_BUILDER_MIN = 5;
    private const POPULAR_MIN_LIKES = 100;

    private const FEED_SIZE = 20;

    public function show(Request $request, User $user): JsonResponse
    {
        $builds = UserBuild::where('user_id', $user->id)->published()->where('is_anonymous', false);
        $guides = Guide::where('user_id', $user->id)->published()->where('is_anonymous', false);

        $stats = [
            'builds' => (clone $builds)->count(),
            'guides' => (clone $guides)->count(),
            'likes_received' => (int) (clone $builds)->sum('likes') + (int) (clone $guides)->sum('likes'),
            'verified_builds' => (clone $builds)->where('verification_status', 'verified')->count(),
            'followers' => $user->followers()->count(),
            'following' => $user->following()->count(),
        ];

        $viewer = $this->optionalUser($request);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'avatar' => $user->avatar,
            'created_at' => $user->created_at,
            'stats' => $stats,
            'badges' => array_keys(array_filter([
                'verified_builder' => $stats['verified_builds'] >= self::VERIFIED_BUILDER_MIN,
                'popular' => $stats['likes_received'] >= self::POPULAR_MIN_LIKES,
            ])),
            'is_self' => $viewer !== null && $viewer->id === $user->id,
            'is_following' => $viewer !== null && $viewer->following()->whereKey($user->id)->exists(),
        ]);
    }

    public function follow(Request $request, User $user): JsonResponse
    {
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'You cannot follow yourself.', 'errors' => ['user' => ['You cannot follow yourself.']]], 422);
        }
        $request->user()->following()->syncWithoutDetaching([$user->id]);

        return response()->json(['following' => true, 'followers' => $user->followers()->count()]);
    }

    public function unfollow(Request $request, User $user): JsonResponse
    {
        $request->user()->following()->detach($user->id);

        return response()->json(['following' => false, 'followers' => $user->followers()->count()]);
    }

    /** Lo último publicado (builds y guías, no anónimas) por la gente que sigue el usuario */
    public function feed(Request $request): JsonResponse
    {
        $ids = $request->user()->following()->pluck('users.id');
        if ($ids->isEmpty()) {
            return response()->json(['items' => []]);
        }

        $builds = UserBuild::with(['user:id,name,avatar', 'hero:id,name,slug,element,image_url'])
            ->whereIn('user_id', $ids)->published()->where('is_anonymous', false)
            ->latest()->limit(self::FEED_SIZE)
            ->get(['id', 'user_id', 'hero_id', 'title', 'primary_set', 'secondary_set', 'likes', 'verification_status', 'created_at'])
            ->map(fn (UserBuild $build) => ['type' => 'build'] + $build->toArray());

        $guides = Guide::with(['user:id,name,avatar', 'hero:id,name,slug'])
            ->whereIn('user_id', $ids)->published()->where('is_anonymous', false)
            ->latest()->limit(self::FEED_SIZE)
            ->get(['id', 'user_id', 'hero_id', 'title', 'slug', 'category', 'likes', 'created_at'])
            ->map(fn (Guide $guide) => ['type' => 'guide'] + $guide->toArray());

        $items = $builds->concat($guides)->sortByDesc('created_at')->take(self::FEED_SIZE)->values();

        return response()->json(['items' => $items]);
    }
}
