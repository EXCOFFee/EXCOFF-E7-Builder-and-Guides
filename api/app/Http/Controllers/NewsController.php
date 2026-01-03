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

        // Filter by category (for Stove news)
        if ($request->has('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }

        // Search in title and description
        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', '%' . $searchTerm . '%')
                  ->orWhere('description', 'like', '%' . $searchTerm . '%');
            });
        }

        // Get available categories for current source filter
        $categories = News::query()
            ->when($request->input('source') !== 'all', function ($q) use ($request) {
                $q->where('source', $request->input('source'));
            })
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        $news = $query->orderBy('published_at', 'desc')
            ->paginate($request->input('per_page', 20));

        // Add categories to response
        $response = $news->toArray();
        $response['categories'] = $categories;

        return response()->json($response);
    }

    /**
     * Show a single news item
     */
    public function show(News $news): JsonResponse
    {
        return response()->json($news);
    }
}
