<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Seed: Tidal Rift Elvira (c2148), Aube (c5190), and Intoxicating Indulgence (a0245)
 *
 * Hero 1 : Tidal Rift Elvira — 5★ Dark Mage (released 2026-07)
 * Source  : https://ceciliabot.github.io/#/hero/tidal-rift-elvira
 * Image   : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c2148_su.png
 *
 * Hero 2 : Aube — 5★ Ice Ranger (released 2026-07)
 * Source  : https://ceciliabot.github.io/#/hero/aube
 * Image   : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c5190_su.png
 *
 * Artifact: Intoxicating Indulgence / Obsesión Vertiginosa
 * Image   : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0245_fu.png
 *
 * Usage: php artisan migrate
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        // ──────────────────────────────────────────────────────────────
        // HERO 1: Tidal Rift Elvira
        // ──────────────────────────────────────────────────────────────
        $elviraStats = [
            'atk'         => 1102,
            'def'         => 634,
            'hp'          => 5782,
            'spd'         => 120,
            'crit_chance' => 15,
            'crit_dmg'    => 150,
            'eff'         => 0,
            'res'         => 0,
        ];

        $elviraSkills = [
            'S1' => [
                'name'        => 'Rift Cleave',
                'description' => 'Has a 75% chance to inflict seal on the enemy for 2 turns before attacking. When used on the caster\'s turn, has a 40% chance to activate Twisted Strike as an extra attack. Twisted Strike: Attacks all enemies, absorbing some of the damage dealt as Health, and has a 35% chance to inflict fear for 1 turn. When the caster is granted engulf, effect chance is doubled.',
                'rate'        => 0.9,
                'pow'         => 1,
                'soulburn'    => true,
                'soulburn_souls' => 10,
                'soulburn_effect' => 'Increases chance of activating Twisted Strike to 100%.',
            ],
            'S2' => [
                'name'        => 'Craving Affection',
                'description' => 'At the start of battle, grants engulf. When attacking, penetrates the target\'s Defense, and cannot trigger a critical hit or heavy blow. After an ally uses a skill, for each debuff inflicted on all enemies, has a 25% chance to increase Combat Readiness by 10%.',
                'passive'     => true,
            ],
            'S3' => [
                'name'        => 'Wave of Curses',
                'description' => 'Has a 35% chance to inflict curse on all enemies except for the target for 2 turns before attacking the enemy, and increases Combat Readiness of the caster by 50%. When the caster is granted engulf, effect chance is doubled.',
                'rate'        => 1.2,
                'pow'         => 1,
                'cooldown'    => 5,
                'targets'     => 1,
            ],
        ];

        $elviraSelfDevotion = [
            'type'   => 'eff',
            'grades' => [
                'B'   => 0.06,
                'A'   => 0.09,
                'S'   => 0.12,
                'SS'  => 0.15,
                'SSS' => 0.18,
            ],
        ];

        $elviraImageUrl = 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c2148_su.png';
        $elviraDataHash = hash('sha256', json_encode(['code' => 'tidal-rift-elvira', 'name' => 'Tidal Rift Elvira', 'source' => 'ceciliabot-2026-07-26']));

        DB::table('heroes')->upsert(
            [
                [
                    'code'          => 'tidal-rift-elvira',
                    'hero_code'     => 'c2148',
                    'name'          => 'Tidal Rift Elvira',
                    'slug'          => 'tidal-rift-elvira',
                    'element'       => 'dark',
                    'class'         => 'mage',
                    'rarity'        => 5,
                    'base_stats'    => json_encode($elviraStats),
                    'skills'        => json_encode($elviraSkills),
                    'self_devotion' => json_encode($elviraSelfDevotion),
                    'image_url'     => $elviraImageUrl,
                    'data_hash'     => $elviraDataHash,
                    'created_at'    => $now,
                    'updated_at'    => $now,
                ],
            ],
            ['code'],
            [
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
        // HERO 2: Aube
        // ──────────────────────────────────────────────────────────────
        $aubeStats = [
            'atk'         => 993,
            'def'         => 611,
            'hp'          => 6002,
            'spd'         => 120,
            'crit_chance' => 15,
            'crit_dmg'    => 150,
            'eff'         => 0,
            'res'         => 0,
        ];

        $aubeSkills = [
            'S1' => [
                'name'        => 'Coral Swell',
                'description' => 'Attacks the enemy with coral magic and decreases Combat Readiness by 15%.',
                'rate'        => 0.9,
                'pow'         => 1,
            ],
            'S2' => [
                'name'        => 'Film Fiesta',
                'description' => 'Releases the moment engraved in the film, with a 70% chance to grant cascade to all allies. Grants skill nullifier once and an extra turn to the caster.',
                'cooldown'    => 3,
            ],
            'S3' => [
                'name'        => 'Eternal Moment',
                'description' => 'Fixes all enemies in a frame, dispelling two buffs before a 70% chance each to inflict immobilize and restrict for 2 turns. Concealment will remain throughout the battle.',
                'rate'        => 1.0,
                'pow'         => 1,
                'cooldown'    => 7,
                'targets'     => 4,
                'soulburn'    => true,
                'soulburn_souls' => 10,
                'soulburn_effect' => 'Ignores Effect Resistance.',
            ],
        ];

        $aubeSelfDevotion = [
            'type'   => 'atk',
            'grades' => [
                'B'   => 0.048,
                'A'   => 0.072,
                'S'   => 0.096,
                'SS'  => 0.12,
                'SSS' => 0.144,
            ],
        ];

        $aubeImageUrl = 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c5190_su.png';
        $aubeDataHash = hash('sha256', json_encode(['code' => 'aube', 'name' => 'Aube', 'source' => 'ceciliabot-2026-07-26']));

        DB::table('heroes')->upsert(
            [
                [
                    'code'          => 'aube',
                    'hero_code'     => 'c5190',
                    'name'          => 'Aube',
                    'slug'          => 'aube',
                    'element'       => 'ice',
                    'class'         => 'ranger',
                    'rarity'        => 5,
                    'base_stats'    => json_encode($aubeStats),
                    'skills'        => json_encode($aubeSkills),
                    'self_devotion' => json_encode($aubeSelfDevotion),
                    'image_url'     => $aubeImageUrl,
                    'data_hash'     => $aubeDataHash,
                    'created_at'    => $now,
                    'updated_at'    => $now,
                ],
            ],
            ['code'],
            [
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
        // ARTIFACT: Intoxicating Indulgence
        // ──────────────────────────────────────────────────────────────
        DB::table('artifacts')->upsert(
            [
                [
                    'code'        => 'a0245',
                    'name'        => 'Intoxicating Indulgence',
                    'name_es'     => 'Obsesión Vertiginosa',
                    'slug'        => 'intoxicating-indulgence',
                    'class'       => 'mage',
                    'rarity'      => 5,
                    'description' => 'Increases Attack. When the caster attacks, increases Combat Readiness of the caster.',
                    'image_url'   => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0245_fu.png',
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ],
            ],
            ['code'],
            [
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
        DB::table('artifacts')->where('code', 'a0245')->delete();
        DB::table('heroes')->where('code', 'aube')->delete();
        DB::table('heroes')->where('code', 'tidal-rift-elvira')->delete();
    }
};
