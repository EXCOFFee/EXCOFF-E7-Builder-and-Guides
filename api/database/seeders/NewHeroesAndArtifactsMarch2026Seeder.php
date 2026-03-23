<?php

namespace Database\Seeders;

use App\Models\Artifact;
use App\Models\Hero;
use Illuminate\Database\Seeder;

class NewHeroesAndArtifactsMarch2026Seeder extends Seeder
{
    /**
     * Run the database seeds for March 2026 update.
     */
    public function run(): void
    {
        // -------------------------------------------------------------
        // HEROES
        // -------------------------------------------------------------

        // 1. Notos (Light Knight, c2181)
        Hero::updateOrCreate(
            ['code' => 'notos'],
            [
                'hero_code' => 'c2181',
                'name' => 'Notos',
                'slug' => 'notos',
                'element' => 'light',
                'class' => 'knight',
                'rarity' => 5,

                // Base Stats (from web)
                'base_stats' => [
                    'atk' => 794,
                    'hp' => 7332,
                    'def' => 767,
                    'spd' => 95,
                    'crit_chance' => 15,
                    'crit_dmg' => 150,
                    'eff' => 0,
                    'res' => 0,
                    'dual_attack' => 5,
                ],

                // Skills
                'skills' => [
                    'S1' => [
                        'name' => 'Divinity Release',
                        'description' => "(Notos) Attacks the enemy with divinity and has a 75% chance to inflict decreased Defense for 1 turn. Damage dealt increases proportional to the caster’s max Health.\n(God of Battle) Attacks the enemy and deals additional damage proportional to the caster’s max Health. Damage dealt increases proportional to the caster’s max Health.",
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'cooldown' => 0,
                        'soulburn' => false,
                        'targets' => 1,
                    ],
                    'S2' => [
                        'name' => 'Blaze of Battle',
                        'description' => "(Notos) Unaffected by Combat Readiness increase and decrease effects.\n(God of Battle) Attacks the enemy with transcendent power. Penetrates the target’s Defense by 50%. Damage dealt increases proportional to the caster's max Health.",
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'cooldown' => 2,
                        'soulburn' => true,
                        'soulburn_souls' => 10,
                        'soulburn_effect' => 'Increases damage dealt.',
                        'targets' => 1,
                    ],
                    'S3' => [
                        'name' => 'God’s Might',
                        'description' => "Grants God of Battle to the caster for 3 turns and fully recovers Health. While God of Battle is maintained, changes the battlefield into the Sanctuary of Battle. Begins the first battle with a full skill cooldown count.\n\nSanctuary of Battle\nIn the Sanctuary of Battle, all Heroes are immune to buffs and debuffs.",
                        'rate' => 0,
                        'pow' => 0,
                        'cooldown' => 8,
                        'souls' => 3,
                        'soulburn' => false,
                        'targets' => 0, // Self/Field
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

                'image_url' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c2181_su.png',
                'data_hash' => md5('notos-c2181-v1'),
            ]
        );
        $this->command->info('Hero Notos added!');

        // 2. Tactical Archetype Coli (Ice Assassin, c5033)
        Hero::updateOrCreate(
            ['code' => 'tactical-archetype-coli'],
            [
                'hero_code' => 'c5033',
                'name' => 'Tactical Archetype Coli',
                'slug' => 'tactical-archetype-coli',
                'element' => 'ice',
                'class' => 'thief',
                'rarity' => 5,

                // Base Stats (from web)
                'base_stats' => [
                    'atk' => 1057,
                    'hp' => 5542,
                    'def' => 532,
                    'spd' => 118,
                    'crit_chance' => 15,
                    'crit_dmg' => 150,
                    'eff' => 0,
                    'res' => 0,
                    'dual_attack' => 5,
                ],

                // Skills
                'skills' => [
                    'S1' => [
                        'name' => 'Sweep',
                        'description' => "Attacks the enemy with a blade, with a 55% (Max 75%) chance each to inflict two bleeding effects for 2 turns, and when the caster is granted overload, increases effect chance by 20%. At the end of the turn, detonates bleeding effects inflicted on the target.",
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'cooldown' => 0,
                        'soulburn' => true,
                        'soulburn_souls' => 10,
                        'soulburn_effect' => 'Inflicts one additional bleeding.',
                        'targets' => 1,
                    ],
                    'S2' => [
                        'name' => 'Guard',
                        'description' => "After an ally except for the caster uses a Single Attack, grants swift attack to the ally target, and activates Flank Strike against the enemy target. This effect is not activated by an extra attack, counterattack, or Dual Attack.\nFlank Strike: Attacks the enemy’s flank, dispelling one buff and inflicting decreased Defense for 2 turns, before increasing Combat Readiness of the caster by 15% (Max 20%).",
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'cooldown' => 4,
                        'soulburn' => false,
                        'passive' => true,
                        'targets' => 1,
                    ],
                    'S3' => [
                        'name' => 'Assault',
                        'description' => "After granting overload to the caster for 2 turns, attacks all enemies with maximum output, dispelling two buffs, and has a 75% (Max 100%) chance each to inflict a bomb and frostbite for 2 turns. At the end of the turn, detonates bombs inflicted on the target.",
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'cooldown' => 3,
                        'souls' => 5,
                        'soulburn' => false,
                        'targets' => 4, // AoE
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

                'image_url' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c5033_su.png',
                'data_hash' => md5('tactical-archetype-coli-c5033-v1'),
            ]
        );
        $this->command->info('Hero Tactical Archetype Coli added!');


        // -------------------------------------------------------------
        // ARTIFACTS
        // -------------------------------------------------------------

        // 1. Shadow Winds 7
        Artifact::updateOrCreate(
            ['code' => 'shadow-winds-7'],
            [
                'name' => 'Shadow Winds 7',
                'name_es' => 'Shadow Winds 7',
                'slug' => 'shadow-winds-7',
                'class' => 'thief',
                'rarity' => 5,
                'description' => "Increases Attack by 10% (Max 20%). At the start of the first battle, has a 50% (Max 100%) chance to gain 10 Soul and grant swift attack to the caster. This Artifact's skill effect can only apply to one Hero within a team.",
                'image_url' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0242_fu.png',
            ]
        );
        $this->command->info('Artifact Shadow Winds 7 added!');

        // 2. Glorious Throne
        Artifact::updateOrCreate(
            ['code' => 'glorious-throne'],
            [
                'name' => 'Glorious Throne',
                'name_es' => 'Trono de la Gloria',
                'slug' => 'glorious-throne',
                'class' => 'knight',
                'rarity' => 5,
                'description' => "After attacking, has a 50% (Max 100%) chance to deal additional damage proportional to the caster's max Health on the target.",
                'image_url' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0240_fu.png',
            ]
        );
        $this->command->info('Artifact Glorious Throne added!');
    }
}
