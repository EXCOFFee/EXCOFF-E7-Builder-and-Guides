<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\UserBuild;
use App\Support\BuildCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Cola de builds con captura para verificar (solo admin). Primero las que el OCR encontró
 * iguales a sus stats: se pueden aprobar en lote. La lectura del OCR viene del navegador del
 * autor, por eso siempre decide un admin.
 */
class VerificationController extends Controller
{
    private const QUEUE_SIZE = 100;

    public function index(): JsonResponse
    {
        $builds = UserBuild::with(['user:id,name', 'hero:id,name,slug,element,image_url'])
            ->where('verification_status', 'pending')
            ->whereNotNull('proof_image')
            ->oldest('updated_at')
            ->limit(self::QUEUE_SIZE)
            ->get()
            ->each(fn (UserBuild $build) => $build->makeVisible('proof_ocr'))
            // Coincidencia del OCR (las que no tienen lectura, al final); a igualdad, la más vieja
            ->sortByDesc(fn (UserBuild $build) => isset($build->proof_ocr['total']) && $build->proof_ocr['total'] > 0
                ? $build->proof_ocr['matched'] / $build->proof_ocr['total']
                : -1)
            ->values();

        return response()->json(['data' => $builds]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1|max:' . self::QUEUE_SIZE,
            'ids.*' => 'integer',
            'status' => 'required|in:verified,rejected',
        ]);

        // Por query builder: verificar no es editar la build (no cambia updated_at, que marca si
        // es de antes de un cambio del héroe)
        $updated = DB::table('user_builds')
            ->whereIn('id', $validated['ids'])
            ->whereNotNull('proof_image')
            ->update([
                'verification_status' => $validated['status'],
                'verified_at' => $validated['status'] === 'verified' ? now() : null,
                'verified_by' => $request->user()->id,
            ]);
        BuildCache::bump();

        return response()->json(['updated' => $updated]);
    }
}
