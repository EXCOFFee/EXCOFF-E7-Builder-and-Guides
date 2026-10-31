<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\UserBuild;

/**
 * Builds verificadas: la captura del juego (proof_image) la revisa un admin. El formulario corre
 * el OCR en el navegador y manda lo que leyó (proof_ocr); acá se compara con los stats de la build
 * para ordenar la cola del admin. Como el OCR corre en el navegador se puede falsear: nunca
 * verifica solo.
 */
final class BuildVerification
{
    public const STATS = ['atk', 'def', 'hp', 'spd', 'crit_chance', 'crit_dmg', 'eff', 'res'];

    /** El OCR y la build redondean distinto ("15.0%" vs 15): ±1 cuenta como igual */
    private const TOLERANCE = 1;

    /** Lo que mandó el formulario (JSON o array de stat => número), limpio; null si no vino nada útil */
    public static function readFromInput(mixed $raw): ?array
    {
        $data = is_string($raw) ? json_decode($raw, true) : $raw;
        if (!is_array($data)) {
            return null;
        }
        $read = [];
        foreach (self::STATS as $stat) {
            if (isset($data[$stat]) && is_numeric($data[$stat])) {
                $read[$stat] = (int) round((float) $data[$stat]);
            }
        }

        return $read === [] ? null : $read;
    }

    /** {read, matched, total}: cuántos stats cargados en la build coinciden con la captura */
    public static function compare(array $read, ?array $stats): array
    {
        $total = 0;
        $matched = 0;
        foreach (self::STATS as $stat) {
            if (!isset($stats[$stat]) || $stats[$stat] === '' || !is_numeric($stats[$stat])) {
                continue;
            }
            $total++;
            if (isset($read[$stat]) && abs($read[$stat] - (float) $stats[$stat]) <= self::TOLERANCE) {
                $matched++;
            }
        }

        return ['read' => $read, 'matched' => $matched, 'total' => $total];
    }

    /**
     * Actualiza el estado antes de guardar: sin captura no hay verificación; una captura nueva o
     * stats distintos la mandan a revisar (aunque ya estuviera verificada).
     */
    public static function apply(UserBuild $build, ?array $read, bool $proofChanged): void
    {
        if ($build->proof_image === null) {
            $build->forceFill(['verification_status' => null, 'verified_at' => null, 'verified_by' => null, 'proof_ocr' => null]);

            return;
        }

        $statsChanged = $build->isDirty('min_stats') && $build->getOriginal('min_stats') != $build->min_stats;
        if (!$proofChanged && !$statsChanged && $read === null) {
            return;
        }

        // Sin lectura nueva se reusa la anterior (misma captura) contra los stats nuevos
        $read ??= $proofChanged ? null : ($build->proof_ocr['read'] ?? null);
        $build->forceFill(['proof_ocr' => $read === null ? null : self::compare($read, $build->min_stats)]);

        if ($proofChanged || $statsChanged || $build->verification_status === null) {
            $build->forceFill(['verification_status' => 'pending', 'verified_at' => null, 'verified_by' => null]);
        }
    }
}
