<?php

namespace Database\Seeders;

use App\Models\Artifact;
use App\Models\Hero;
use Illuminate\Database\Seeder;

class NewHeroesAndArtifactsApril2026Seeder extends Seeder
{
    /**
     * Run the database seeds for April 2026 update.
     */
    public function run(): void
    {
        // -------------------------------------------------------------
        // HEROES
        // -------------------------------------------------------------

        // 1. Perfumer Byblis (Fire Soul Weaver, c5154)
        Hero::updateOrCreate(
            ['code' => 'perfumer-byblis'],
            [
                'hero_code' => 'c5154',
                'name' => 'Perfumer Byblis',
                'slug' => 'perfumer-byblis',
                'element' => 'fire',
                'class' => 'soul_weaver', // 'manauser' in CeciliaBot schema
                'rarity' => 5,

                // Base Stats (from web)
                'base_stats' => [
                    'atk' => 640,
                    'hp' => 5340,
                    'def' => 720,
                    'spd' => 106,
                    'crit_chance' => 15,
                    'crit_dmg' => 150,
                    'eff' => 0,
                    'res' => 0,
                    'dual_attack' => 5,
                ],

                // Skills
                'skills' => [
                    'S1' => [
                        'name' => 'Rose Breeze',
                        'description' => "Attacks the enemy with scented paper, and has a 60% (Max 75%) chance to inflicted decreased Defense for 1 turn.",
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'cooldown' => 0,
                        'soulburn' => true,
                        'soulburn_souls' => 10,
                        'soulburn_effect' => 'Triggers a Dual Attack from the ally with the highest Attack.',
                        'targets' => 1,
                    ],
                    'S2' => [
                        'name' => 'Elixir de Belle Nuit',
                        'description' => "At the start of an enemy's turn, grants lingering fragrance to all allies for 1 turn. When an ally's Health is 50% or less after being attacked, activates La Vie en Rose.\nLa Vie en Rose: Dispels two debuffs from all allies and recovers Health before granting a barrier for 2 turns. Amount recovered and barrier strength increase proportional to the caster's max Health.",
                        'rate' => 0,
                        'pow' => 0,
                        'cooldown' => 3,
                        'soulburn' => false,
                        'passive' => true,
                        'targets' => 4, // All allies
                    ],
                    'S3' => [
                        'name' => 'Aura de la Mort',
                        'description' => "After granting increased Effectiveness to the caster for 3 turns, spreads the scent of death, inflicting redirected provoke on all enemies for 1 turn and a 70% (Max 100%) chance to inflict two venom effects for 2 turns. At the end of the turn, detonates venom effects inflicted on the target.",
                        'rate' => 0,
                        'pow' => 0,
                        'cooldown' => 4,
                        'souls' => 2,
                        'soulburn' => false,
                        'targets' => 4, // All enemies
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

                'image_url' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/face/c5154_su.png',
                'data_hash' => md5('perfumer-byblis-c5154-v1'),
            ]
        );
        $this->command->info('Hero Perfumer Byblis added!');

        // -------------------------------------------------------------
        // ARTIFACTS
        // -------------------------------------------------------------

        // 1. Veritas
        Artifact::updateOrCreate(
            ['code' => 'veritas'],
            [
                'name' => 'Veritas',
                'name_es' => 'Veritas',
                'slug' => 'veritas',
                'rarity' => 5,
                'description' => "At the end of every 3 enemy turns, increase Combat Readiness of the caster by 10% (Max 20%) and has a 50% (Max 100%) chance to dispel one debuff. This Artifact's skill effect can only apply to one Hero within a team.",
                'image_url' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0234_fu.png',
            ]
        );
        $this->command->info('Artifact Veritas added!');
    }
}
