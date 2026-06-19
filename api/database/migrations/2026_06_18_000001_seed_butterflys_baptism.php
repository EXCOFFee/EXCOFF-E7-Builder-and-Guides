<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Seed: Butterfly's Baptism (a0244)
 *
 * Artifact: Butterfly's Baptism
 * Image : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0244_fu.png
 *
 * Usage: php artisan migrate
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        // ──────────────────────────────────────────────────────────────
        // ARTIFACT: Butterfly's Baptism
        // ──────────────────────────────────────────────────────────────
        DB::table('artifacts')->upsert(
            [
                [
                    'code'        => 'a0244',
                    'name'        => "Butterfly's Baptism",
                    'name_es'     => 'Bautismo de la mariposa',
                    'slug'        => 'butterflys-baptism',
                    'class'       => 'soul_weaver',
                    'rarity'      => 5,
                    'description' => "Increases Effect Resistance. After using a non-attack skill, recovers Health of the ally with the lowest Health.",
                    'image_url'   => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0244_fu.png',
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ],
            ],
            ['code'],   // Unique key
            [           // Columns to update
                'name',
                'name_es',
                'slug',
                'class',
                'rarity',
                'description',
                'image_url',
                'updated_at',
            ]
        );
    }

    public function down(): void
    {
        DB::table('artifacts')->where('code', 'a0244')->delete();
    }
};
