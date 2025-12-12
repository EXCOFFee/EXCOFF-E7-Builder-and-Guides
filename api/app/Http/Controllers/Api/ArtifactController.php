<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Artifact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Artifact API Controller - Read-only endpoints for artifact data.
 */
class ArtifactController extends Controller
{
    /**
     * List all artifacts with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Artifact::query();

        // Filter by rarity
        if ($request->has('rarity')) {
            $query->where('rarity', $request->rarity);
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $artifacts = $query->orderBy('name')->paginate(50);

        return response()->json($artifacts);
    }

    /**
     * Get a specific artifact.
     */
    public function show(Artifact $artifact): JsonResponse
    {
        return response()->json($artifact);
    }
}
