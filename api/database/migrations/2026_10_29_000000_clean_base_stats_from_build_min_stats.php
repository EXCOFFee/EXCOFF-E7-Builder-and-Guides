<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * El formulario de builds copiaba los stats base del héroe en los "stats mínimos" y casi
 * nadie los borraba (crit 15, daño crítico 150, efectividad 0...). Borra, clave por clave,
 * los valores idénticos al stat base del héroe y los vacíos o en 0; lo que el autor
 * escribió queda. Si no queda nada, min_stats pasa a null. Idempotente.
 * En producción (2026-10-29): 48 builds con algún valor copiado, 3 copiadas enteras.
 */
return new class extends Migration
{
    public function up(): void
    {
        $baseStats = DB::table('heroes')->pluck('base_stats', 'id')
            ->map(fn ($json) => json_decode((string) $json, true) ?: []);

        // lazyById: pagina por id, así poner min_stats en null no corre las páginas siguientes
        DB::table('user_builds')->whereNotNull('min_stats')->lazyById()
            ->each(function ($build) use ($baseStats) {
                $stats = json_decode((string) $build->min_stats, true);
                if (!is_array($stats)) {
                    return;
                }

                $base = $baseStats->get($build->hero_id, []);
                $kept = array_filter($stats, function ($value, $key) use ($base) {
                    if (!is_numeric($value) || (float) $value <= 0) {
                        return false;
                    }

                    return !(isset($base[$key]) && is_numeric($base[$key]) && (float) $base[$key] === (float) $value);
                }, ARRAY_FILTER_USE_BOTH);

                if ($kept === $stats) {
                    return;
                }

                DB::table('user_builds')->where('id', $build->id)
                    ->update(['min_stats' => $kept ? json_encode($kept) : null]);
            });
    }

    public function down(): void
    {
        // Corrección de datos: los valores copiados no se recuperan (eran los stats base)
    }
};
