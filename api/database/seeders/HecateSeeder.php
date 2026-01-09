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
                    'S1' => [
                        'name' => "Reaper's Scythe",
                        'name_es' => 'Guadaña del Segador',
                        'name_ko' => '사신의 낫',
                        'name_ja' => '死神の大鎌',
                        'name_zh' => '死神镰刀',
                        'name_pt' => 'Foice do Ceifador',
                        'description' => "Attacks the enemy with Sigurd Scythe, before increasing Combat Readiness of the caster by 20%. When used on the caster's turn, activates Final Deliverance as an extra attack. Final Deliverance: Attacks all enemies, before granting stealth to the caster for 1 turn and decreasing skill cooldowns by 2 turns.",
                        'description_es' => 'Ataca al enemigo con la Guadaña de Sigurd, antes de aumentar la Preparación de Combate de la lanzadora en un 20%. Cuando se usa en el turno de la lanzadora, activa Liberación Final como un ataque extra. Liberación Final: Ataca a todos los enemigos, antes de otorgar sigilo a la lanzadora por 1 turno y reducir los enfriamientos de habilidad en 2 turnos.',
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'soulburn' => false,
                    ],
                    'S2' => [
                        'name' => "Death's Dominion",
                        'name_es' => 'Dominio de la Muerte',
                        'name_ko' => '죽음의 지배',
                        'name_ja' => '死の支配',
                        'name_zh' => '死亡领域',
                        'name_pt' => 'Domínio da Morte',
                        'description' => "Enemy Heroes cannot revive and cannot be granted immortality. When attacking, penetrates the target's Defense by 85%, and cannot trigger a critical hit or a heavy blow.",
                        'description_es' => 'Los héroes enemigos no pueden revivir y no se les puede otorgar inmortalidad. Al atacar, penetra la Defensa del objetivo en un 85%, y no puede activar golpe crítico o golpe pesado.',
                        'rate' => 0,
                        'pow' => 0,
                        'penetration' => 0.85,
                        'soulburn' => false,
                    ],
                    'S3' => [
                        'name' => 'Inescapable Demise',
                        'name_es' => 'Muerte Inevitable',
                        'name_ko' => '피할 수 없는 죽음',
                        'name_ja' => '逃れられぬ死',
                        'name_zh' => '无法逃脱的死亡',
                        'name_pt' => 'Morte Inevitável',
                        'description' => "After granting increased Attack to the caster for 3 turns, attacks the enemy by releasing the force of the netherworld. When the target is a Hero, ignores damage share. Begins the first battle with a full skill cooldown count.",
                        'description_es' => 'Después de otorgar Ataque aumentado a la lanzadora por 3 turnos, ataca al enemigo liberando la fuerza del inframundo. Cuando el objetivo es un Héroe, ignora el compartir daño. Comienza la primera batalla con el enfriamiento de habilidad completo.',
                        'rate' => 1.0,
                        'pow' => 1.0,
                        'cooldown' => 6,
                        'soulburn' => true,
                        'soulburn_effect' => 'Grants increased Attack (Greater) for 3 turns.',
                        'soulburn_souls' => 10,
                    ],
                ],
                'self_devotion' => [
                    'type' => 'att_rate',
                    'grades' => [
                        'B' => 0.054,
                        'A' => 0.072,
                        'S' => 0.108,
                        'SS' => 0.126,
                        'SSS' => 0.18,
                    ],
                ],
                'image_url' => 'https://moccasin-sparrow-217730.hostingersite.com/images/heroes/c1178_l.png',
                'data_hash' => md5('hecate-c1178-v4'),
            ]
        );

        $this->command->info('Hecate hero added successfully!');
    }
}
