<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Seed: Rhianna and Luciella (c2185)
 *
 * Hero  : Rhianna and Luciella — 5★ Moonlight Dark Thief (released 2026-06)
 * Source: https://ceciliabot.github.io/#/hero/rhianna-and-luciella
 * Image : https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c2185_su.png
 *
 * Notes:
 * - Code c2185 (Moonlight heroes use c2### prefix)
 * - Exceptionally high base Speed (132), designed as an Opener/DPS/Debuffer
 * - S2 grants a unique buff (Rhianna's Resolve) providing evasion, effectiveness, and crit damage
 * - Kit designed around extra turns, Bind, Defense Break, Fear debuffs and ignoring damage sharing
 *
 * Usage: php artisan migrate
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        // ──────────────────────────────────────────────────────────────
        // HERO: Rhianna and Luciella
        // ──────────────────────────────────────────────────────────────
        $heroStats = [
            'atk'         => 1119,
            'def'         => 536,
            'hp'          => 4988,
            'spd'         => 132,
            'crit_chance' => 23,
            'crit_dmg'    => 150,
            'eff'         => 0,
            'res'         => 0,
        ];

        $heroSkills = [
            'S1' => [
                'name'        => 'Dual Strike',
                'description' => 'Rhianna attacks the enemy, with a 75% chance to inflict Bind for 1 turn. Then, Luciella attacks the enemy, with the attack ignoring damage sharing. Damage dealt increases proportional to the caster\'s Speed.',
                'rate'        => 0.95,
                'pow'         => 1,
                'selfSpdScaling' => 0.00075,
            ],
            'S2' => [
                'name'        => 'Rhianna\'s Resolve',
                'description' => 'At the start of battle and when an ally is defeated, gains Rhianna\'s Resolve (non-dispellable) for 2 turns. Rhianna\'s Resolve: Increases Evasion, Effectiveness, and Critical Damage. While in this state, after Dual Strike, grants an extra turn.',
                'passive'     => true,
            ],
            'S3' => [
                'name'        => 'Phantom Execution',
                'description' => 'Rhianna attacks all enemies, with a 75% chance to inflict Defense Break for 2 turns. Then, Luciella attacks all enemies, with a 75% chance to inflict Fear for 1 turn. Both attacks ignore damage sharing and penetrate Defense by 30%. Damage dealt increases proportional to the caster\'s Speed.',
                'rate'        => 0.85,
                'pow'         => 1,
                'selfSpdScaling' => 0.00075,
                'penetration' => 0.3,
                'cooldown'    => 5,
                'targets'     => 3,
            ],
        ];

        $heroSelfDevotion = [
            'type'   => 'cri',
            'grades' => [
                'B'   => 0.056,
                'A'   => 0.084,
                'S'   => 0.112,
                'SS'  => 0.14,
                'SSS' => 0.168,
            ],
        ];

        $heroImageUrl = 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c2185_su.png';
        $heroDataHash = hash('sha256', json_encode(['code' => 'rhianna-and-luciella', 'name' => 'Rhianna and Luciella', 'source' => 'ceciliabot-2026-06-04']));

        DB::table('heroes')->upsert(
            [
                [
                    'code'          => 'rhianna-and-luciella',
                    'hero_code'     => 'c2185',
                    'name'          => 'Rhianna and Luciella',
                    'slug'          => 'rhianna-and-luciella',
                    'element'       => 'dark',
                    'class'         => 'thief',
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
    }

    public function down(): void
    {
        DB::table('heroes')->where('code', 'rhianna-and-luciella')->delete();
    }
};
