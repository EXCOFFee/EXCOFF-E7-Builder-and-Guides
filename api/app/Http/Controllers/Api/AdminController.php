<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hero;
use App\Models\Artifact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

/**
 * Admin controller for data synchronization and management.
 */
class AdminController extends Controller
{
    private const HERO_URL = 'http://e7-optimizer-game-data.s3-accelerate.amazonaws.com/herodata.json';
    private const ARTIFACT_URL = 'http://e7-optimizer-game-data.s3-accelerate.amazonaws.com/artifactdata.json';

    private const ELEMENT_MAP = [
        'fire' => 'fire',
        'ice' => 'ice',
        'wind' => 'earth',
        'earth' => 'earth',
        'light' => 'light',
        'dark' => 'dark',
    ];

    private const CLASS_MAP = [
        'knight' => 'knight',
        'warrior' => 'warrior',
        'assassin' => 'thief',
        'thief' => 'thief',
        'ranger' => 'ranger',
        'mage' => 'mage',
        'manauser' => 'soul_weaver',
        'soul-weaver' => 'soul_weaver',
    ];

    /**
     * Sync heroes and artifacts from Fribbels API.
     */
    public function syncAll(Request $request): JsonResponse
    {
        $force = $request->boolean('force', false);
        
        $heroResult = $this->syncHeroes($force);
        $artifactResult = $this->syncArtifacts($force);

        return response()->json([
            'success' => true,
            'message' => 'Sync completed',
            'heroes' => $heroResult,
            'artifacts' => $artifactResult,
        ]);
    }

    /**
     * Sync only heroes from Fribbels API.
     */
    public function syncHeroesEndpoint(Request $request): JsonResponse
    {
        $force = $request->boolean('force', false);
        $result = $this->syncHeroes($force);

        return response()->json([
            'success' => true,
            'message' => 'Heroes sync completed',
            ...$result,
        ]);
    }

    /**
     * Sync only artifacts from Fribbels API.
     */
    public function syncArtifactsEndpoint(Request $request): JsonResponse
    {
        $force = $request->boolean('force', false);
        $result = $this->syncArtifacts($force);

        return response()->json([
            'success' => true,
            'message' => 'Artifacts sync completed',
            ...$result,
        ]);
    }

    /**
     * Get current sync status and counts.
     */
    public function status(): JsonResponse
    {
        return response()->json([
            'heroes_count' => Hero::count(),
            'artifacts_count' => Artifact::count(),
            'last_hero' => Hero::latest()->first()?->name,
            'last_artifact' => Artifact::latest()->first()?->name,
        ]);
    }

    /**
     * Check for new heroes in Fribbels API that are not in local DB.
     */
    public function checkNewHeroes(): JsonResponse
    {
        try {
            $response = Http::timeout(30)->get(self::HERO_URL);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to fetch hero data',
                ], 500);
            }

            $fribbelsHeroes = $response->json();
            $localHeroCodes = Hero::pluck('code')->toArray();

            $newHeroes = [];
            foreach ($fribbelsHeroes as $name => $data) {
                $code = $data['_id'] ?? $data['id'] ?? null;
                if ($code && !in_array($code, $localHeroCodes)) {
                    $newHeroes[] = [
                        'code' => $code,
                        'name' => $name,
                        'element' => $data['attribute'] ?? 'unknown',
                        'class' => $data['role'] ?? 'unknown',
                        'rarity' => $data['rarity'] ?? 5,
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'fribbels_count' => count($fribbelsHeroes),
                'local_count' => count($localHeroCodes),
                'new_heroes_count' => count($newHeroes),
                'new_heroes' => $newHeroes,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sync heroes from Fribbels repository.
     */
    private function syncHeroes(bool $force): array
    {
        try {
            $response = Http::timeout(30)->get(self::HERO_URL);

            if (!$response->successful()) {
                return ['error' => 'Failed to fetch hero data: ' . $response->status()];
            }

            $heroesData = $response->json();
            $created = 0;
            $updated = 0;
            $skipped = 0;

            foreach ($heroesData as $heroData) {
                $result = $this->upsertHero($heroData, $force);
                match ($result) {
                    'created' => $created++,
                    'updated' => $updated++,
                    'skipped' => $skipped++,
                };
            }

            return [
                'total' => count($heroesData),
                'created' => $created,
                'updated' => $updated,
                'skipped' => $skipped,
            ];

        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Upsert a single hero record.
     */
    private function upsertHero(array $data, bool $force): string
    {
        $code = $data['_id'] ?? $data['id'] ?? null;
        if (!$code) {
            return 'skipped';
        }

        $dataHash = hash('sha256', json_encode($data));
        $existingHero = Hero::where('code', $code)->first();

        if ($existingHero && !$force && $existingHero->data_hash === $dataHash) {
            return 'skipped';
        }

        $element = strtolower($data['attribute'] ?? $data['element'] ?? 'fire');
        $element = self::ELEMENT_MAP[$element] ?? 'fire';

        $heroClass = strtolower($data['role'] ?? $data['class'] ?? 'warrior');
        $heroClass = self::CLASS_MAP[$heroClass] ?? 'warrior';

        $status = $data['calculatedStatus']['lv60SixStarFullyAwakened'] ?? null;

        if ($status) {
            $baseStats = [
                'atk' => (int) ($status['atk'] ?? 0),
                'def' => (int) ($status['def'] ?? 0),
                'hp' => (int) ($status['hp'] ?? 0),
                'spd' => (int) ($status['spd'] ?? 0),
                'crit_chance' => (int) round(($status['chc'] ?? 0.15) * 100),
                'crit_dmg' => (int) round(($status['chd'] ?? 1.5) * 100),
                'eff' => (int) round(($status['eff'] ?? 0) * 100),
                'res' => (int) round(($status['efr'] ?? 0) * 100),
            ];
        } else {
            $baseStats = [
                'atk' => (int) ($data['baseAtk'] ?? 0),
                'def' => (int) ($data['baseDef'] ?? 0),
                'hp' => (int) ($data['baseHp'] ?? 0),
                'spd' => (int) ($data['baseSpd'] ?? 0),
                'crit_chance' => 15,
                'crit_dmg' => 150,
                'eff' => 0,
                'res' => 0,
            ];
        }

        $skills = $data['skills'] ?? null;
        $imageUrl = $data['assets']['thumbnail']
            ?? $data['assets']['icon']
            ?? "https://raw.githubusercontent.com/fribbels/Fribbels-Epic-7-Optimizer/main/images/hero/{$code}_portrait.png";

        $heroData = [
            'code' => $code,
            'name' => $data['name'] ?? 'Unknown',
            'slug' => Str::slug($data['name'] ?? $code),
            'element' => $element,
            'class' => $heroClass,
            'rarity' => (int) ($data['rarity'] ?? 5),
            'base_stats' => $baseStats,
            'skills' => $skills,
            'image_url' => $imageUrl,
            'data_hash' => $dataHash,
        ];

        if ($existingHero) {
            $existingHero->update($heroData);
            return 'updated';
        }

        Hero::create($heroData);
        return 'created';
    }

    /**
     * Sync artifacts from Fribbels repository.
     */
    private function syncArtifacts(bool $force): array
    {
        try {
            $response = Http::timeout(30)->get(self::ARTIFACT_URL);

            if (!$response->successful()) {
                return ['error' => 'Failed to fetch artifact data: ' . $response->status()];
            }

            $artifactsData = $response->json();
            $created = 0;
            $updated = 0;

            foreach ($artifactsData as $artifactData) {
                $result = $this->upsertArtifact($artifactData);
                match ($result) {
                    'created' => $created++,
                    'updated' => $updated++,
                    default => null,
                };
            }

            return [
                'total' => count($artifactsData),
                'created' => $created,
                'updated' => $updated,
            ];

        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Upsert a single artifact record.
     */
    private function upsertArtifact(array $data): string
    {
        $code = $data['_id'] ?? $data['id'] ?? null;
        if (!$code) {
            return 'skipped';
        }

        $artifactClass = strtolower($data['role'] ?? $data['class'] ?? 'warrior');
        $artifactClass = self::CLASS_MAP[$artifactClass] ?? 'warrior';

        $artifactData = [
            'code' => $code,
            'name' => $data['name'] ?? 'Unknown',
            'slug' => Str::slug($data['name'] ?? $code),
            'class' => $artifactClass,
            'rarity' => (int) ($data['rarity'] ?? 5),
            'description' => $data['skill']['description'] ?? null,
            'image_url' => "https://raw.githubusercontent.com/fribbels/Fribbels-Epic-7-Optimizer/main/images/artifact/{$code}.png",
        ];

        $existing = Artifact::where('code', $code)->first();

        if ($existing) {
            $existing->update($artifactData);
            return 'updated';
        }

        Artifact::create($artifactData);
        return 'created';
    }
}
