<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * El formulario de edición viejo guardaba min_stats con chc/chd/efr en lugar de
 * crit_chance/crit_dmg/res (las claves del formulario de creación y de los filtros).
 * Pasa los valores a las claves correctas (si la correcta ya existe, se conserva) y
 * borra las viejas. En producción afectaba a 1 build (2026-10-28). Idempotente.
 */
return new class extends Migration
{
    private const LEGACY = ['chc' => 'crit_chance', 'chd' => 'crit_dmg', 'efr' => 'res'];

    public function up(): void
    {
        DB::table('user_builds')->whereNotNull('min_stats')->orderBy('id')->each(function ($build) {
            $stats = json_decode($build->min_stats, true);
            if (!is_array($stats) || !array_intersect_key($stats, self::LEGACY)) {
                return;
            }

            foreach (self::LEGACY as $old => $new) {
                if (array_key_exists($old, $stats)) {
                    if (!isset($stats[$new]) && (int) $stats[$old] !== 0) {
                        $stats[$new] = $stats[$old];
                    }
                    unset($stats[$old]);
                }
            }

            DB::table('user_builds')->where('id', $build->id)->update(['min_stats' => json_encode($stats)]);
        });
    }

    public function down(): void
    {
        // Corrección de datos: no se vuelven a escribir las claves viejas
    }
};
