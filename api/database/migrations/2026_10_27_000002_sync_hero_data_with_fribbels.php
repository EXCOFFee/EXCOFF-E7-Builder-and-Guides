<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Sincroniza con Fribbels lo que la web tenía desactualizado (auditoría 2026-10-27):
 * - Imprint (self_devotion): valores anteriores al parche que los aumentó (p. ej. SSS 16.8% -> 18%).
 * - Multiplicadores de skills (rate/pow/targets/scaling) de héroes rebalanceados.
 * - Stats lv60 de héroes reworkeados (Roozid, Challenger Dominiel...). Diene se excluye: en Fribbels
 *   sus stats son idénticos a los de Ivana (sospecha de error en la fuente).
 *
 * Datos congelados en database/data/hero_sync_2026_10_27.json. Solo actualiza héroes existentes (por slug).
 * Los multiplicadores se fusionan en el JSON de skills existente sin tocar nombres ni descripciones.
 */
return new class extends Migration
{
    private const SCALING_KEYS = ['rate', 'pow', 'targets', 'selfHpScaling', 'selfDefScaling', 'selfSpdScaling', 'penetration'];

    public function up(): void
    {
        $snapshot = json_decode(
            file_get_contents(database_path('data/hero_sync_2026_10_27.json')),
            true,
            flags: JSON_THROW_ON_ERROR
        );

        $now = now();

        foreach ($snapshot['heroes'] as $hero) {
            $row = DB::table('heroes')->where('slug', $hero['slug'])->first(['id', 'skills']);
            if (!$row) {
                continue;
            }

            $update = ['updated_at' => $now];

            foreach (['element', 'class'] as $column) {
                if (isset($hero[$column])) {
                    $update[$column] = $hero[$column];
                }
            }
            if (isset($hero['base_stats'])) {
                $update['base_stats'] = json_encode($hero['base_stats']);
            }
            if (isset($hero['self_devotion'])) {
                $update['self_devotion'] = json_encode($hero['self_devotion']);
            }
            if (isset($hero['multipliers'])) {
                $update['skills'] = json_encode($this->mergeMultipliers(json_decode($row->skills ?? '{}', true) ?: [], $hero['multipliers']));
            }

            DB::table('heroes')->where('id', $row->id)->update($update);
        }
    }

    /**
     * Reemplaza solo las claves de escalado de cada skill; el resto (nombre, descripción, soulburn) se conserva.
     */
    private function mergeMultipliers(array $skills, array $multipliers): array
    {
        foreach ($multipliers as $skillKey => $values) {
            if (!isset($skills[$skillKey]) || !is_array($skills[$skillKey])) {
                continue;
            }
            foreach (self::SCALING_KEYS as $key) {
                unset($skills[$skillKey][$key]);
            }
            $skills[$skillKey] = array_merge($skills[$skillKey], $values);
        }

        return $skills;
    }

    public function down(): void
    {
        // Sincronización de datos: no se restauran los valores desactualizados
    }
};
