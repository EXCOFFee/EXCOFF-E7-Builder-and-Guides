<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\Guide;
use App\Models\Hero;
use App\Models\UserBuild;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Equipos de una guía (guides.teams). Formato actual:
 *   [{name, mode, note, heroes: [{hero_id, build_id, note}]}]
 * cada héroe atado a una build publicada de ese héroe (de cualquier autor). Los equipos viejos,
 * sin `mode` ({name, heroes: [{hero_id, sets, artifact_id, stats, note}]}), se conservan tal cual.
 */
class GuideTeams
{
    /** Modos y cuántos héroes entran en cada uno */
    public const SIZES = ['gw_attack' => 3, 'gw_defense' => 3, 'arena' => 4, 'rta' => 5, 'pve' => 4];

    public const MAX_TEAMS = 6;

    /**
     * Valida y normaliza lo que manda el formulario (JSON en texto o array).
     *
     * @throws ValidationException
     */
    public static function validate(mixed $raw): array
    {
        $teams = is_string($raw) ? json_decode($raw, true) : $raw;
        if ($raw === null || $raw === '') {
            return [];
        }
        if (!is_array($teams) || !array_is_list($teams)) {
            self::fail('Teams are not valid.');
        }
        // El límite es para los equipos nuevos: las guías viejas pueden tener más, y editar el
        // texto de la guía no tiene que obligar a borrarlos
        $newTeams = array_filter($teams, fn ($team) => is_array($team) && array_key_exists('mode', $team));
        if (count($newTeams) > self::MAX_TEAMS) {
            self::fail('A guide can have up to ' . self::MAX_TEAMS . ' teams.');
        }

        // Builds de todos los equipos en una sola consulta
        $buildIds = collect($teams)->pluck('heroes')->filter(fn ($v) => is_array($v))->flatten(1)->pluck('build_id')->filter(fn ($v) => is_int($v))->unique();
        $builds = UserBuild::published()->whereIn('id', $buildIds)->pluck('hero_id', 'id');
        $heroIds = collect($teams)->pluck('heroes')->filter(fn ($v) => is_array($v))->flatten(1)->pluck('hero_id')->filter(fn ($v) => is_int($v))->unique();
        $knownHeroes = Hero::whereIn('id', $heroIds)->pluck('id')->flip();

        return array_map(fn ($team) => self::normalizeTeam($team, $builds->all(), $knownHeroes->all()), $teams);
    }

    private static function normalizeTeam(mixed $team, array $builds, array $knownHeroes): array
    {
        if (!is_array($team) || !is_array($team['heroes'] ?? null) || !array_is_list($team['heroes'])) {
            self::fail('Teams are not valid.');
        }
        $name = self::text($team['name'] ?? '', 60);
        $heroes = $team['heroes'];

        // Equipo viejo (sin modo): se guarda como estaba, con los campos limpios. Sin errores: los
        // héroes que ya no existen (o repetidos) se dejan afuera en lugar de frenar el guardado
        if (!array_key_exists('mode', $team)) {
            $kept = [];
            foreach ($heroes as $h) {
                $id = is_array($h) ? ($h['hero_id'] ?? null) : null;
                if (is_int($id) && isset($knownHeroes[$id]) && !isset($kept[$id]) && count($kept) < 4) {
                    $kept[$id] = array_filter([
                        'hero_id' => $id,
                        'sets' => is_array($h['sets'] ?? null) ? array_values(array_filter($h['sets'], 'is_string')) : null,
                        'artifact_id' => is_int($h['artifact_id'] ?? null) ? $h['artifact_id'] : null,
                        'stats' => self::text($h['stats'] ?? '', 100) ?: null,
                        'note' => self::text($h['note'] ?? '', 200) ?: null,
                    ], fn ($v) => $v !== null);
                }
            }

            return ['name' => $name, 'heroes' => array_values($kept)];
        }

        $heroIds = array_map(fn ($h) => is_array($h) ? ($h['hero_id'] ?? null) : null, $heroes);
        foreach ($heroIds as $heroId) {
            if (!is_int($heroId) || !isset($knownHeroes[$heroId])) {
                self::fail('A team has a hero that does not exist.');
            }
        }
        if (count($heroIds) !== count(array_unique($heroIds))) {
            self::fail('A hero can only be once in a team.');
        }

        $mode = $team['mode'];
        if (!is_string($mode) || !isset(self::SIZES[$mode])) {
            self::fail('Pick the mode of each team.');
        }
        if (count($heroes) === 0 || count($heroes) > self::SIZES[$mode]) {
            self::fail('A ' . $mode . ' team has 1 to ' . self::SIZES[$mode] . ' heroes.');
        }

        return [
            'name' => $name,
            'mode' => $mode,
            'note' => self::text($team['note'] ?? '', 200),
            'heroes' => array_map(function ($h) use ($builds) {
                $buildId = $h['build_id'] ?? null;
                if (!is_int($buildId) || ($builds[$buildId] ?? null) !== $h['hero_id']) {
                    self::fail('Each hero in a team needs a published build of that hero.');
                }

                return ['hero_id' => $h['hero_id'], 'build_id' => $buildId, 'note' => self::text($h['note'] ?? '', 200)];
            }, $heroes),
        ];
    }

    /** Rehace el índice guide_team_builds de la guía a partir de sus equipos */
    public static function sync(Guide $guide): void
    {
        $rows = collect($guide->teams ?? [])
            ->filter(fn ($team) => isset($team['mode']))
            ->flatMap(fn ($team) => $team['heroes'])
            ->unique('build_id')
            ->map(fn ($h) => ['guide_id' => $guide->id, 'build_id' => $h['build_id'], 'hero_id' => $h['hero_id']])
            ->values()
            ->all();

        DB::transaction(function () use ($guide, $rows) {
            DB::table('guide_team_builds')->where('guide_id', $guide->id)->delete();
            // Una build borrada entre que se validó y ahora no rompe el guardado
            $existing = UserBuild::whereIn('id', array_column($rows, 'build_id'))->pluck('id')->flip();
            DB::table('guide_team_builds')->insert(array_values(array_filter($rows, fn ($r) => isset($existing[$r['build_id']]))));
        });
    }

    /**
     * Resumen de las builds de los equipos (lo que muestra la guía), por id. Las que ya no
     * existen o no están publicadas no vienen: la guía muestra "build no disponible".
     */
    public static function builds(Guide $guide): array
    {
        $ids = collect($guide->teams ?? [])->filter(fn ($team) => isset($team['mode']))->flatMap(fn ($team) => $team['heroes'])->pluck('build_id');
        if ($ids->isEmpty()) {
            return [];
        }

        return UserBuild::published()
            ->whereIn('id', $ids)
            ->with(['user:id,name,avatar', 'hero:id,name,slug,element,image_url', 'artifact:id,name,code,image_url'])
            ->get(['id', 'user_id', 'hero_id', 'artifact_id', 'title', 'primary_set', 'secondary_set', 'min_stats', 'is_anonymous', 'likes', 'updated_at'])
            ->mapWithKeys(fn (UserBuild $build) => [$build->id => $build->toArray()])
            ->all();
    }

    /** Los héroes de los equipos, por id (para mostrar el lugar aunque su build ya no esté) */
    public static function heroes(Guide $guide): array
    {
        $ids = collect($guide->teams ?? [])->filter(fn ($team) => isset($team['mode']))->flatMap(fn ($team) => $team['heroes'])->pluck('hero_id');
        if ($ids->isEmpty()) {
            return [];
        }

        return Hero::whereIn('id', $ids)->get(['id', 'name', 'slug', 'element', 'class', 'image_url'])->keyBy('id')->all();
    }

    private static function text(mixed $value, int $max): string
    {
        return is_string($value) ? mb_substr(trim($value), 0, $max) : '';
    }

    /** @throws ValidationException */
    private static function fail(string $message): never
    {
        throw ValidationException::withMessages(['teams' => $message]);
    }
}
