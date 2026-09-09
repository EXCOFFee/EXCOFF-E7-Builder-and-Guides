<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Seed: Lisette (c2186), Uncharted Pioneer Politis (c5112), Light and Darkness (a0249), Land of Lingering Light (a0250)
 *
 * Hero 1 : Lisette — 5★ Light Soul Weaver (released 2026-09)
 * Source  : https://ceciliabot.github.io/#/hero/lisette
 * Image   : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c2186_su.png
 *
 * Hero 2 : Uncharted Pioneer Politis — 5★ Ice Ranger (released 2026-09)
 * Source  : https://ceciliabot.github.io/#/hero/uncharted-pioneer-politis
 * Image   : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c5112_su.png
 *
 * Artifact 1: Light and Darkness / Luz y Oscuridad
 * Image     : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0249_fu.png
 *
 * Artifact 2: Land of Lingering Light / La Tierra donde permanece la Luz
 * Image     : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0250_fu.png
 *
 * Usage: php artisan migrate
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        // ──────────────────────────────────────────────────────────────
        // HERO 1: Lisette
        // ──────────────────────────────────────────────────────────────
        $lisetteStats = [
            'atk'         => 621,
            'def'         => 703,
            'hp'          => 5254,
            'spd'         => 104,
            'crit_chance' => 15,
            'crit_dmg'    => 150,
            'eff'         => 0,
            'res'         => 0,
        ];

        $lisetteSkills = [
            'S1' => [
                'name'        => 'Guidance of Salvation',
                'description' => 'Attacks the enemy with celestial power. Increases Combat Readiness of the ally with the highest Attack by 15%.',
                'rate'        => 1,
                'pow'         => 1,
            ],
            'S2' => [
                'name'        => 'Purification of the Mind',
                'description' => 'When an enemy uses a non-attack skill, dispels one debuff from all allies and grants stealth and barrier to the ally with the highest Attack for 2 turns. Barrier strength increases proportional to the caster\'s max Health.',
                'passive'     => true,
            ],
            'S3' => [
                'name'        => 'Prayer for Continuation',
                'description' => 'Dispels all debuffs from all allies and recovers Health, before granting immunity for 2 turns and skill nullifier once. Re-grants buffs when an ally is revived. Health recovered increases proportional to the caster\'s max Health.',
                'cooldown'    => 5,
                'soulburn'    => true,
                'soulburn_souls' => 20,
                'soulburn_effect' => 'Grants an extra turn.',
            ],
        ];

        $lisetteSelfDevotion = [
            'type'   => 'res',
            'grades' => [
                'B'   => 0.09,
                'A'   => 0.14,
                'S'   => 0.19,
                'SS'  => 0.23,
                'SSS' => 0.27,
            ],
        ];

        $lisetteImageUrl = 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c2186_su.png';
        $lisetteDataHash = hash('sha256', json_encode(['code' => 'lisette', 'name' => 'Lisette', 'source' => 'ceciliabot-2026-09-09']));

        DB::table('heroes')->upsert(
            [
                [
                    'code'          => 'lisette',
                    'hero_code'     => 'c2186',
                    'name'          => 'Lisette',
                    'slug'          => 'lisette',
                    'element'       => 'light',
                    'class'         => 'manauser',
                    'rarity'        => 5,
                    'base_stats'    => json_encode($lisetteStats),
                    'skills'        => json_encode($lisetteSkills),
                    'self_devotion' => json_encode($lisetteSelfDevotion),
                    'image_url'     => $lisetteImageUrl,
                    'data_hash'     => $lisetteDataHash,
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
        // HERO 2: Uncharted Pioneer Politis
        // ──────────────────────────────────────────────────────────────
        $politisStats = [
            'atk'         => 993,
            'def'         => 611,
            'hp'          => 6002,
            'spd'         => 120,
            'crit_chance' => 15,
            'crit_dmg'    => 150,
            'eff'         => 0,
            'res'         => 0,
        ];

        $politisSkills = [
            'S1' => [
                'name'        => 'Pulse Deployment',
                'description' => 'Attacks all enemies with light, with a 50% chance to dispel one buff. Deals 1000 additional damage regardless of whether the attack hits.',
                'rate'        => 0.8,
                'pow'         => 1,
                'targets'     => 4,
            ],
            'S2' => [
                'name'        => 'Survivor\'s Mission',
                'description' => 'At the start of battle, when in the front row, grants offense mission, and when in the back row, grants defense mission. When a mission is complete, dispels the mission and all debuffs from the caster, and activates Last Words of a Fallen Star. Last Words of a Fallen Star: Grants knowledge of the stars to all allies, and grants an extra turn to the caster.',
                'passive'     => true,
            ],
            'S3' => [
                'name'        => 'Light Piercing the End',
                'description' => 'Attacks all enemies with a drone, dispelling all buffs before increasing skill cooldowns by 1 turn. Deals 3000 additional damage regardless of whether the attack hits.',
                'rate'        => 1,
                'pow'         => 1,
                'cooldown'    => 7,
                'targets'     => 4,
                'soulburn'    => true,
                'soulburn_souls' => 20,
                'soulburn_effect' => 'Ignores Effect Resistance.',
            ],
        ];

        $politisSelfDevotion = [
            'type'   => 'eff',
            'grades' => [
                'B'   => 0.09,
                'A'   => 0.14,
                'S'   => 0.19,
                'SS'  => 0.23,
                'SSS' => 0.27,
            ],
        ];

        $politisImageUrl = 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c5112_su.png';
        $politisDataHash = hash('sha256', json_encode(['code' => 'uncharted-pioneer-politis', 'name' => 'Uncharted Pioneer Politis', 'source' => 'ceciliabot-2026-09-09']));

        DB::table('heroes')->upsert(
            [
                [
                    'code'          => 'uncharted-pioneer-politis',
                    'hero_code'     => 'c5112',
                    'name'          => 'Uncharted Pioneer Politis',
                    'slug'          => 'uncharted-pioneer-politis',
                    'element'       => 'ice',
                    'class'         => 'ranger',
                    'rarity'        => 5,
                    'base_stats'    => json_encode($politisStats),
                    'skills'        => json_encode($politisSkills),
                    'self_devotion' => json_encode($politisSelfDevotion),
                    'image_url'     => $politisImageUrl,
                    'data_hash'     => $politisDataHash,
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
        // ARTIFACT 1: Light and Darkness
        // ──────────────────────────────────────────────────────────────
        DB::table('artifacts')->upsert(
            [
                [
                    'code'        => 'a0249',
                    'name'        => 'Light and Darkness',
                    'name_es'     => 'Luz y Oscuridad',
                    'slug'        => 'light-and-darkness',
                    'class'       => 'ranger',
                    'rarity'      => 5,
                    'description' => 'After using an attack that targets all enemies, deals 2000 additional damage, and has a 100% chance to decrease the Combat Readiness of the target by 15%.',
                    'image_url'   => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0249_fu.png',
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

        // ──────────────────────────────────────────────────────────────
        // ARTIFACT 2: Land of Lingering Light
        // ──────────────────────────────────────────────────────────────
        DB::table('artifacts')->upsert(
            [
                [
                    'code'        => 'a0250',
                    'name'        => 'Land of Lingering Light',
                    'name_es'     => 'La Tierra donde permanece la Luz',
                    'slug'        => 'land-of-lingering-light',
                    'class'       => null,
                    'rarity'      => 5,
                    'description' => 'Increases the Friendship acquired after completing a stage in Adventure, Side Story, Spirit Altar, Emergency Mission, Hunt, Rift, and Otherworld Breach by the Hero who has this Artifact equipped by 100%. When more than one Friendship increase effect is granted, only the strongest effect is applied. The skill effect of this Artifact does not increase when enhanced.',
                    'image_url'   => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0250_fu.png',
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
        DB::table('artifacts')->whereIn('code', ['a0249', 'a0250'])->delete();
        DB::table('heroes')->whereIn('code', ['lisette', 'uncharted-pioneer-politis'])->delete();
    }
};
