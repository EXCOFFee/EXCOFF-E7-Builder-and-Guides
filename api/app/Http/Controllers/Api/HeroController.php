<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\HeroResource;
use App\Models\Hero;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Hero API Controller - Read-only endpoints for wiki data.
 */
class HeroController extends Controller
{
    /**
     * List all heroes with optional filters.
     * 
     * GET /api/v1/heroes
     * Query params: element, class, rarity, search
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Hero::query();

        // Filter by element
        if ($request->has('element')) {
            $query->where('element', $request->element);
        }

        // Filter by class
        if ($request->has('class')) {
            $query->where('class', $request->class);
        }

        // Filter by rarity
        if ($request->has('rarity')) {
            $query->where('rarity', $request->rarity);
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $heroes = $query->orderBy('name')->paginate(50);

        return HeroResource::collection($heroes);
    }

    /**
     * Get a single hero by slug with their guides.
     * 
     * GET /api/v1/heroes/{slug}
     */
    public function show(string $slug): HeroResource|JsonResponse
    {
        $hero = Hero::where('slug', $slug)
            ->with([
                'guides' => function ($query) {
                    $query->where('is_published', true)
                        ->orderByDesc('vote_score')
                        ->limit(10);
                }
            ])
            ->first();

        if (!$hero) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'HERO_NOT_FOUND',
                    'message' => "Hero with slug '{$slug}' not found",
                ],
            ], 404);
        }

        return new HeroResource($hero);
    }
}
