<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Artifact;
use App\Models\Hero;
use App\Models\UserBuild;
use Illuminate\Support\Collection;

/**
 * Lo que dicen las builds publicadas de un héroe: sets, artefactos, sinergias, counters,
 * stats mínimos promedio, notas por modo y tags. Lo usa GET /api/heroes/{slug}/stats.
 */
class HeroBuildStatsService
{
    /** Claves de min_stats tal como las guarda el formulario de builds */
    private const STAT_LABELS = [
        'atk' => 'Attack',
        'hp' => 'HP',
        'spd' => 'Speed',
        'def' => 'Defense',
        'crit_chance' => 'Crit Chance',
        'crit_dmg' => 'Crit Damage',
        'eff' => 'Effectiveness',
        'res' => 'Effect Resistance',
    ];

    private const PERCENT_STATS = ['crit_chance', 'crit_dmg', 'eff', 'res'];

    private const RATING_FIELDS = ['rating_pve', 'rating_arena', 'rating_gw', 'rating_rta'];

    private const TOP = 5;

    public function forHero(Hero $hero, string $lang): array
    {
        $builds = UserBuild::published()->where('hero_id', $hero->id)->get();
        $total = $builds->count();

        if ($total === 0) {
            return [
                'total_builds' => 0,
                'primary_sets' => [],
                'secondary_sets' => [],
                'artifacts' => [],
                'average_ratings' => null,
            ];
        }

        $heroIds = $builds->flatMap(fn (UserBuild $b) => [
            ...$this->heroIds($b->synergy_heroes),
            ...$this->heroIds($b->counter_heroes),
        ])->unique()->values();
        $heroes = Hero::whereIn('id', $heroIds)->get(['id', 'name', 'slug', 'image_url', 'element'])->keyBy('id');

        return [
            'total_builds' => $total,
            'primary_sets' => $this->countSets($builds, 'primary_set', $total),
            'secondary_sets' => $this->countSets($builds, 'secondary_set', $total),
            'artifacts' => $this->countArtifacts($builds, $total, $lang),
            'average_ratings' => $this->averageRatings($builds),
            'synergy_heroes' => $this->countHeroes($builds, 'synergy_heroes', $heroes, $total),
            'counter_heroes' => $this->countHeroes($builds, 'counter_heroes', $heroes, $total),
            'priority_stats' => $this->priorityStats($builds),
            'pro_tags' => $this->countTags($builds, 'pro_tags', $total),
            'con_tags' => $this->countTags($builds, 'con_tags', $total),
        ];
    }

    private function percentage(int $count, int $total): float
    {
        return round(($count / $total) * 100, 1);
    }

    private function countSets(Collection $builds, string $field, int $total): array
    {
        return $builds->filter(fn (UserBuild $b) => !empty($b->$field))
            ->countBy($field)
            ->sortDesc()
            ->map(fn (int $count, string $set) => [
                'set' => $set,
                'count' => $count,
                'percentage' => $this->percentage($count, $total),
            ])
            ->values()
            ->all();
    }

    private function countArtifacts(Collection $builds, int $total, string $lang): array
    {
        $counts = $builds->filter(fn (UserBuild $b) => !empty($b->artifact_id))
            ->countBy('artifact_id')
            ->sortDesc()
            ->take(self::TOP);

        $artifacts = Artifact::whereIn('id', $counts->keys())->get()->keyBy('id');

        return $counts->map(function (int $count, int $artifactId) use ($artifacts, $total, $lang) {
            $artifact = $artifacts->get($artifactId);

            return [
                'artifact_id' => $artifactId,
                'name' => $artifact ? $this->localizedName($artifact, $lang) : 'Unknown',
                'icon' => $artifact?->icon,
                'count' => $count,
                'percentage' => $this->percentage($count, $total),
            ];
        })->values()->all();
    }

    private function localizedName(Artifact $artifact, string $lang): string
    {
        $localized = in_array($lang, ['ko', 'ja', 'zh', 'es', 'pt'], true) ? $artifact->{"name_{$lang}"} : null;

        return $localized ?: $artifact->name;
    }

    private function averageRatings(Collection $builds): ?array
    {
        $averages = [];
        $all = [];

        foreach (self::RATING_FIELDS as $field) {
            $values = $builds->pluck($field)->filter(fn ($v) => $v !== null);
            if ($values->isNotEmpty()) {
                $averages[str_replace('rating_', '', $field)] = round($values->avg(), 1);
                array_push($all, ...$values->all());
            }
        }

        if ($all) {
            $averages['general'] = round(array_sum($all) / count($all), 1);
        }

        return $averages ?: null;
    }

    /** IDs de héroes de synergy_heroes / counter_heroes (formato viejo int[] o nuevo {id, note}[]) */
    private function heroIds(?array $list): array
    {
        return collect($list ?? [])
            ->map(fn ($item) => is_array($item) ? ($item['id'] ?? null) : $item)
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    private function countHeroes(Collection $builds, string $field, Collection $heroes, int $total): array
    {
        return $builds->flatMap(fn (UserBuild $b) => array_unique($this->heroIds($b->$field)))
            ->countBy()
            ->sortDesc()
            ->filter(fn (int $count, int $heroId) => $heroes->has($heroId))
            ->take(self::TOP)
            ->map(function (int $count, int $heroId) use ($heroes, $total) {
                $hero = $heroes->get($heroId);

                return [
                    'hero_id' => $heroId,
                    'name' => $hero->name,
                    'slug' => $hero->slug,
                    'image_url' => $hero->image_url,
                    'element' => $hero->element,
                    'count' => $count,
                    'percentage' => $this->percentage($count, $total),
                ];
            })
            ->values()
            ->all();
    }

    /** Promedio de cada stat mínimo entre las builds que lo indican; los stats sin datos no van */
    private function priorityStats(Collection $builds): array
    {
        $stats = [];

        foreach (self::STAT_LABELS as $stat => $label) {
            $values = $builds->map(fn (UserBuild $b) => $b->min_stats[$stat] ?? null)
                ->filter(fn ($v) => is_numeric($v) && $v > 0);
            if ($values->isEmpty()) {
                continue;
            }
            $avg = (float) $values->avg();

            $stats[] = [
                'stat' => $stat,
                'label' => $label,
                'count' => $values->count(),
                'average_value' => round($avg, 1),
                'formatted_value' => match (true) {
                    in_array($stat, self::PERCENT_STATS, true) => round($avg, 1) . '%',
                    $stat === 'spd' => (string) round($avg),
                    default => number_format(round($avg)),
                },
            ];
        }

        usort($stats, fn ($a, $b) => $b['count'] <=> $a['count']);

        return $stats;
    }

    private function countTags(Collection $builds, string $field, int $total): array
    {
        return $builds->flatMap(function (UserBuild $b) use ($field) {
            return collect($b->$field ?? [])
                ->map(fn ($tag) => is_array($tag) ? ($tag['id'] ?? $tag['tag'] ?? null) : $tag)
                ->filter(fn ($id) => is_string($id) && $id !== '')
                ->unique();
        })
            ->countBy()
            ->sortDesc()
            ->take(self::TOP)
            ->map(fn (int $count, string $tag) => [
                'tag' => $tag,
                'count' => $count,
                'percentage' => $this->percentage($count, $total),
            ])
            ->values()
            ->all();
    }
}
