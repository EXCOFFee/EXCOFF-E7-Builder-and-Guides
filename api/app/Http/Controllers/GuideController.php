<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Guide;
use App\Services\ImageService;
use App\Support\GuideTeams;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class GuideController extends Controller
{
    public function __construct(
        private readonly ImageService $imageService
    ) {}

    /**
     * List guides with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Guide::with(['user:id,name,avatar', 'hero:id,name,slug'])
            ->where('is_published', true);

        // Filter by category
        if ($request->has('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }

        // Filter by hero (id o slug): la guía del héroe o una con el héroe en un equipo
        if ($request->has('hero_id')) {
            $query->where('hero_id', $request->input('hero_id'));
        }
        if ($request->filled('hero')) {
            $slug = (string) $request->input('hero');
            $query->where(fn ($q) => $q
                ->whereHas('hero', fn ($h) => $h->where('slug', $slug))
                ->orWhereExists(fn ($s) => $s->from('guide_team_builds')
                    ->join('heroes', 'heroes.id', '=', 'guide_team_builds.hero_id')
                    ->whereColumn('guide_team_builds.guide_id', 'guides.id')
                    ->where('heroes.slug', $slug)));
        }
        // Guías cuyos equipos usan una build ("usada en N guías")
        if ($request->filled('build')) {
            $query->whereExists(fn ($s) => $s->from('guide_team_builds')
                ->whereColumn('guide_team_builds.guide_id', 'guides.id')
                ->where('guide_team_builds.build_id', (int) $request->input('build')));
        }

        // Modo de juego de la guía (pve, pvp, guild, oneshot)
        if ($request->filled('type') && $request->input('type') !== 'all') {
            $query->where('type', $request->input('type'));
        }

        // Guías de un autor (su perfil): las anónimas no cuentan
        if ($request->filled('user')) {
            $query->where('user_id', (int) $request->input('user'))->where('is_anonymous', false);
        }

        // Filter by language
        if ($request->has('language') && $request->input('language') !== 'all') {
            $query->where('language', $request->input('language'));
        }

        // Search
        if ($request->has('search')) {
            $query->where('title', 'like', "%{$request->input('search')}%");
        }

        // Orden en el servidor (antes la web ordenaba solo la página de 20 que tenía cargada)
        $order = $request->input('order') === 'asc' ? 'asc' : 'desc';
        match ($request->input('sort', 'newest')) {
            'likes' => $query->orderBy('likes', $order),
            'views' => $query->orderBy('views', $order),
            default => $query->orderBy('created_at', $order),
        };

        $guides = $query->orderBy('id', 'desc')->paginate(20);

        return response()->json($guides);
    }

    /**
     * Show a guide
     */
    public function show(Request $request, Guide $guide): JsonResponse
    {
        $guide->load(['user:id,name,avatar']);
        $guide->increment('views');
        $viewer = $this->optionalUser($request);

        // Add recommended heroes and artifacts data (legacy) + teams
        $response = $guide->toArray();
        $response['recommended_heroes_list'] = $guide->recommended_heroes_list;
        $response['recommended_artifacts_list'] = $guide->recommended_artifacts_list;
        // Las builds de los equipos, por id (objeto: así la web no baja listas enteras)
        $response['team_builds'] = (object) GuideTeams::builds($guide);
        $response['team_heroes'] = (object) GuideTeams::heroes($guide);
        // En una guía anónima no llega el autor: el dueño se reconoce por esto (editar/borrar)
        $response['is_owner'] = $viewer !== null && (int) $guide->user_id === (int) $viewer->id;

        return response()->json($response);
    }

    /**
     * Store a new guide
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|in:general,pve,rta,guild_war,arena,heroes,tier_list,character_guide',
            'hero_id' => 'nullable|exists:heroes,id',
            'description' => 'nullable|string',
            'gameplay_content' => 'required|string',
            'video_url' => 'nullable|url',
            'language' => 'nullable|string|max:5',
            'recommended_heroes' => 'nullable|array',
            'recommended_artifacts' => 'nullable|array',
            'teams' => 'nullable', // JSON en texto (FormData) o array; lo valida GuideTeams
            'is_anonymous' => 'nullable',
        ] + ImageService::rules());
        unset($validated['images']);
        $validated['teams'] = GuideTeams::validate($request->input('teams'));
        // El formulario manda "1"/"0" (antes se ignoraba y la guía "anónima" mostraba al autor)
        $validated['is_anonymous'] = filter_var($validated['is_anonymous'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);
        $validated['user_id'] = $request->user()->id;
        $validated['is_published'] = true;
        $validated['language'] = $validated['language'] ?? 'en';

        // Validated by content before storing (absolute URLs so they work from Vercel)
        $validated['images'] = $this->imageService->storeUploads($request->file('images'), 'guides');

        // Extract video thumbnail if YouTube URL provided
        if (!empty($validated['video_url'])) {
            $validated['video_platform'] = $this->detectVideoPlatform($validated['video_url']);
            $validated['video_thumbnail'] = $this->extractThumbnail($validated['video_url'], $validated['video_platform']);
        }

        $guide = Guide::create($validated);
        GuideTeams::sync($guide);

        return response()->json($guide, 201);
    }

    /**
     * Update a guide
     */
    public function update(Request $request, Guide $guide): JsonResponse
    {
        // Check ownership
        if ((int) $guide->user_id !== (int) $request->user()->id && !$request->user()->is_admin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'category' => 'sometimes|in:general,pve,rta,guild_war,arena,heroes,tier_list,character_guide',
            'description' => 'nullable|string',
            'gameplay_content' => 'sometimes|string',
            'video_url' => 'nullable|url',
            'is_published' => 'sometimes|boolean',
            'recommended_heroes' => 'nullable|array',
            'recommended_artifacts' => 'nullable|array',
            'teams' => 'nullable', // JSON en texto (FormData) o array; lo valida GuideTeams
            'is_anonymous' => 'nullable',
        ] + ImageService::rules());
        unset($validated['images']);
        if (array_key_exists('is_anonymous', $validated)) {
            $validated['is_anonymous'] = filter_var($validated['is_anonymous'], FILTER_VALIDATE_BOOLEAN);
        }
        // Sin el campo, los equipos quedan como estaban; "[]" los borra
        if ($request->has('teams')) {
            $validated['teams'] = GuideTeams::validate($request->input('teams'));
        }

        if (isset($validated['title']) && $validated['title'] !== $guide->title) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);
        }

        // New uploads (validated by content) + images already on this server; external URLs are dropped
        $imagePaths = array_merge(
            $this->imageService->storeUploads($request->file('images'), 'guides'),
            $this->imageService->filterOwnedUrls($request->input('image_urls'))
        );

        // Limit to 5 and update if any images
        if (!empty($imagePaths)) {
            $validated['images'] = array_slice($imagePaths, 0, ImageService::MAX_IMAGES);
        }

        if (!empty($validated['video_url']) && $validated['video_url'] !== $guide->video_url) {
            $validated['video_platform'] = $this->detectVideoPlatform($validated['video_url']);
            $validated['video_thumbnail'] = $this->extractThumbnail($validated['video_url'], $validated['video_platform']);
        }

        $guide->update($validated);
        if (array_key_exists('teams', $validated)) {
            GuideTeams::sync($guide);
        }

        return response()->json($guide);
    }

    /**
     * Delete a guide
     */
    public function destroy(Request $request, Guide $guide): JsonResponse
    {
        // Check ownership
        if ((int) $guide->user_id !== (int) $request->user()->id && !$request->user()->is_admin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $guide->delete();

        return response()->json(['message' => 'Guide deleted successfully']);
    }

    /**
     * Detect video platform from URL
     */
    private function detectVideoPlatform(string $url): string
    {
        if (str_contains($url, 'youtube.com') || str_contains($url, 'youtu.be')) {
            return 'youtube';
        }
        if (str_contains($url, 'twitch.tv')) {
            return 'twitch';
        }
        if (str_contains($url, 'bilibili.com')) {
            return 'bilibili';
        }
        return 'other';
    }

    /**
     * Extract video thumbnail
     */
    private function extractThumbnail(string $url, string $platform): ?string
    {
        if ($platform === 'youtube') {
            // Extract video ID
            preg_match('/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/', $url, $matches);
            if (!empty($matches[1])) {
                return "https://img.youtube.com/vi/{$matches[1]}/hqdefault.jpg";
            }
        }
        return null;
    }
}
