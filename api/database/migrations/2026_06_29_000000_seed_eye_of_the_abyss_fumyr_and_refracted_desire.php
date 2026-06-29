<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Seed: Eye of the Abyss Fumyr (c5147) and Refracted Desire (a0241)
 *
 * Hero  : Eye of the Abyss Fumyr — 5★ Earth Mage (released 2026-06)
 * Source: https://ceciliabot.github.io/#/hero/eye-of-the-abyss-fumyr
 * Image : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c5147_su.png
 *
 * Artifact: Refracted Desire
 * Image : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0241_fu.png
 *
 * Usage: php artisan migrate
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        // ──────────────────────────────────────────────────────────────
        // HERO: Eye of the Abyss Fumyr
        // ──────────────────────────────────────────────────────────────
        $heroStats = [
            'atk'         => 1039,
            'def'         => 673,
            'hp'          => 5299,
            'spd'         => 115,
            'crit_chance' => 15,
            'crit_dmg'    => 150,
            'eff'         => 0,
            'res'         => 0,
        ];

        $heroSkills = [
            'S1' => [
                'name'        => 'Elemental Magic',
                'description' => 'Attacks the enemy with a chance to inflict Stun for 1 turn. Consuming 10 Souls increases the effect chance to 100%.',
                'rate'        => 0.9,
                'pow'         => 1,
            ],
            'S2' => [
                'name'        => 'Blue Despair',
                'description' => 'Envelops all enemies, dispelling 2 buffs and decreasing Combat Readiness by 25%. Grants the caster an extra turn.',
                'cooldown'    => 4,
            ],
            'S3' => [
                'name'        => 'Eye of the Abyss',
                'description' => 'Pierces the foremost enemy Hero, inflicting Detain (removes them from the battlefield). When Detain is inflicted, grants Deterrence to the caster for 3 turns. Also grants a barrier proportional to level and Stealth to the caster for 2 turns.',
                'rate'        => 1.5,
                'pow'         => 1,
                'cooldown'    => 5,
                'targets'     => 1,
            ],
        ];

        $heroSelfDevotion = [
            'type'   => 'eff',
            'grades' => [
                'B'   => 0.06,
                'A'   => 0.09,
                'S'   => 0.12,
                'SS'  => 0.15,
                'SSS' => 0.18,
            ],
        ];

        $heroImageUrl = 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c5147_su.png';
        $heroDataHash = hash('sha256', json_encode(['code' => 'eye-of-the-abyss-fumyr', 'name' => 'Eye of the Abyss Fumyr', 'source' => 'ceciliabot-2026-06-29']));

        DB::table('heroes')->upsert(
            [
                [
                    'code'          => 'eye-of-the-abyss-fumyr',
                    'hero_code'     => 'c5147',
                    'name'          => 'Eye of the Abyss Fumyr',
                    'slug'          => 'eye-of-the-abyss-fumyr',
                    'element'       => 'earth',
                    'class'         => 'mage',
                    'rarity'        => 5,
                    'base_stats'    => json_encode($heroStats),
                    'skills'        => json_encode($heroSkills),
                    'self_devotion' => json_encode($heroSelfDevotion),
                    'image_url'     => $heroImageUrl,
                    'data_hash'     => $heroDataHash,
                    'created_at'    => $now,
                    'updated_at'    => $now,
                ],
            ],
            ['code'],   // Unique key
            [           // Columns to update
                'hero_code',
                'name',
                'slug',
                'element',
                'class',
                'rarity',
                'base_stats',
                'skills',
                'self_devotion',
                'image_url',
                'data_hash',
                'updated_at',
            ]
        );

        // ──────────────────────────────────────────────────────────────
        // ARTIFACT: Refracted Desire
        // ──────────────────────────────────────────────────────────────
        DB::table('artifacts')->upsert(
            [
                [
                    'code'        => 'a0241',
                    'name'        => "Refracted Desire",
                    'name_es'     => 'Deseo Refractado',
                    'slug'        => 'refracted-desire',
                    'class'       => 'mage',
                    'rarity'      => 5,
                    'description' => "Increases the Combat Readiness of the caster when an ally other than the caster takes the first turn.",
                    'image_url'   => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0241_fu.png',
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
        DB::table('artifacts')->where('code', 'a0241')->delete();
        DB::table('heroes')->where('code', 'eye-of-the-abyss-fumyr')->delete();
    }
};
