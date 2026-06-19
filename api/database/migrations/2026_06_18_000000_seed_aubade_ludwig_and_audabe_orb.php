<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Seed: Aubade Ludwig (c5069) and new artifacts
 *
 * Hero  : Aubade Ludwig — 5★ Moonlight Light Mage (released 2026-06)
 * Source: https://ceciliabot.github.io/#/hero/aubade-ludwig
 * Image : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c5069_su.png
 *
 * Artifact: Audabe Orb
 * Image : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0243_fu.png
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
        // HERO: Aubade Ludwig
        // ──────────────────────────────────────────────────────────────
        $heroStats = [
            'atk'         => 1412,
            'def'         => 652,
            'hp'          => 4895,
            'spd'         => 115,
            'crit_chance' => 23,
            'crit_dmg'    => 150,
            'eff'         => 0,
            'res'         => 0,
        ];

        $heroSkills = [
            'S1' => [
                'name'        => 'Moonlight Call',
                'description' => 'Attacks the enemy with magic, with a 60% chance to decrease Defense for 1 turn. Damage dealt increases proportional to the caster\'s Attack.',
                'rate'        => 1.0,
                'pow'         => 1,
            ],
            'S2' => [
                'name'        => 'Starlight Veil',
                'description' => 'Grants a barrier to the caster for 2 turns and increases Combat Readiness by 50%. Soulburn: Ignores Effect Resistance.',
                'cooldown'    => 4,
            ],
            'S3' => [
                'name'        => 'Aubade\'s Requiem',
                'description' => 'Attacks all enemies with a powerful spell, penetrating Defense by 50%. If the enemy is defeated, inflicts extinction. Damage dealt increases proportional to the caster\'s Attack.',
                'rate'        => 1.1,
                'pow'         => 1,
                'penetration' => 0.5,
                'cooldown'    => 5,
                'targets'     => 4,
            ],
        ];

        $heroSelfDevotion = [
            'type'   => 'atk',
            'grades' => [
                'B'   => 0.06,
                'A'   => 0.09,
                'S'   => 0.12,
                'SS'  => 0.15,
                'SSS' => 0.18,
            ],
        ];

        $heroImageUrl = 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c5069_su.png';
        $heroDataHash = hash('sha256', json_encode(['code' => 'aubade-ludwig', 'name' => 'Aubade Ludwig', 'source' => 'ceciliabot-2026-06-18']));

        DB::table('heroes')->upsert(
            [
                [
                    'code'          => 'aubade-ludwig',
                    'hero_code'     => 'c5069',
                    'name'          => 'Aubade Ludwig',
                    'slug'          => 'aubade-ludwig',
                    'element'       => 'light',
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
        // ARTIFACT: Audabe Orb & Butterfly's Baptism
        // ──────────────────────────────────────────────────────────────
        DB::table('artifacts')->upsert(
            [
                [
                    'code'        => 'a0243',
                    'name'        => "Audabe Orb",
                    'name_es'     => 'Orbe de la Alborada',
                    'slug'        => 'audabe-orb',
                    'class'       => 'mage',
                    'rarity'      => 5,
                    'description' => "Increases Attack and Critical Hit Damage. When the caster defeats an enemy, increases Combat Readiness of all allies.",
                    'image_url'   => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0243_fu.png',
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ],
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
        DB::table('artifacts')->whereIn('code', ['a0243', 'a0244'])->delete();
        DB::table('heroes')->where('code', 'aubade-ludwig')->delete();
    }
};
