<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Corrige stats, skills, imprint, elemento y clase de los héroes de custom_heroes.json.
 *
 * Una auditoría del 2026-10-27 encontró datos inventados (p. ej. skills de Lisette,
 * stats y clase de Aubade Ludwig). Los datos correctos salen de Fribbels (stats,
 * imprint, multiplicadores) y CeciliaBot (textos, valores de skills totalmente mejoradas)
 * y están congelados en database/data/hero_fixes_2026_10_27.json.
 *
 * Solo actualiza héroes que ya existen (por slug); nunca inserta.
 *
 * Usage: php artisan migrate
 */
return new class extends Migration
{
    public function up(): void
    {
        $snapshot = json_decode(
            file_get_contents(database_path('data/hero_fixes_2026_10_27.json')),
            true,
            flags: JSON_THROW_ON_ERROR
        );

        $now = now();

        foreach ($snapshot['heroes'] as $hero) {
            DB::table('heroes')
                ->where('slug', $hero['slug'])
                ->update([
                    'hero_code'     => $hero['hero_code'],
                    'name'          => $hero['name'],
                    'element'       => $hero['element'],
                    'class'         => $hero['class'],
                    'base_stats'    => json_encode($hero['base_stats']),
                    'skills'        => json_encode($hero['skills']),
                    'self_devotion' => json_encode($hero['self_devotion']),
                    'updated_at'    => $now,
                ]);
        }
    }

    public function down(): void
    {
        // Corrección de datos: no se restauran los valores inventados
    }
};
