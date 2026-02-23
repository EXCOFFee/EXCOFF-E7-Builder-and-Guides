<?php

namespace Database\Seeders;

use App\Models\Hero;
use Illuminate\Database\Seeder;

class RuizaSeeder extends Seeder
{
    /**
     * Run the database seeds to add Ruiza hero.
     */
    public function run(): void
    {
        Hero::updateOrCreate(
            ['code' => 'ruiza'],
            [
                'hero_code' => 'c1180',
                'name' => 'Ruiza',
                'slug' => 'ruiza',
                'element' => 'fire',
                'class' => 'ranger',
                'rarity' => 5,

                // Base Stats
                'base_stats' => [
                    'atk' => 993,
                    'def' => 611,
                    'hp' => 6020,
                    'spd' => 120,
                    'crit_chance' => 15,
                    'crit_dmg' => 150,
                    'eff' => 0,
                    'res' => 0,
                    'dual_attack' => 5,
                ],

                // Skills
                'skills' => [
                    'S1' => [
                        'name' => 'Liquidation',
                        'description' => "Attacks the enemy with a whip, and grants increased Speed to the caster for 1 turn. Deals additional damage equivalent to 50% of injuries inflicted on the target.",
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'cooldown' => 0,
                        'soulburn' => false,
                        'targets' => 1,
                    ],
                    'S2' => [
                        'name' => 'Deflection',
                        'description' => "Creates a gust of wind, dispelling two buffs from all enemies and decreasing Combat Readiness by 15%, before spreading the selected target's debuffs. Grants stealth to the caster for 2 turns.",
                        'rate' => 0,
                        'pow' => 0,
                        'cooldown' => 4,
                        'soulburn' => false,
                        'targets' => 4, // AoE (non-attack)
                    ],
                    'S3' => [
                        'name' => 'Demolition',
                        'description' => "Attacks the enemy by destroying the surroundings, dispelling all buffs from the target and decreasing Combat Readiness by 50% before a 75% chance each to inflict laceration and silence for 2 turns. Increases Combat Readiness of the caster by 50%. At the start of the first battle, grants stealth for 2 turns.",
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'cooldown' => 5,
                        'souls' => 3,
                        'soulburn' => true,
                        'soulburn_souls' => 20,
                        'soulburn_effect' => 'Ignores Effect Resistance.',
                        'targets' => 1,
                    ],
                ],

                // Imprint Data
                // Self Devotion (Concentration): Effectiveness
                // Release: Attack %
                'self_devotion' => [
                    'type' => 'acc', // Effectiveness (Concentration)
                    'grades' => [
                        'D' => 0.036,
                        'C' => 0.048,
                        'B' => 0.060,
                        'A' => 0.072,
                        'S' => 0.084,
                        'SS' => 0.096,
                        'SSS' => 0.12,
                    ],
                ],

                // Image URL
                'image_url' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c1180_su.png',

                'data_hash' => md5('ruiza-c1180-v1'),
            ]
        );

        $this->command->info('Ruiza (c1180) seeded successfully!');
    }
}
