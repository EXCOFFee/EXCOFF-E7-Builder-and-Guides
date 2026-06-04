<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Seed: Ivana (c1182) + Excommunicant's Censer (a0238)
 *
 * Hero  : Ivana — 5★ Fire Soul Weaver (released 2026-05-28)
 * Source: https://ceciliabot.github.io/#/hero/ivana
 *
 * Artifact: Excommunicant's Censer — 5★ Soul Weaver artifact (art0238)
 * Image   : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0238_fu.png
 *
 * Usage: php artisan migrate
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        // ──────────────────────────────────────────────────────────────
        // HERO: Ivana
        // ──────────────────────────────────────────────────────────────
        $heroStats = [
            'atk'         => 694,
            'def'         => 655,
            'hp'          => 4855,
            'spd'         => 117,
            'crit_chance' => 15,
            'crit_dmg'    => 150,
            'eff'         => 30,
            'res'         => 0,
        ];

        $heroSkills = [
            'S1' => [
                'name'             => 'Starlight',
                'description'      => 'Attacks the enemy with holy light and restores the health of all allies proportional to their maximum health.',
                'rate'             => 1,
                'pow'              => 1,
                'soulburn'         => true,
                'soulburn_souls'   => 20,
                'soulburn_effect'  => 'Increases the amount of health recovered.',
            ],
            'S2' => [
                'name'        => 'Light of Repose',
                'description' => 'The caster is immune to Combat Readiness reduction effects. At the start of the turn, dispels Immortality from all enemies (ignores Effect Resistance). If an enemy has Immortality at the end of any unit\'s turn, removes all debuffs from all allies, grants Radiance (non-dispellable buff: reduces damage taken by 50% when attacked) for 2 turns, and increases the caster\'s Combat Readiness by 35%.',
                'passive'     => true,
            ],
            'S3' => [
                'name'        => 'Requiem Prayer',
                'description' => 'Dispels 2 debuffs from all allies, grants them Immunity for 2 turns and Ignore Sharing for 3 turns. Increases Combat Readiness of all allies by 20%.',
                'cooldown'    => 5,
            ],
        ];

        $heroSelfDevotion = [
            'type'   => 'res',
            'grades' => [
                'B'   => 0.06,
                'A'   => 0.09,
                'S'   => 0.12,
                'SS'  => 0.15,
                'SSS' => 0.18,
            ],
        ];

        $heroImageUrl = 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c1182_su.png';
        $heroDataHash = hash('sha256', json_encode(['code' => 'ivana', 'name' => 'Ivana', 'source' => 'ceciliabot-2026-05-28']));

        DB::table('heroes')->upsert(
            [
                [
                    'code'          => 'ivana',
                    'hero_code'     => 'c1182',
                    'name'          => 'Ivana',
                    'slug'          => 'ivana',
                    'element'       => 'fire',
                    'class'         => 'soul_weaver',
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
            ['code'],   // Unique key to detect conflicts
            [           // Columns to update on conflict
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
        // ARTIFACT: Excommunicant's Censer
        // ──────────────────────────────────────────────────────────────
        DB::table('artifacts')->upsert(
            [
                [
                    'code'        => 'a0238',
                    'name'        => "Excommunicant's Censer",
                    'name_es'     => 'Incensario de la excomulgada',
                    'slug'        => 'excommunicants-censer',
                    'class'       => 'soul_weaver',
                    'rarity'      => 5,
                    'description' => "Increases Effect Resistance by 15%. At the end of an enemy's turn, if the caster has no debuffs, increases the caster's Combat Readiness by 10%. This effect activates once per turn.",
                    'image_url'   => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0238_fu.png',
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ],
            ],
            ['code'],   // Unique key
            [           // Columns to update on conflict
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
        DB::table('heroes')->where('code', 'ivana')->delete();
        DB::table('artifacts')->where('code', 'a0238')->delete();
    }
};
