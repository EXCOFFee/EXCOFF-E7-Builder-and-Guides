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
                        'name_es' => 'Garras Carmesí',
                        'name_ko' => '진홍의 발톱',
                        'name_ja' => '深紅の爪',
                        'name_zh' => '猩红之爪',
                        'name_pt' => 'Garras Carmesim',
                        'description' => "After inflicting rupture on the enemy for 1 turn, attacks the enemy. A successful attack always results in a critical hit. Damage dealt increases proportional to the caster's max Health. When the caster is granted immortality, triggers a Dual Attack from the ally with the highest Attack.",
                        'description_es' => 'Después de infligir ruptura en el enemigo por 1 turno, ataca al enemigo. Un ataque exitoso siempre resulta en golpe crítico. El daño infligido aumenta proporcionalmente a la Vida máxima de la lanzadora. Cuando la lanzadora tiene inmortalidad, activa un Ataque Dual del aliado con mayor Ataque.',
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'soulburn' => true,
                        'soulburn_effect' => 'Increases damage dealt.',
                        'soulburn_souls' => 20,
                    ],
                    'S2' => [
                        'name' => "Noias's Guidance",
                        'name_es' => 'Guía de Noias',
                        'name_ko' => '노이아스의 인도',
                        'name_ja' => 'ノイアスの導き',
                        'name_zh' => '诺亚斯的引导',
                        'name_pt' => 'Orientação de Noias',
                        'description' => "At the start of battle, grants immortality for 1 turn. When granted immortality, increases Effect Resistance by 200%. When someone uses a Soulburn, dispels all debuffs from the caster before activating Dark Moon. Dark Moon: Dispels two buffs from all enemies, before granting immortality to the caster for 3 turns and increasing Combat Readiness by 35%.",
                        'description_es' => 'Al inicio de la batalla, otorga inmortalidad por 1 turno. Cuando tiene inmortalidad, aumenta la Resistencia a Efectos en 200%. Cuando alguien usa Soulburn, disipa todos los debuffs de la lanzadora antes de activar Luna Oscura. Luna Oscura: Disipa dos beneficios de todos los enemigos, antes de otorgar inmortalidad a la lanzadora por 3 turnos y aumentar la Preparación de Combate en 35%.',
                        'rate' => 0,
                        'pow' => 0,
                        'passive' => true,
                        'cooldown' => 4,
                        'soulburn' => false,
                    ],
                    'S3' => [
                        'name' => 'Endless Darkness',
                        'name_es' => 'Oscuridad Infinita',
                        'name_ko' => '끝없는 어둠',
                        'name_ja' => '終わりなき闘',
                        'name_zh' => '无尽黑暗',
                        'name_pt' => 'Escuridão Infinita',
                        'description' => "After inflicting seal on all enemies for 2 turns, attacks them and decreases Combat Readiness by 30%. A successful attack always results in a critical hit. When the caster is granted immortality, ignores Effect Resistance. Damage dealt increases proportional to the caster's max Health.",
                        'description_es' => 'Después de infligir sello a todos los enemigos por 2 turnos, los ataca y reduce la Preparación de Combate en 30%. Un ataque exitoso siempre resulta en golpe crítico. Cuando la lanzadora tiene inmortalidad, ignora Resistencia a Efectos. El daño infligido aumenta proporcionalmente a la Vida máxima de la lanzadora.',
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
                'image_url' => 'https://moccasin-sparrow-217730.hostingersite.com/images/heroes/c2076_su.png',
                'data_hash' => md5('shepherd-of-the-dark-diene-c2076-v1'),
            ]
        );

        $this->command->info('Shepherd of the Dark Diene hero added successfully!');
    }
}
