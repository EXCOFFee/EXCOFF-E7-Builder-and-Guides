<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Artifact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Artifact API Controller - Read-only endpoints for artifact data.
 */
class ArtifactController extends Controller
{
    /**
     * Cache duration in seconds (1 hour)
     */
    private const CACHE_TTL = 3600;

    /**
     * List all artifacts with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        // Build cache key from query parameters
        $cacheKey = 'artifacts:index:' . md5(json_encode($request->query()));
        
        $artifacts = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($request) {
            $query = Artifact::query();

            // Filter by rarity
            if ($request->has('rarity')) {
                $query->where('rarity', $request->rarity);
            }

            // Filter by class
            if ($request->has('class')) {
                $query->where('class', $request->class);
            }

            // Search by name (supports multiple languages)
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                        ->orWhere('name_ko', 'like', '%' . $search . '%')
                        ->orWhere('name_ja', 'like', '%' . $search . '%')
                        ->orWhere('name_zh', 'like', '%' . $search . '%');
                });
            }

            return $query->orderBy('name')->paginate(500);
        });

        // Get language preference
        $lang = $request->query('lang', 'en');

        // Transform to add display_name
        $artifacts->getCollection()->transform(function ($artifact) use ($lang) {
            $artifact->display_name = $this->getLocalizedName($artifact, $lang);
            return $artifact;
        });

        return response()->json($artifacts);
    }

    /**
     * Get a specific artifact.
     */
    public function show(Request $request, Artifact $artifact): JsonResponse
    {
        $lang = $request->query('lang', 'en');
        $artifact->display_name = $this->getLocalizedName($artifact, $lang);

        return response()->json($artifact);
    }

    /**
     * Get localized name based on language code.
     */
    private function getLocalizedName(Artifact $artifact, string $lang): string
    {
        return match ($lang) {
            'ko' => $artifact->name_ko ?? $artifact->name,
            'ja' => $artifact->name_ja ?? $artifact->name,
            'zh' => $artifact->name_zh ?? $artifact->name,
            default => $artifact->name,
        };
    }
}
