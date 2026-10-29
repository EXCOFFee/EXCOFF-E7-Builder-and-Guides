<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\BuildModeVote;
use App\Models\User;
use App\Models\UserBuild;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Nota por modo que vota la comunidad en una build.
 * GET  /api/builds/{build}/mode-votes  (pública; con token también devuelve los votos propios)
 * POST /api/builds/{build}/mode-votes  {mode, tier|null}  (tier null quita el voto)
 */
class BuildModeVoteController extends Controller
{
    public function show(Request $request, UserBuild $build): JsonResponse
    {
        abort_unless($build->status === 'published', 404);

        return response()->json($this->payload($build, $this->optionalUser($request)));
    }

    public function store(Request $request, UserBuild $build): JsonResponse
    {
        abort_unless($build->status === 'published', 404);

        $user = $request->user();
        if ((int) $build->user_id === (int) $user->id) {
            return response()->json(['error' => 'You cannot vote on your own build'], 403);
        }

        $validated = $request->validate([
            'mode' => ['required', 'string', Rule::in(BuildModeVote::MODES)],
            'tier' => ['present', 'nullable', 'integer', 'between:1,5'],
        ]);
        $mode = $validated['mode'];

        DB::transaction(function () use ($build, $user, $mode, $validated) {
            $match = ['user_id' => $user->id, 'build_id' => $build->id, 'mode' => $mode];

            if ($validated['tier'] === null) {
                BuildModeVote::where($match)->delete();
            } else {
                BuildModeVote::updateOrCreate($match, ['tier' => $validated['tier']]);
            }

            // Promedio y cantidad del modo, recalculados desde los votos (no se suman a mano)
            $stats = BuildModeVote::where('build_id', $build->id)->where('mode', $mode)
                ->selectRaw('avg(tier) as avg_tier, count(*) as total')
                ->first();

            // forceFill: las columnas community_* no son asignables desde el formulario de builds
            $build->forceFill([
                "community_{$mode}_avg" => $stats->total > 0 ? round((float) $stats->avg_tier, 2) : null,
                "community_{$mode}_count" => (int) $stats->total,
            ])->save();
        });

        return response()->json($this->payload($build->fresh(), $user));
    }

    private function payload(UserBuild $build, ?User $viewer): array
    {
        $myVotes = null;
        if ($viewer) {
            $votes = BuildModeVote::where('build_id', $build->id)->where('user_id', $viewer->id)->pluck('tier', 'mode');
            $myVotes = collect(BuildModeVote::MODES)->mapWithKeys(fn ($mode) => [$mode => $votes[$mode] ?? null])->all();
        }

        return [
            'community' => $build->community_ratings,
            'my_votes' => $myVotes,
            'can_vote' => $viewer !== null && (int) $build->user_id !== (int) $viewer->id,
        ];
    }
}
