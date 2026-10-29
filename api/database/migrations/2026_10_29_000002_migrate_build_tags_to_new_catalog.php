<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Pasa los pros/contras de las builds al catálogo nuevo de tags (254, sin duplicados).
 * La tabla de conversión es database/data/tag_migration_2026_10.json (generada junto con el
 * catálogo por web/scripts/tags/build_tags.py y revisada con el usuario el 2026-10-29):
 * - IDs viejos, duplicados y huérfanos (los que la web mostraba como código) -> su equivalente
 * - "Débil vs [héroe]" -> el héroe se agrega a counter_heroes con la nota del tag
 * - sin equivalente -> se descarta y queda en el log
 * Si dos tags terminan en el mismo, queda uno (en la posición del primero) con la primera nota.
 * Idempotente: los IDs del catálogo nuevo no se tocan.
 */
return new class extends Migration
{
    public function up(): void
    {
        $map = json_decode((string) file_get_contents(database_path('data/tag_migration_2026_10.json')), true);
        $valid = ['pro' => config('build_tags.pro'), 'con' => config('build_tags.con')];
        $heroIds = DB::table('heroes')->whereIn('slug', array_values($map['con_to_counter_hero']))->pluck('id', 'slug');

        DB::table('user_builds')->lazyById()->each(function ($build) use ($map, $valid, $heroIds) {
            $counters = json_decode((string) $build->counter_heroes, true) ?: [];
            $changes = [];

            foreach (['pro_tags' => 'pro', 'con_tags' => 'con'] as $field => $type) {
                $original = json_decode((string) $build->{$field}, true);
                if (!is_array($original)) {
                    continue;
                }

                $tags = [];
                foreach ($original as $tag) {
                    $tag = is_string($tag) ? ['id' => $tag] : $tag;
                    $id = $tag['id'] ?? null;
                    $note = isset($tag['note']) && $tag['note'] !== '' ? $tag['note'] : null;
                    if (!is_string($id)) {
                        continue;
                    }

                    if ($type === 'con' && isset($map['con_to_counter_hero'][$id])) {
                        $heroId = $heroIds[$map['con_to_counter_hero'][$id]] ?? null;
                        if ($heroId) {
                            $counters = $this->addCounter($counters, $heroId, $note);
                        }
                        continue;
                    }

                    $newId = in_array($id, $valid[$type], true) ? $id : ($map[$type][$id] ?? null);
                    if ($newId === null || !in_array($newId, $valid[$type], true)) {
                        Log::info("migración de tags: build {$build->id} descarta {$type} '{$id}'");
                        continue;
                    }

                    if (!isset($tags[$newId])) {
                        $tags[$newId] = ['id' => $newId];
                    }
                    if ($note !== null && !isset($tags[$newId]['note'])) {
                        $tags[$newId]['note'] = $note;
                    }
                }

                $tags = array_values($tags);
                if ($tags !== $original) {
                    $changes[$field] = json_encode($tags);
                }
            }

            if ($counters !== (json_decode((string) $build->counter_heroes, true) ?: [])) {
                $changes['counter_heroes'] = json_encode($counters);
            }

            if ($changes) {
                DB::table('user_builds')->where('id', $build->id)->update($changes);
            }
        });
    }

    /** Agrega el héroe a counters (formato {id, note}) si no estaba, en cualquier formato */
    private function addCounter(array $counters, int $heroId, ?string $note): array
    {
        foreach ($counters as $item) {
            if ((int) (is_array($item) ? ($item['id'] ?? 0) : $item) === $heroId) {
                return $counters;
            }
        }

        $counters[] = $note !== null ? ['id' => $heroId, 'note' => $note] : ['id' => $heroId];

        return $counters;
    }

    public function down(): void
    {
        // Corrección de datos: los IDs viejos no se vuelven a escribir
    }
};
