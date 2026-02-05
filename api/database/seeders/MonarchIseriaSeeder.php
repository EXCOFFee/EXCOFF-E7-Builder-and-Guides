<?php

namespace Database\Seeders;

use App\Models\Hero;
use Illuminate\Database\Seeder;

class MonarchIseriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Hero::updateOrCreate(
            ['code' => 'c6024'], // Unique identifier
            [
                'name' => 'Monarch of the Sword Iseria',
                'slug' => 'monarch-of-the-sword-iseria',
                'hero_code' => 'c6024',
                'element' => 'light',
                'class' => 'knight', // Knight
                'rarity' => 5,
                
                // Base Stats from Screenshot
                'base_stats' => [
                    'atk' => 1112,
                    'def' => 645,
                    'hp' => 6321,
                    'spd' => 100,
                    'crit_chance' => 15,
                    'crit_dmg' => 150,
                    'eff' => 0,
                    'res' => 0,
                    'dual_attack' => 3,
                ],

                // Skills from Screenshots/Cecilia
                'skills' => [
                    'S1' => [
                        'name' => 'Revelation',
                        'description' => "Attacks the enemy with sword fragments. Penetrates the target's Defense. When triggered as a counterattack, activates Sword of Duty instead.\n\nSword of Duty: After inflicting fracture on the caster, attacks the enemy with the ritual sword, and increases Combat Readiness of the caster and the foremost ally except for the caster by 20%. Inflicts additional damage proportional to the caster's Attack on the target and up to 20% injuries.",
                        'pow' => 1.0, // Placeholder
                        'rate' => 1.0, // Placeholder
                        'soulburn' => true,
                        'soulburn_souls' => 10,
                        'soulburn_effect' => 'Increases damage dealt.',
                        'targets' => 1,
                    ],
                    'S2' => [
                        'name' => "Elbris's Successor",
                        'description' => "Increases Penetration Resistance by 50%. All counterattack chances of the caster are doubled, and when counterattacking, if the target is a Hero, triggers a counterattack from the foremost ally. After attacking, grants a barrier (proportional to Attack) to the caster for 2 turns.",
                        'passive' => true,
                        'cooldown' => 0,
                        'rate' => 0,
                        'pow' => 0,
                    ],
                    'S3' => [
                        'name' => 'Dawnbreaker',
                        'description' => "After inflicting fracture on the caster and dispelling all debuffs, attacks all enemies with the power of the ritual sword. Inflicts additional damage proportional to the caster's Attack on the target and up to 25% injuries.",
                        'cooldown' => 3,
                        'souls' => 2,
                        'rate' => 1.0, // Placeholder
                        'pow' => 1.0, // Placeholder
                        'targets' => 4, // AoE
                    ],
                ],

                // Imprint Data
                // Release: Health +10.8% (SSS)
                // Concentration: Attack +18% (SSS)
                'self_devotion' => [
                    'type' => 'att_rate', // Concentration Type
                    'grades' => [
                        'D' => 0.054, // Estimates based on SSS=18% (usually linear steps)
                        'C' => 0.072,
                        'B' => 0.090,
                        'A' => 0.108,
                        'S' => 0.126,
                        'SS' => 0.144,
                        'SSS' => 0.18,
                    ],
                ],
                
                // Construct Image URL
                'image_url' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c6024_su.png',
                
                'data_hash' => md5('monarch-of-the-sword-iseria-c6024-v1'),
            ]
        );

        $this->command->info('Monarch of the Sword Iseria (c6024) seeded successfully!');
    }
}
