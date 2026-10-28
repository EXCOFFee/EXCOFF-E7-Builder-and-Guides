<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Corrige artefactos con datos inventados (auditoría 2026-10-28) y agrega Unleashed Axe.
 *
 * - Intoxicating Indulgence, Refracted Desire, Butterfly's Baptism y "Audabe Orb" (en realidad
 *   Aubade Orb) tenían descripción y clase inventadas.
 * - Excommunicant's Censer y Glorious Flag: valores a +30 y redacción oficial.
 * - Land of Lingering Light (universal) pasa a 'warrior', como los otros 85 universales.
 *
 * Datos congelados en database/data/artifact_fixes_2026_10_28.json (textos de CeciliaBot).
 * Busca por código o slug anterior; si el sync de Fribbels ya creó un duplicado con el slug
 * correcto, mueve sus builds al registro real y lo elimina.
 */
return new class extends Migration
{
    public function up(): void
    {
        $snapshot = json_decode(
            file_get_contents(database_path('data/artifact_fixes_2026_10_28.json')),
            true,
            flags: JSON_THROW_ON_ERROR
        );

        $now = now();

        foreach ($snapshot['artifacts'] as $fix) {
            $row = DB::table('artifacts')->where('code', $fix['code'])->first()
                ?? DB::table('artifacts')->where('slug', $fix['old_slug'])->first();

            $update = array_filter([
                'name' => $fix['name'] ?? null,
                'slug' => $fix['slug'] ?? null,
                'class' => $fix['class'] ?? null,
                'rarity' => $fix['rarity'] ?? null,
                'description' => $fix['description'] ?? null,
                'image_url' => $fix['image_url'] ?? null,
            ], fn ($value) => $value !== null);

            if (!$row) {
                if (isset($fix['name'], $fix['slug'])) {
                    DB::table('artifacts')->insert($update + ['code' => $fix['code'], 'created_at' => $now, 'updated_at' => $now]);
                }
                continue;
            }

            if (isset($update['slug'])) {
                $this->removeDuplicate($row->id, $update['slug']);
            }

            DB::table('artifacts')->where('id', $row->id)->update($update + ['updated_at' => $now]);
        }
    }

    /**
     * A record with the corrected slug may already exist (created by data:sync from Fribbels).
     */
    private function removeDuplicate(int $keepId, string $slug): void
    {
        $duplicate = DB::table('artifacts')->where('slug', $slug)->where('id', '!=', $keepId)->first();
        if (!$duplicate) {
            return;
        }

        DB::table('user_builds')->where('artifact_id', $duplicate->id)->update(['artifact_id' => $keepId]);
        DB::table('guides')->where('artifact_id', $duplicate->id)->update(['artifact_id' => $keepId]);
        DB::table('artifacts')->where('id', $duplicate->id)->delete();
    }

    public function down(): void
    {
        // Corrección de datos: no se restauran los textos inventados
    }
};
