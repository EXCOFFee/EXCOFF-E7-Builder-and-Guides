<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    /**
     * List news with pagination and filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = News::query();

        // Filter by source
        if ($request->has('source') && $request->input('source') !== 'all') {
            $query->where('source', $request->input('source'));
        }

        // Search
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->input('search') . '%');
        }

        $news = $query->orderBy('published_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($news);
    }

    /**
     * Show a single news item
     */
    public function show(News $news): JsonResponse
    {
        return response()->json($news);
    }
}
