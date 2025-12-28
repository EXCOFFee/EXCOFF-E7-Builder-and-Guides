<?php

namespace Database\Seeders;

use App\Models\Hero;
use Illuminate\Database\Seeder;

class ShepherdDieneSeeder extends Seeder
{
    /**
     * Run the database seeds to add Shepherd of the Dark Diene hero.
     */
    public function run(): void
    {
        Hero::updateOrCreate(
            ['code' => 'shepherd-of-the-dark-diene'],
            [
                'hero_code' => 'c2076',
                'name' => 'Shepherd of the Dark Diene',
                'slug' => 'shepherd-of-the-dark-diene',
                'element' => 'dark',
                'class' => 'mage',
                'rarity' => 5,
                'base_stats' => [
                    'atk' => 1039,
                    'def' => 613,
                    'hp' => 6034,
                    'spd' => 124,
                    'crit_chance' => 15,
                    'crit_dmg' => 150,
                    'eff' => 0,
                    'res' => 0,
                    'dual_attack' => 3,
                ],
                'skills' => [
                    'S1' => [
                        'name' => 'Crimson Claws',
                        'description' => "After inflicting rupture on the enemy for 1 turn, attacks the enemy. A successful attack always results in a critical hit. Damage dealt increases proportional to the caster's max Health. When the caster is granted immortality, triggers a Dual Attack from the ally with the highest Attack.",
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'soulburn' => true,
                        'soulburn_effect' => 'Increases damage dealt.',
                        'soulburn_souls' => 20,
                    ],
                    'S2' => [
                        'name' => "Noias's Guidance",
                        'description' => "At the start of battle, grants immortality for 1 turn. When granted immortality, increases Effect Resistance by 200%. When someone uses a Soulburn, dispels all debuffs from the caster before activating Dark Moon. Dark Moon: Dispels two buffs from all enemies, before granting immortality to the caster for 3 turns and increasing Combat Readiness by 35%.",
                        'rate' => 0,
                        'pow' => 0,
                        'passive' => true,
                        'cooldown' => 4,
                        'soulburn' => false,
                    ],
                    'S3' => [
                        'name' => 'Endless Darkness',
                        'description' => "After inflicting seal on all enemies for 2 turns, attacks them and decreases Combat Readiness by 30%. A successful attack always results in a critical hit. When the caster is granted immortality, ignores Effect Resistance. Damage dealt increases proportional to the caster's max Health.",
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'cooldown' => 5,
                        'souls' => 3,
                        'soulburn' => false,
                    ],
                ],
                'self_devotion' => [
                    'type' => 'max_hp_rate',
                    'grades' => [
                        'D' => 0.054,
                        'C' => 0.072,
                        'B' => 0.090,
                        'A' => 0.108,
                        'S' => 0.126,
                        'SS' => 0.144,
                        'SSS' => 0.18,
                    ],
                ],
                'image_url' => 'https://moccasin-sparrow-217730.hostingersite.com/images/heroes/c2076_l.png',
                'data_hash' => md5('shepherd-of-the-dark-diene-c2076-v1'),
            ]
        );

        $this->command->info('Shepherd of the Dark Diene hero added successfully!');
    }
}
