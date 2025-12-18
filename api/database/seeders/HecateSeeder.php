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
                    'crit_chance' => 15,
                    'crit_dmg' => 150,
                    'eff' => 0,
                    'res' => 0,
                ],
                'skills' => [
                    [
                        'id' => 1,
                        'name' => "Reaper's Scythe",
                        'type' => 'active',
                        'description' => "Attacks the enemy with Sigurd Scythe, before increasing Combat Readiness of the caster by 20%. When used on the caster's turn, activates Final Deliverance as an extra attack. Final Deliverance: Attacks all enemies, before granting stealth to the caster for 1 turn and decreasing skill cooldowns by 2 turns.",
                    ],
                    [
                        'id' => 2,
                        'name' => "Death's Dominion",
                        'type' => 'passive',
                        'description' => "Enemy Heroes cannot revive and cannot be granted immortality. When attacking, penetrates the target's Defense by 85%, and cannot trigger a critical hit or a heavy blow.",
                    ],
                    [
                        'id' => 3,
                        'name' => 'Inescapable Demise',
                        'type' => 'active',
                        'cooldown' => 6,
                        'description' => "After granting increased Attack to the caster for 3 turns, attacks the enemy by releasing the force of the netherworld. When the target is a Hero, ignores damage share. Begins the first battle with a full skill cooldown count.",
                    ],
                ],
                'self_devotion' => [
                    'type' => 'atk',
                    'grades' => [
                        'B' => 0.048,
                        'A' => 0.072,
                        'S' => 0.096,
                        'SS' => 0.12,
                        'SSS' => 0.18,
                    ],
                ],
                'image_url' => null,
                'data_hash' => md5('hecate-c1178'),
            ]
        );

        $this->command->info('Hecate hero added successfully!');
    }
}
