<?php

namespace Database\Seeders;

use App\Models\Hero;
use Illuminate\Database\Seeder;

class HecateSeeder extends Seeder
{
    /**
     * Run the database seeds to add Hecate hero.
     */
    public function run(): void
    {
        Hero::updateOrCreate(
            ['code' => 'hecate'],
            [
                'hero_code' => 'c1178',
                'name' => 'Hecate',
                'slug' => 'hecate',
                'element' => 'earth',
                'class' => 'warrior',
                'rarity' => 5,
                'base_stats' => [
                    'atk' => 966,
                    'def' => 657,
                    'hp' => 7323,
                    'spd' => 102,
                    'chc' => 15,
                    'chd' => 150,
                    'eff' => 0,
                    'efr' => 0,
                    'dac' => 3,
                ],
                'skills' => [
                    [
                        'id' => 1,
                        'name' => "Reaper's Scythe",
                        'type' => 'active',
                        'souls' => 1,
                        'cooldown' => 0,
                        'description' => "Attacks the enemy with Sigurd Scythe, before increasing Combat Readiness of the caster by 20%. When used on the caster's turn, activates Final Deliverance as an extra attack. Final Deliverance: Attacks all enemies, before granting stealth to the caster for 1 turn and decreasing skill cooldowns by 2 turns.",
                        'enhancements' => [
                            '+5% damage dealt',
                            '+5% damage dealt',
                            '+5% damage dealt',
                            '+5% damage dealt',
                            '+10% damage dealt',
                        ],
                    ],
                    [
                        'id' => 2,
                        'name' => "Death's Dominion",
                        'type' => 'passive',
                        'souls' => 0,
                        'cooldown' => 0,
                        'description' => "Enemy Heroes cannot revive and cannot be granted immortality. When attacking, penetrates the target's Defense by 85%, and cannot trigger a critical hit or a heavy blow.",
                        'enhancements' => [
                            '+2% Defense penetration',
                            '+2% Defense penetration',
                            '+3% Defense penetration',
                            '+3% Defense penetration',
                            '+5% Defense penetration',
                        ],
                    ],
                    [
                        'id' => 3,
                        'name' => 'Inescapable Demise',
                        'type' => 'active',
                        'souls' => 3,
                        'cooldown' => 6,
                        'description' => "After granting increased Attack to the caster for 3 turns, attacks the enemy by releasing the force of the netherworld. When the target is a Hero, ignores damage share. Begins the first battle with a full skill cooldown count.",
                        'soulburn' => [
                            'souls' => 10,
                            'effect' => 'Grants increased Attack (Greater) for 3 turns.',
                        ],
                        'enhancements' => [
                            '+5% damage dealt',
                            '+5% damage dealt',
                            '+5% damage dealt',
                            '+5% damage dealt',
                            '+10% damage dealt',
                        ],
                    ],
                ],
                'self_devotion' => [
                    'type' => 'health',
                    'grades' => [
                        'D' => 3.6,
                        'C' => 4.5,
                        'B' => 5.4,
                        'A' => 7.2,
                        'S' => 9.0,
                        'SS' => 10.8,
                        'SSS' => 12.9,
                    ],
                ],
                'image_url' => null, // Will use datamined images from DBE7
            ]
        );

        $this->command->info('Hecate hero added successfully!');
    }
}
