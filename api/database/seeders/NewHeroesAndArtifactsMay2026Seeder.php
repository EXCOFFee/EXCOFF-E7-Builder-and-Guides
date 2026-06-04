<?php

namespace Database\Seeders;

use App\Models\Artifact;
use App\Models\Hero;
use Illuminate\Database\Seeder;

class NewHeroesAndArtifactsMay2026Seeder extends Seeder
{
    /**
     * Run the database seeds for May 2026 update.
     */
    public function run(): void
    {
        // -------------------------------------------------------------
        // HEROES
        // -------------------------------------------------------------

        // 1. Salome (Dark Warrior, c2184)
        Hero::updateOrCreate(
            ['code' => 'salome'],
            [
                'hero_code' => 'c2184',
                'name' => 'Salome',
                'slug' => 'salome',
                'element' => 'dark',
                'class' => 'warrior',
                'rarity' => 5,

                // Base Stats (from web)
                'base_stats' => [
                    'atk' => 984,
                    'hp' => 6266,
                    'def' => 637,
                    'spd' => 117,
                    'crit_chance' => 15,
                    'crit_dmg' => 150,
                    'eff' => 0,
                    'res' => 0,
                    'dual_attack' => 3,
                ],

                // Skills
                'skills' => [
                    'S1' => [
                        'name' => 'Corrupted Divinity',
                        'description' => "Attacks the enemy with a spear, and triggers a Dual Attack from the ally with the highest Attack. Damage dealt increases proportional to the caster's max Health.",
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'cooldown' => 0,
                        'soulburn' => false,
                        'targets' => 1,
                    ],
                    'S2' => [
                        'name' => 'Salvation',
                        'description' => "Releases divinity, granting skill nullifier once to the caster, and cloning a target Hero except for the caster for 1 turn. Grants an extra turn.\nClone: Clones the target's appearance and abilities. While in the Clone state, seperate skill cooldowns are applied. When dispelled, unique effects granted to the caster by the Clone skill are also dispelled.",
                        'rate' => 0,
                        'pow' => 0,
                        'cooldown' => 5,
                        'soulburn' => false,
                        'targets' => 1, // Target Hero
                    ],
                    'S3' => [
                        'name' => 'Nggdrasil\'s Judgment',
                        'description' => "After inflicting collapse on the enemy for 2 turns, attacks with the power of Nggdrasil, with a 75% (Max 100%) chance to inflict decreased Defense for 2 turns, and deals additional damage to the target. Damage dealt and additional damage increase proportional to the caster's max Health.",
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'cooldown' => 5,
                        'souls' => 3,
                        'soulburn' => true,
                        'soulburn_souls' => 10,
                        'soulburn_effect' => 'Ignores Effect Resistance.',
                        'targets' => 1,
                    ],
                ],

                // Imprints
                'self_devotion' => [
                    'type' => 'att_rate',
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

                'image_url' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c2184_su.png',
                'data_hash' => md5('salome-c2184-v1'),
            ]
        );
        $this->command->info('Hero Salome added!');

        // 2. Estelle (Earth Knight, c1183)
        Hero::updateOrCreate(
            ['code' => 'estelle'],
            [
                'hero_code' => 'c1183',
                'name' => 'Estelle',
                'slug' => 'estelle',
                'element' => 'earth',
                'class' => 'knight',
                'rarity' => 5,

                // Base Stats (from web)
                'base_stats' => [
                    'atk' => 894,
                    'hp' => 6840,
                    'def' => 694,
                    'spd' => 104,
                    'crit_chance' => 15,
                    'crit_dmg' => 150,
                    'eff' => 0,
                    'res' => 0,
                    'dual_attack' => 5,
                ],

                // Skills
                'skills' => [
                    'S1' => [
                        'name' => 'Wind of Protection',
                        'description' => "Attacks the enemy, inflicting up to 10% injuries and recovering the caster's Health. A successful attack always results in a critical hit. Amount recovered and damage dealt increase proportional to the caster's max Health. When it is not the caster's turn, damage dealt and injuries are doubled. After attacking, when Fighting Spirit is full, consumes all Fighting Spirit to activate Wind of Protection.\nWind of Protection (Acquire 10 Soul): Grants a barrier (proportional to the caster's max Health) to all allies for 2 turns, and increases Combat Readiness of the caster by 35%.",
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'cooldown' => 0,
                        'soulburn' => false,
                        'targets' => 1,
                    ],
                    'S2' => [
                        'name' => 'Protective Nature',
                        'description' => "At the start of the first battle, gains 50 Fighting Spirit. Grants 3% (Max 13%) damage sharing from the damage received by the ally. After an ally except for the caster is attacked, when the damage suffered is 20% or more of max Health, dispels all debuffs and counterattacks. Cannot be triggered by extra attacks or counterattacks.",
                        'rate' => 0,
                        'pow' => 0,
                        'cooldown' => 0,
                        'soulburn' => false,
                        'passive' => true,
                        'targets' => 1,
                    ],
                    'S3' => [
                        'name' => 'Dazzling Strike',
                        'description' => "Attacks the enemy with a shield, inflicting up to 20% injuries, and recovering Health of the caster. Penetrates the target's Defense by 50%. A successful attack always results in a critical hit. Amount recovered and damage dealt increase proportional to the caster's max Health.",
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'cooldown' => 4,
                        'souls' => 2,
                        'soulburn' => true,
                        'soulburn_souls' => 10,
                        'soulburn_effect' => 'Skill cooldown is decreased by 2 turns.',
                        'fighting_spirit_gain' => 50,
                        'targets' => 1,
                    ],
                ],

                // Imprints
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

                'image_url' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c1183_su.png',
                'data_hash' => md5('estelle-c1183-v1'),
            ]
        );
        $this->command->info('Hero Estelle added!');

        // -------------------------------------------------------------
        // ARTIFACTS
        // -------------------------------------------------------------

        // 1. With a Little Friend
        Artifact::updateOrCreate(
            ['code' => 'with-a-little-friend'],
            [
                'name' => 'With a Little Friend',
                'name_es' => 'Junto a un Amiguito',
                'slug' => 'with-a-little-friend',
                'class' => 'warrior', // Found as warrior in API
                'rarity' => 5,
                'description' => "Increases max Health by 5% (Max 10%). Decreases damage received from damage sharing by 25% (Max 50%).",
                'image_url' => null, // No image available yet
            ]
        );
        $this->command->info('Artifact With a Little Friend added!');
    }
}
