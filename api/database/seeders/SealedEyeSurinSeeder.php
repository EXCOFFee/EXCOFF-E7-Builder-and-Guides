<?php

namespace Database\Seeders;

use App\Models\Hero;
use Illuminate\Database\Seeder;

class SealedEyeSurinSeeder extends Seeder
{
    /**
     * Run the database seeds to add Sealed Eye Surin hero.
     */
    public function run(): void
    {
        Hero::updateOrCreate(
            ['code' => 'sealed-eye-surin'],
            [
                'hero_code' => 'c6065',
                'name' => 'Sealed Eye Surin',
                'slug' => 'sealed-eye-surin',
                'element' => 'dark',
                'class' => 'mage',
                'rarity' => 4,
                'base_stats' => [
                    'atk' => 1218,
                    'def' => 683,
                    'hp' => 4521,
                    'spd' => 106,
                    'crit_chance' => 15,
                    'crit_dmg' => 150,
                    'eff' => 18,
                    'res' => 0,
                    'dual_attack' => 3,
                ],
                'skills' => [
                    'S1' => [
                        'name' => 'Repel',
                        'description' => "Attacks the enemy with a chain axe, with a 60% chance to inflict decreased Defense for 1 turn. When the caster is granted rage, activates Eradication as an extra attack. Eradication: Attacks the enemy, inflicting bleed for 2 turns, and at the end of the turn, detonates bleed effects inflicted on the target. Ignores Effect Resistance.",
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'soulburn' => false,
                    ],
                    'S2' => [
                        'name' => 'Abyss Observer',
                        'description' => "At the start of battle and at the end of the turn, grants stealth to the caster for 1 turn. At the end of someone's turn, when an enemy is inflicted with provoke or redirected provoke, grants rage to the caster for 2 turns and increases Combat Readiness by 20%.",
                        'rate' => 0,
                        'pow' => 0,
                        'passive' => true,
                        'soulburn' => false,
                    ],
                    'S3' => [
                        'name' => 'Unexpected Accident',
                        'description' => "After granting increased Attack to the caster for 2 turns, attacks all enemies by staging an accident, inflicting three bleeding effects for 1 turn. When the target is inflicted with provoke or redirected provoke, extends duration of bleed inflicted on the target by 1 turn. When the caster is granted rage, ignores Effect Resistance.",
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'cooldown' => 4,
                        'souls' => 2,
                        'soulburn' => true,
                        'soulburn_effect' => 'Grants an extra turn.',
                        'soulburn_souls' => 20,
                    ],
                ],
                // 4-star Attack self imprint values
                'self_devotion' => [
                    'type' => 'att_rate',
                    'grades' => [
                        'C' => 0.036,
                        'B' => 0.054,
                        'A' => 0.072,
                        'S' => 0.09,
                        'SS' => 0.108,
                        'SSS' => 0.14,
                    ],
                ],
                'image_url' => 'https://moccasin-sparrow-217730.hostingersite.com/images/heroes/c6065_l.png',
                'data_hash' => md5('sealed-eye-surin-c6065-v1'),
            ]
        );

        $this->command->info('Sealed Eye Surin hero added successfully!');
    }
}
