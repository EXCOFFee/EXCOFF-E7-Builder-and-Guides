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
                        'name_es' => "Guadaña del Segador",
                        'name_ko' => "사신의 낫",
                        'name_ja' => "死神の鎌",
                        'name_zh' => "死神之鐮",
                        'name_pt' => "Foice do Ceifador",
                        'type' => 'active',
                        'description' => "Attacks the enemy with Sigurd Scythe, before increasing Combat Readiness of the caster by 20%. When used on the caster's turn, activates Final Deliverance as an extra attack. Final Deliverance: Attacks all enemies, before granting stealth to the caster for 1 turn and decreasing skill cooldowns by 2 turns.",
                        'description_es' => "Ataca al enemigo con la Guadaña de Sigurd, antes de aumentar la Preparación de Combate del lanzador en un 20%. Cuando se usa en el turno del lanzador, activa Liberación Final como un ataque extra. Liberación Final: Ataca a todos los enemigos, antes de otorgar sigilo al lanzador durante 1 turno y reducir los tiempos de reutilización de habilidades en 2 turnos.",
                        'description_ko' => "시구르드의 낫으로 적을 공격하고 시전자의 전투 준비도를 20% 증가시킵니다. 시전자의 턴에 사용하면 최후의 해방을 추가 공격으로 발동합니다. 최후의 해방: 모든 적을 공격하고 시전자에게 1턴 동안 은신을 부여하며 스킬 쿨다운을 2턴 감소시킵니다.",
                        'description_ja' => "シグルドの大鎌で敵を攻撃し、術者の戦闘準備度を20%増加させます。術者のターンに使用すると、最後の解放を追加攻撃として発動します。最後の解放：全ての敵を攻撃し、術者に1ターンのステルスを付与し、スキルクールダウンを2ターン減少させます。",
                        'description_zh' => "使用西格爾德之鐮攻擊敵人，並將施法者的戰鬥準備度提高20%。在施法者回合使用時，會發動終極解放作為額外攻擊。終極解放：攻擊所有敵人，並給予施法者1回合隱身，同時減少技能冷卻時間2回合。",
                        'description_pt' => "Ataca o inimigo com a Foice de Sigurd, antes de aumentar a Prontidão de Combate do conjurador em 20%. Quando usado no turno do conjurador, ativa Libertação Final como um ataque extra. Libertação Final: Ataca todos os inimigos, antes de conceder furtividade ao conjurador por 1 turno e diminuir os tempos de recarga das habilidades em 2 turnos.",
                    ],
                    [
                        'id' => 2,
                        'name' => "Death's Dominion",
                        'name_es' => "Dominio de la Muerte",
                        'name_ko' => "죽음의 지배",
                        'name_ja' => "死の支配",
                        'name_zh' => "死亡統治",
                        'name_pt' => "Domínio da Morte",
                        'type' => 'passive',
                        'description' => "Enemy Heroes cannot revive and cannot be granted immortality. When attacking, penetrates the target's Defense by 85%, and cannot trigger a critical hit or a heavy blow.",
                        'description_es' => "Los Héroes enemigos no pueden revivir ni se les puede otorgar inmortalidad. Al atacar, penetra la Defensa del objetivo en un 85% y no puede activar golpe crítico ni golpe pesado.",
                        'description_ko' => "적 영웅들은 부활할 수 없으며 불사를 부여받을 수 없습니다. 공격 시, 대상의 방어력을 85% 관통하며, 치명타나 강타를 발동할 수 없습니다.",
                        'description_ja' => "敵のヒーローは復活できず、不死を付与されることもできません。攻撃時、対象の防御力を85%貫通し、クリティカルヒットや強打を発動することはできません。",
                        'description_zh' => "敵方英雄無法復活，也無法獲得不死。攻擊時，穿透目標85%的防禦力，且無法觸發暴擊或重擊。",
                        'description_pt' => "Heróis inimigos não podem reviver e não podem receber imortalidade. Ao atacar, penetra 85% da Defesa do alvo e não pode ativar acerto crítico ou golpe pesado.",
                    ],
                    [
                        'id' => 3,
                        'name' => 'Inescapable Demise',
                        'name_es' => "Muerte Ineludible",
                        'name_ko' => "피할 수 없는 죽음",
                        'name_ja' => "逃れられぬ死",
                        'name_zh' => "無法逃脫的死亡",
                        'name_pt' => "Morte Inevitável",
                        'type' => 'active',
                        'cooldown' => 6,
                        'description' => "After granting increased Attack to the caster for 3 turns, attacks the enemy by releasing the force of the netherworld. When the target is a Hero, ignores damage share. Begins the first battle with a full skill cooldown count.",
                        'description_es' => "Después de otorgar aumento de Ataque al lanzador durante 3 turnos, ataca al enemigo liberando la fuerza del inframundo. Cuando el objetivo es un Héroe, ignora el reparto de daño. Comienza la primera batalla con el contador de reutilización de habilidad completo.",
                        'description_ko' => "시전자에게 3턴 동안 공격력 증가를 부여한 후, 저승의 힘을 방출하여 적을 공격합니다. 대상이 영웅인 경우 피해 분담을 무시합니다. 첫 번째 전투는 스킬 쿨다운이 완전히 찬 상태로 시작합니다.",
                        'description_ja' => "術者に3ターンの攻撃力増加を付与した後、冥界の力を解放して敵を攻撃します。対象がヒーローの場合、ダメージ分担を無視します。最初の戦闘はスキルクールダウンが完全に溜まった状態で開始します。",
                        'description_zh' => "給予施法者3回合攻擊力提升後，釋放冥界之力攻擊敵人。當目標是英雄時，忽略傷害分擔。第一場戰鬥開始時技能冷卻時間已滿。",
                        'description_pt' => "Após conceder aumento de Ataque ao conjurador por 3 turnos, ataca o inimigo liberando a força do submundo. Quando o alvo é um Herói, ignora o compartilhamento de dano. Começa a primeira batalha com a contagem de recarga de habilidade completa.",
                    ],
                ],
                'self_devotion' => [
                    'type' => 'atk',
                    'grades' => [
                        'B' => 0.054,
                        'A' => 0.072,
                        'S' => 0.108,
                        'SS' => 0.126,
                        'SSS' => 0.18,
                    ],
                ],
                'image_url' => null,
                'data_hash' => md5('hecate-c1178-v2'),
            ]
        );

        $this->command->info('Hecate hero added successfully!');
    }
}
