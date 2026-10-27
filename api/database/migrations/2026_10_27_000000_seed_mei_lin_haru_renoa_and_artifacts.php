<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Seed: Mei Lin (c1191), Haru (c1192), Renoa (c1193) — Chaos Zero Nightmare collab
 * Artifacts: Flame Dragon's Jewel (a0247), Sorrow of the Rose (a0248), Custom-Made Power Anchor (a0246)
 *
 * Stats lv60 6★ awakened, imprint grades y multiplicadores: Fribbels (e7-optimizer-game-data herodata.json)
 * Textos de skills/artefactos: CeciliaBot API (getItem). Skills con mejoras completas, artefactos con valor +30.
 *
 * Hero 1 : Mei Lin — 5★ Fire Thief
 * Source : https://ceciliabot.github.io/#/hero/mei-lin
 * Image  : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c1191_su.png
 *
 * Hero 2 : Haru — 5★ Ice Warrior
 * Source : https://ceciliabot.github.io/#/hero/haru
 * Image  : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c1192_su.png
 *
 * Hero 3 : Renoa — 5★ Dark Ranger
 * Source : https://ceciliabot.github.io/#/hero/renoa
 * Image  : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c1193_su.png
 *
 * Artifact 1: Flame Dragon's Jewel / Gema del dragón de fuego (Mei Lin)
 * Image     : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0247_fu.png
 *
 * Artifact 2: Sorrow of the Rose / La pena de la rosa (Renoa)
 * Image     : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0248_fu.png
 *
 * Artifact 3: Custom-Made Power Anchor / Ancla de poder especial personalizada (Haru)
 * Image     : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0246_fu.png
 *
 * Usage: php artisan migrate
 */
return new class extends Migration
{
    private const HERO_UPDATE_COLUMNS = [
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
    ];

    private const ARTIFACT_UPDATE_COLUMNS = [
        'name',
        'name_es',
        'slug',
        'class',
        'rarity',
        'description',
        'image_url',
        'updated_at',
    ];

    public function up(): void
    {
        $now = now();

        // ──────────────────────────────────────────────────────────────
        // HERO 1: Mei Lin
        // ──────────────────────────────────────────────────────────────
        $meiLinStats = [
            'atk'         => 1208,
            'def'         => 508,
            'hp'          => 5178,
            'spd'         => 121,
            'crit_chance' => 15,
            'crit_dmg'    => 165,
            'eff'         => 0,
            'res'         => 0,
        ];

        $meiLinSkills = [
            'S1' => [
                'name'        => 'Strike',
                'description' => 'Attacks the enemy with a fist, before increasing Combat Readiness of the caster by 25% and decreasing skill cooldowns by 1 turn. A successful attack always results in a critical hit.',
                'rate'        => 0.9,
                'pow'         => 1,
                'targets'     => 1,
            ],
            'S2' => [
                'name'        => 'Rising Dragon Spire',
                'description' => 'After granting increased Attack to the caster for 2 turns, attacks the enemy with a kick, and when the enemy is defeated, inflicts extinction. A successful attack always results in a critical hit. When a Fire elemental ally uses a skill, grants zeal, which enhances Rising Dragon Spire.',
                'rate'        => 1,
                'pow'         => 0.95,
                'cooldown'    => 3,
                'targets'     => 1,
            ],
            'S3' => [
                'name'        => 'Heavenly Flame Dragon',
                'description' => 'Fully recovers Health of the caster and grants an extra turn. On the next attack, grants an extra attack with the same skill. Begins the first battle with full skill cooldown count, and the lower stat between Attack and Defense becomes equal to the higher stat.',
                'cooldown'    => 9,
            ],
        ];

        $meiLinSelfDevotion = [
            'type'   => 'att_rate',
            'grades' => [
                'B'   => 0.07,
                'A'   => 0.11,
                'S'   => 0.15,
                'SS'  => 0.18,
                'SSS' => 0.21,
            ],
        ];

        // ──────────────────────────────────────────────────────────────
        // HERO 2: Haru
        // ──────────────────────────────────────────────────────────────
        $haruStats = [
            'atk'         => 966,
            'def'         => 657,
            'hp'          => 7323,
            'spd'         => 102,
            'crit_chance' => 15,
            'crit_dmg'    => 150,
            'eff'         => 0,
            'res'         => 0,
        ];

        $haruSkills = [
            'S1' => [
                'name'        => 'Power Anchor',
                'description' => "Attacks the enemy with an anchor, and grants a barrier to all allies for 1 turn. Damage dealt and barrier strength increase proportional to the caster's max Health. At the start of the turn, when Focus is full, changes to Power Strike. Power Strike (Consume 5 Focus): Attacks the enemy, and grants an extra turn to the caster. Penetrates the target's Defense. Unaffected by elemental disadvantage. Damage dealt increases proportional to the caster's max Health. The changed attack does not trigger a Dual Attack.",
                'rate'        => 1,
                'pow'         => 1,
                'targets'     => 1,
            ],
            'S2' => [
                'name'        => 'Anchor Pointer',
                'description' => 'At the start of battle, gains 3 Focus, and has a 100% chance to grant indomitable to all allies for 1 turn. At the start of the turn, when the caster has a buff, dispels all debuffs from the caster and resets skill cooldown of Anchor Shot.',
                'passive'     => true,
            ],
            'S3' => [
                'name'            => 'Anchor Shot',
                'description'     => "Attacks the enemy with an anchor, absorbing some of the damage dealt as Health, and granting morale to all allies for 2 turns. When the target is granted a barrier, penetrates the target's Defense by 70%. Damage dealt increases proportional to the caster's Max Health. Damage dealt increases every time this skill is used, stacking up to 5 times.",
                'rate'            => 1,
                'pow'             => 1,
                'cooldown'        => 4,
                'targets'         => 1,
                'soulburn'        => true,
                'soulburn_souls'  => 10,
                'soulburn_effect' => 'Increases Hit Chance by 100% when using this skill.',
            ],
        ];

        $haruSelfDevotion = [
            'type'   => 'cri',
            'grades' => [
                'B'   => 0.06,
                'A'   => 0.09,
                'S'   => 0.12,
                'SS'  => 0.15,
                'SSS' => 0.18,
            ],
        ];

        // ──────────────────────────────────────────────────────────────
        // HERO 3: Renoa
        // ──────────────────────────────────────────────────────────────
        $renoaStats = [
            'atk'         => 970,
            'def'         => 603,
            'hp'          => 5299,
            'spd'         => 122,
            'crit_chance' => 27,
            'crit_dmg'    => 150,
            'eff'         => 0,
            'res'         => 0,
        ];

        $renoaSkills = [
            'S1' => [
                'name'        => 'Instant Judgement',
                'description' => "Attacks the enemy with a pistol. Damage dealt increases proportional to the caster's Defense. At the start of the turn, when Focus is full, changes to Black Thorn. Black Thorn (Consumes 5 Focus): Attacks the enemy with thorns, and grants the maximum number of Dirge Bullets to the caster. Damage dealt increases proportional to the caster's Defense. The changed attack does not trigger a Dual Attack.",
                'rate'        => 0.8,
                'pow'         => 0.85,
                'targets'     => 1,
            ],
            'S2' => [
                'name'        => 'Black Rose',
                'description' => "Buffs and debuffs applied to the caster become Dirge Bullets. After using a skill on the caster's turn, when the caster has a Dirge Bullet, uses Dirge Bullet on a random enemy. Dirge Bullet (Gains 1 Focus): Attacks the enemy with a pistol. Damage dealt increases proportional to the caster's Defense. Damage dealt and attack count increase proportional to the number of Dirge Bullets granted.",
                'passive'     => true,
            ],
            'S3' => [
                'name'            => 'Flower of Devoured Fate',
                'description'     => 'Increases Combat Readiness of all allies by 50%, and grants three Dirge Bullets to the caster.',
                'cooldown'        => 6,
                'soulburn'        => true,
                'soulburn_souls'  => 10,
                'soulburn_effect' => 'The number of Dirge Bullets granted is doubled.',
            ],
        ];

        $renoaSelfDevotion = [
            'type'   => 'def_rate',
            'grades' => [
                'B'   => 0.07,
                'A'   => 0.11,
                'S'   => 0.15,
                'SS'  => 0.18,
                'SSS' => 0.21,
            ],
        ];

        $heroes = [
            ['mei-lin', 'c1191', 'Mei Lin', 'fire', 'thief', $meiLinStats, $meiLinSkills, $meiLinSelfDevotion],
            ['haru', 'c1192', 'Haru', 'ice', 'warrior', $haruStats, $haruSkills, $haruSelfDevotion],
            ['renoa', 'c1193', 'Renoa', 'dark', 'ranger', $renoaStats, $renoaSkills, $renoaSelfDevotion],
        ];

        foreach ($heroes as [$code, $heroCode, $name, $element, $class, $stats, $skills, $selfDevotion]) {
            DB::table('heroes')->upsert(
                [
                    [
                        'code'          => $code,
                        'hero_code'     => $heroCode,
                        'name'          => $name,
                        'slug'          => $code,
                        'element'       => $element,
                        'class'         => $class,
                        'rarity'        => 5,
                        'base_stats'    => json_encode($stats),
                        'skills'        => json_encode($skills),
                        'self_devotion' => json_encode($selfDevotion),
                        'image_url'     => "https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/{$heroCode}_su.png",
                        'data_hash'     => hash('sha256', json_encode(['code' => $code, 'name' => $name, 'source' => 'fribbels+ceciliabot-2026-10-27'])),
                        'created_at'    => $now,
                        'updated_at'    => $now,
                    ],
                ],
                ['code'],
                self::HERO_UPDATE_COLUMNS
            );
        }

        // ──────────────────────────────────────────────────────────────
        // ARTIFACTS
        // ──────────────────────────────────────────────────────────────
        $artifacts = [
            [
                'code'        => 'a0247',
                'name'        => "Flame Dragon's Jewel",
                'name_es'     => 'Gema del dragón de fuego',
                'slug'        => 'flame-dragons-jewel',
                'class'       => 'thief',
                'description' => 'Increases Attack by 20%. After being attacked, has a 100% chance to decrease debuff durations of the caster by 1 turn.',
                'image_url'   => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0247_fu.png',
            ],
            [
                'code'        => 'a0248',
                'name'        => 'Sorrow of the Rose',
                'name_es'     => 'La pena de la rosa',
                'slug'        => 'sorrow-of-the-rose',
                'class'       => 'ranger',
                'description' => 'At the start of battle and at the start of every third ally turn, grants a random buff to the caster for 1 turn. (Increase Attack, Immunity, Increase Critical Hit Resistance, Barrier proportional to max Health) The skill effect of this Artifact does not increase when enhanced.',
                'image_url'   => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0248_fu.png',
            ],
            [
                'code'        => 'a0246',
                'name'        => 'Custom-Made Power Anchor',
                'name_es'     => 'Ancla de poder especial personalizada',
                'slug'        => 'custom-made-power-anchor',
                'class'       => 'warrior',
                'description' => "At the start of the first battle, has a 100% chance to gain 10 Soul. After an ally is attacked by a Single Attack, increases the caster's Combat Readiness by 16%. This Artifact's skill effect can only apply to one Hero within a team.",
                'image_url'   => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0246_fu.png',
            ],
        ];

        foreach ($artifacts as $artifact) {
            DB::table('artifacts')->upsert(
                [
                    $artifact + [
                        'rarity'     => 5,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ],
                ],
                ['code'],
                self::ARTIFACT_UPDATE_COLUMNS
            );
        }
    }

    public function down(): void
    {
        DB::table('artifacts')->whereIn('code', ['a0246', 'a0247', 'a0248'])->delete();
        DB::table('heroes')->whereIn('code', ['mei-lin', 'haru', 'renoa'])->delete();
    }
};
