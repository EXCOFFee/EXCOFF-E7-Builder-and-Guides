<?php

namespace Database\Seeders;

use App\Models\Hero;
use Illuminate\Database\Seeder;

class AkiSeeder extends Seeder
{
    /**
     * Run the database seeds to add Aki hero.
     */
    public function run(): void
    {
        Hero::updateOrCreate(
            ['code' => 'aki'],
            [
                'hero_code' => 'c1179',
                'name' => 'Aki',
                'name_ko' => '아키',
                'name_ja' => 'アキ',
                'name_zh' => '亚纪',
                'slug' => 'aki',
                'element' => 'fire',
                'class' => 'warrior',
                'rarity' => 5,
                'base_stats' => [
                    'atk' => 1304,
                    'def' => 668,
                    'hp' => 5663,
                    'spd' => 112,
                    'crit_chance' => 15,
                    'crit_dmg' => 150,
                    'eff' => 0,
                    'res' => 30,
                ],
                'skills' => [
                    'S1' => [
                        'name' => 'Baptism of Fire',
                        'name_es' => 'Bautismo de Fuego',
                        'name_ko' => '화염 세례',
                        'name_ja' => '火の洗礼',
                        'name_zh' => '火焰洗礼',
                        'name_pt' => 'Batismo de Fogo',
                        'description' => 'Attacks the enemy with a blaze, with a 75% chance to inflict burn for 1 turn. At the end of the turn, detonates burn effects inflicted on the target.',
                        'description_es' => 'Ataca al enemigo con una llama, con un 75% de probabilidad de infligir quemadura por 1 turno. Al final del turno, detona los efectos de quemadura infligidos en el objetivo.',
                        'rate' => 0.5,
                        'pow' => 1.0,
                        'detonation' => 1.3,
                        'soulburn' => true,
                        'soulburn_effect' => 'Extends duration of burn by 3 turns, and ignores Effect Resistance. This attack does not trigger a Dual Attack.',
                        'soulburn_souls' => 20,
                    ],
                    'S2' => [
                        'name' => 'Final Radiance',
                        'name_es' => 'Resplandor Final',
                        'name_ko' => '최후의 빛',
                        'name_ja' => '最後の輝き',
                        'name_zh' => '最终光辉',
                        'name_pt' => 'Radiância Final',
                        'description' => 'Increases Attack by 35%. Cannot receive recover Health effects and damage sharing effects. When attacked, damage suffered in one attack does not exceed 51% of max Health. When using Soulburn, if Health exceeds 51%, consumes 51% Health instead of Soul, and grants an extra turn.',
                        'description_es' => 'Aumenta el Ataque en un 35%. No puede recibir efectos de recuperación de Vida ni efectos de compartir daño. Al ser atacado, el daño sufrido en un ataque no excede el 51% de la Vida máxima. Al usar Soulburn, si la Vida supera el 51%, consume 51% de Vida en lugar de Alma y otorga un turno extra.',
                        'rate' => 0,
                        'pow' => 0,
                        'passive' => true,
                        'atk_bonus' => 0.35,
                        'damage_cap' => 0.51,
                        'soulburn' => false,
                    ],
                    'S3' => [
                        'name' => 'Karmic Flame',
                        'name_es' => 'Llama Kármica',
                        'name_ko' => '업화',
                        'name_ja' => '業火',
                        'name_zh' => '业火',
                        'name_pt' => 'Chama Cármica',
                        'description' => 'Attacks the enemy, dispelling all buffs before inflicting decreased Defense for 2 turns, and a 75% chance each to inflict two burn effects for 2 turns. At the end of the turn, detonates burn effects inflicted on the target.',
                        'description_es' => 'Ataca al enemigo, disipando todos los beneficios antes de infligir Defensa reducida por 2 turnos, y un 75% de probabilidad cada uno de infligir dos efectos de quemadura por 2 turnos. Al final del turno, detona los efectos de quemadura infligidos en el objetivo.',
                        'rate' => 0.7,
                        'pow' => 1.1,
                        'detonation' => 1.3,
                        'cooldown' => 5,
                        'soulburn' => true,
                        'soulburn_effect' => 'Ignores Effect Resistance.',
                        'soulburn_souls' => 20,
                    ],
                ],
                'self_devotion' => [
                    'type' => 'max_hp_rate',
                    'grades' => [
                        'B' => 0.054,
                        'A' => 0.072,
                        'S' => 0.09,
                        'SS' => 0.099,
                        'SSS' => 0.108,
                    ],
                ],
                'image_url' => 'https://moccasin-sparrow-217730.hostingersite.com/images/heroes/c1179_su.png',
                'data_hash' => md5('aki-c1179-v1'),
            ]
        );

        $this->command->info('Aki hero added successfully!');
    }
}
