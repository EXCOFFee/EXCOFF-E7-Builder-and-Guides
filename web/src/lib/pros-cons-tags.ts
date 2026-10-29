/**
 * Tags de pros y contras de las builds (Epic Seven).
 *
 * ARCHIVO GENERADO por web/scripts/tags/build_tags.py desde catalog_spec.py: no editar a mano.
 * Dos niveles para filtrar: grupo (p. ej. "Daño") y categoría (p. ej. "Escalado").
 * Los alias se usan solo para buscar (sinónimos y términos de la comunidad).
 */

export type TagType = 'pro' | 'con';
export type Locale = 'en' | 'es' | 'ja' | 'ko' | 'pt' | 'zh';

export interface TagTranslations {
    en: string;
    es: string;
    ja: string;
    ko: string;
    pt: string;
    zh: string;
}

export interface TagGroup {
    id: string;
    type: TagType;
    labels: TagTranslations;
}

export interface TagCategory {
    id: string;
    group: string;
    type: TagType;
    labels: TagTranslations;
}

export interface Tag {
    id: string;
    type: TagType;
    group: string;
    category: string;
    translations: TagTranslations;
    aliases: string[];
}

const t = (en: string, es: string, ja: string, ko: string, pt: string, zh: string): TagTranslations =>
    ({ en, es, ja, ko, pt, zh });

export const TAG_GROUPS: TagGroup[] = [
    { id: 'role', type: 'pro', labels: t('Role', 'Rol', '役割', '역할', 'Função', '定位') },
    { id: 'damage', type: 'pro', labels: t('Damage', 'Daño', 'ダメージ', '데미지', 'Dano', '伤害') },
    { id: 'survivability', type: 'pro', labels: t('Survivability', 'Supervivencia', '生存能力', '생존력', 'Sobrevivência', '生存') },
    { id: 'control', type: 'pro', labels: t('Control & debuffs', 'Control y debuffs', 'コントロール・デバフ', '컨트롤·디버프', 'Controle e debuffs', '控制与减益') },
    { id: 'speed', type: 'pro', labels: t('Speed & turns', 'Velocidad y turnos', '速度・ターン', '속도·턴', 'Velocidade e turnos', '速度与回合') },
    { id: 'support', type: 'pro', labels: t('Support', 'Apoyo', 'サポート', '서포트', 'Suporte', '辅助') },
    { id: 'content', type: 'pro', labels: t('Content', 'Contenido', 'コンテンツ', '콘텐츠', 'Conteúdo', '玩法') },
    { id: 'fragility', type: 'con', labels: t('Fragility', 'Fragilidad', '脆さ', '취약함', 'Fragilidade', '脆弱') },
    { id: 'offense', type: 'con', labels: t('Limited offense', 'Ofensiva limitada', '火力の弱点', '공격 한계', 'Ofensiva limitada', '输出局限') },
    { id: 'dependencies', type: 'con', labels: t('Dependencies', 'Dependencias', '依存', '의존성', 'Dependências', '依赖') },
    { id: 'speed_issues', type: 'con', labels: t('Speed & turns', 'Velocidad y turnos', '速度・ターン', '속도·턴', 'Velocidade e turnos', '速度与回合') },
    { id: 'weak_to', type: 'con', labels: t('Weak against', 'Débil contra', '苦手', '약점', 'Fraco contra', '怕') },
    { id: 'competitive', type: 'con', labels: t('Competitive', 'Competitivo', '競技面', '경쟁', 'Competitivo', '竞技') },
];

export const TAG_CATEGORIES: TagCategory[] = [
    { id: 'team_role', group: 'role', type: 'pro', labels: t('Team role', 'Rol en el equipo', 'チームでの役割', '팀 역할', 'Papel no time', '队伍定位') },
    { id: 'build_ease', group: 'role', type: 'pro', labels: t('Easy to build', 'Fácil de armar', '育成しやすさ', '육성 난이도', 'Fácil de montar', '易于培养') },
    { id: 'scaling', group: 'damage', type: 'pro', labels: t('Scaling', 'Escalado', 'ダメージ係数', '계수', 'Escalonamento', '伤害系数') },
    { id: 'dmg_type', group: 'damage', type: 'pro', labels: t('Damage type', 'Tipo de daño', '攻撃タイプ', '공격 유형', 'Tipo de dano', '伤害类型') },
    { id: 'bypass', group: 'damage', type: 'pro', labels: t('Bypasses defenses', 'Ignora defensas', '防御無視系', '방어 무시', 'Ignora defesas', '无视类') },
    { id: 'defense', group: 'survivability', type: 'pro', labels: t('Defense', 'Defensa', '防御', '방어', 'Defesa', '防御') },
    { id: 'sustain', group: 'survivability', type: 'pro', labels: t('Healing', 'Curación', '回復', '회복', 'Cura', '回复') },
    { id: 'protection', group: 'survivability', type: 'pro', labels: t('Immunity & protection', 'Inmunidad y protección', '免疫・保護', '면역·보호', 'Imunidade e proteção', '免疫与保护') },
    { id: 'revive', group: 'survivability', type: 'pro', labels: t('Revive', 'Revivir', '蘇生', '부활', 'Reviver', '复活') },
    { id: 'hard_cc', group: 'control', type: 'pro', labels: t('Hard control', 'Control duro', '行動阻害', '하드 CC', 'Controle forte', '硬控') },
    { id: 'debuffs', group: 'control', type: 'pro', labels: t('Debuffs', 'Debuffs', 'デバフ', '디버프', 'Debuffs', '减益') },
    { id: 'anti_buff', group: 'control', type: 'pro', labels: t('Buff denial', 'Anti-buffs', 'バフ対策', '버프 대응', 'Anti-buffs', '反增益') },
    { id: 'punish', group: 'control', type: 'pro', labels: t('Punishes', 'Castiga', '反応・対策', '대응·카운터', 'Pune', '反制') },
    { id: 'self_turns', group: 'speed', type: 'pro', labels: t('Own turns', 'Turnos propios', '自分のターン', '자신의 턴', 'Turnos próprios', '自身回合') },
    { id: 'team_turns', group: 'speed', type: 'pro', labels: t('Team turns', 'Turnos del equipo', '味方のターン', '아군 턴', 'Turnos da equipe', '队友回合') },
    { id: 'enemy_turns', group: 'speed', type: 'pro', labels: t('Enemy turns', 'Turnos enemigos', '敵のターン', '적 턴', 'Turnos inimigos', '敌方回合') },
    { id: 'buffs', group: 'support', type: 'pro', labels: t('Buffs', 'Buffs', 'バフ', '버프', 'Buffs', '增益') },
    { id: 'heal_protect', group: 'support', type: 'pro', labels: t('Heal & protect', 'Cura y protección', '回復・保護', '회복·보호', 'Cura e proteção', '治疗与保护') },
    { id: 'resources', group: 'support', type: 'pro', labels: t('Resources', 'Recursos', 'リソース', '자원', 'Recursos', '资源') },
    { id: 'pvp', group: 'content', type: 'pro', labels: t('PvP', 'PvP', 'PvP', 'PvP', 'PvP', 'PvP') },
    { id: 'draft', group: 'content', type: 'pro', labels: t('RTA draft', 'Draft de RTA', 'RTAドラフト', 'RTA 밴픽', 'Draft do RTA', 'RTA BP') },
    { id: 'pve', group: 'content', type: 'pro', labels: t('PvE', 'PvE', 'PvE', 'PvE', 'PvE', 'PvE') },
    { id: 'fragile', group: 'fragility', type: 'con', labels: t('Fragility', 'Fragilidad', '脆さ', '취약함', 'Fragilidade', '脆弱') },
    { id: 'offense_limits', group: 'offense', type: 'con', labels: t('Limited offense', 'Ofensiva limitada', '火力の弱点', '공격 한계', 'Ofensiva limitada', '输出局限') },
    { id: 'gear', group: 'dependencies', type: 'con', labels: t('Gear & investment', 'Equipo e inversión', '装備・育成', '장비·투자', 'Equipamento e investimento', '装备与投入') },
    { id: 'resources_dep', group: 'dependencies', type: 'con', labels: t('Resources & buffs', 'Recursos y buffs', 'リソース・バフ', '자원·버프', 'Recursos e buffs', '资源与增益') },
    { id: 'team_dep', group: 'dependencies', type: 'con', labels: t('Team & combos', 'Equipo y combos', '編成・コンボ', '조합·콤보', 'Time e combos', '阵容与连招') },
    { id: 'speed_limits', group: 'speed_issues', type: 'con', labels: t('Speed & turns', 'Velocidad y turnos', '速度・ターン', '속도·턴', 'Velocidade e turnos', '速度与回合') },
    { id: 'weak_cc', group: 'weak_to', type: 'con', labels: t('Control', 'Control', '行動阻害', 'CC', 'Controle', '控制') },
    { id: 'weak_debuffs', group: 'weak_to', type: 'con', labels: t('Debuffs & damage', 'Debuffs y daño', 'デバフ・ダメージ', '디버프·데미지', 'Debuffs e dano', '减益与伤害') },
    { id: 'weak_mechanics', group: 'weak_to', type: 'con', labels: t('Mechanics', 'Mecánicas', 'メカニクス', '메커니즘', 'Mecânicas', '机制') },
    { id: 'competitive_main', group: 'competitive', type: 'con', labels: t('Competitive', 'Competitivo', '競技面', '경쟁', 'Competitivo', '竞技') },
];

export const PROS_TAGS: Tag[] = [
    { id: 'meta_opener', type: 'pro', group: 'role', category: 'team_role', translations: t('Opener', 'Opener', 'オープナー', '선턴잡이', 'Opener', '先手'), aliases: ['first turn', 'primer turno', '先攻', '선턴'] },
    { id: 'meta_anchor', type: 'pro', group: 'role', category: 'team_role', translations: t('Anchor', 'Anchor', 'アンカー', '앵커', 'Anchor', '压阵'), aliases: [] },
    { id: 'role_carry', type: 'pro', group: 'role', category: 'team_role', translations: t('Main carry', 'Carry principal', 'メインアタッカー', '메인 딜러', 'Carry principal', '核心输出'), aliases: ['dps', 'dealer', '딜러', '输出'] },
    { id: 'role_bruiser', type: 'pro', group: 'role', category: 'team_role', translations: t('Bruiser', 'Bruiser', 'ブルーザー', '브루저', 'Bruiser', '半肉输出'), aliases: [] },
    { id: 'role_tank', type: 'pro', group: 'role', category: 'team_role', translations: t('Tank', 'Tanque', 'タンク', '탱커', 'Tanque', '坦克'), aliases: ['tanker'] },
    { id: 'role_support', type: 'pro', group: 'role', category: 'team_role', translations: t('Support', 'Soporte', 'サポーター', '서포터', 'Suporte', '辅助'), aliases: ['support'] },
    { id: 'meta_control', type: 'pro', group: 'role', category: 'team_role', translations: t('Controller', 'Controlador', 'コントローラー', '컨트롤러', 'Controlador', '控制位'), aliases: ['cc'] },
    { id: 'meta_cleave', type: 'pro', group: 'role', category: 'team_role', translations: t('Cleave', 'Cleave', 'クリーブ', '클리브', 'Cleave', '核爆'), aliases: ['nuke'] },
    { id: 'meta_aggro', type: 'pro', group: 'role', category: 'team_role', translations: t('Aggro', 'Aggro', 'アグロ', '어그로', 'Aggro', '快攻'), aliases: [] },
    { id: 'anti_cleave', type: 'pro', group: 'role', category: 'team_role', translations: t('Anti-Cleave', 'Anti-Cleave', 'アンチクリーブ', '안티 클리브', 'Anti-Cleave', '反核爆'), aliases: [] },
    { id: 'meta_anticontrol', type: 'pro', group: 'role', category: 'team_role', translations: t('Anti-Control', 'Anti-Control', 'アンチコントロール', '컨트롤 카운터', 'Anti-Controle', '反控制'), aliases: [] },
    { id: 'anti_tank', type: 'pro', group: 'role', category: 'team_role', translations: t('Anti-tank', 'Anti-tanque', 'アンチタンク', '탱커 카운터', 'Anti-tanque', '反坦克'), aliases: ['anti bruiser', 'bruiser'] },
    { id: 'easy_gear', type: 'pro', group: 'role', category: 'build_ease', translations: t('Easy to Gear', 'Fácil de Equipar', '装備難易度低', '장비 쉬움', 'Fácil de Equipar', '装备要求低'), aliases: ['f2p', 'budget'] },
    { id: 'flexible_build', type: 'pro', group: 'role', category: 'build_ease', translations: t('Flexible Builds', 'Builds Flexibles', 'ビルド柔軟', '유연한 세팅', 'Builds Flexíveis', '配装灵活'), aliases: [] },
    { id: 'no_crit_needed', type: 'pro', group: 'role', category: 'build_ease', translations: t('No Crit Needed', 'No Necesita Crítico', 'クリ不要', '치확 불필요', 'Não Precisa de Crítico', '无需暴击'), aliases: [] },
    { id: 'works_without_dupes', type: 'pro', group: 'role', category: 'build_ease', translations: t('Good without dupes', 'Rinde sin duplicados', '凸なしで活躍', '무돌파로도 충분', 'Bom sem duplicatas', '无需重复也好用'), aliases: ['imprint', 'dupes', 'duplicados', '凸', '돌파', '烙印'] },
    { id: 'flexible_artifact', type: 'pro', group: 'role', category: 'build_ease', translations: t('Flexible with artifacts', 'Flexible con artefactos', 'アーティファクトを選ばない', '아티팩트 자유로움', 'Flexível com artefatos', '神器选择灵活'), aliases: ['artifact', 'artefacto', '神器', '아티'] },
    { id: 'no_ee_needed', type: 'pro', group: 'role', category: 'build_ease', translations: t('No exclusive equip needed', 'No necesita EE', '専用装備不要', '전용 장비 불필요', 'Não precisa de EE', '无需专属装备'), aliases: ['ee', 'exclusive', 'exclusivo'] },
    { id: 'damage_hp_scaling', type: 'pro', group: 'damage', category: 'scaling', translations: t('Damage scales with HP', 'Daño escala con HP', 'HPでダメージ増加', 'HP 비례 데미지', 'Dano escala com HP', 'HP比例伤害'), aliases: ['hp'] },
    { id: 'damage_def_scaling', type: 'pro', group: 'damage', category: 'scaling', translations: t('Damage scales with DEF', 'Daño escala con DEF', '防御でダメージ増加', '방어력 비례 데미지', 'Dano escala com DEF', '防御比例伤害'), aliases: ['def'] },
    { id: 'damage_spd_scaling', type: 'pro', group: 'damage', category: 'scaling', translations: t('Damage scales with SPD', 'Daño escala con VEL', '速度でダメージ増加', '속도 비례 데미지', 'Dano escala com VEL', '速度比例伤害'), aliases: ['speed', 'spd'] },
    { id: 'damage_target_hp', type: 'pro', group: 'damage', category: 'scaling', translations: t('Damage scales with enemy HP', 'Daño escala con HP enemigo', '敵HPでダメージ増加', '적 HP 비례 데미지', 'Dano escala com HP inimigo', '敌方HP比例伤害'), aliases: [] },
    { id: 'damage_target_atk', type: 'pro', group: 'damage', category: 'scaling', translations: t('Damage scales with enemy ATK', 'Daño escala con ATK enemigo', '敵攻撃でダメージ増加', '적 공격력 비례 데미지', 'Dano escala com ATK inimigo', '敌方攻击比例伤害'), aliases: [] },
    { id: 'lost_hp_scaling', type: 'pro', group: 'damage', category: 'scaling', translations: t('Scales off Lost HP', 'Escala con HP Perdida', '失ったHP比例', '잃은 생명력 비례', 'Escala com HP Perdida', '已损生命值比例'), aliases: [] },
    { id: 'aoe_damage', type: 'pro', group: 'damage', category: 'dmg_type', translations: t('AoE damage', 'Daño en área (AoE)', '範囲攻撃', '광역 공격', 'Dano em área', '范围伤害'), aliases: ['aoe'] },
    { id: 'single_target_nuke', type: 'pro', group: 'damage', category: 'dmg_type', translations: t('Single target nuke', 'Nuke de objetivo único', '単体高火力', '단일 대상 누킹', 'Nuke de alvo único', '单体爆发'), aliases: ['nuke'] },
    { id: 'one_shot_potential', type: 'pro', group: 'damage', category: 'dmg_type', translations: t('One-Shot Potential', 'Potencial de One-Shot', 'ワンショット性能', '원샷 잠재력', 'Potencial de One-Shot', '秒杀潜力'), aliases: ['one shot'] },
    { id: 'extra_attacks', type: 'pro', group: 'damage', category: 'dmg_type', translations: t('Extra attacks', 'Ataques adicionales', '追加攻撃', '추가 공격', 'Ataques extras', '额外攻击'), aliases: [] },
    { id: 'dual_attack_synergy', type: 'pro', group: 'damage', category: 'dmg_type', translations: t('Dual Attack synergy', 'Sinergia con Dual Attack', '協力攻撃シナジー', '협공 시너지', 'Sinergia com Ataque Duplo', '协同攻击协同'), aliases: ['dual'] },
    { id: 'splash_damage', type: 'pro', group: 'damage', category: 'dmg_type', translations: t('Splash Damage', 'Daño Salpicadura (Splash)', 'スプラッシュダメ', '추가 피해 (스플래시)', 'Dano Splash', '溅射伤害'), aliases: [] },
    { id: 'fixed_damage', type: 'pro', group: 'damage', category: 'dmg_type', translations: t('Fixed damage (ignores DEF)', 'Daño fijo (ignora DEF)', '固定ダメージ', '고정 데미지', 'Dano fixo (ignora DEF)', '固定伤害'), aliases: [] },
    { id: 'detonates_dots', type: 'pro', group: 'damage', category: 'dmg_type', translations: t('Detonates DoTs', 'Detona Sangrado/Quemaduras', '激爆', '격폭 (출혈/화상)', 'Detona DoTs', '激爆'), aliases: ['detonate'] },
    { id: 'high_multipliers', type: 'pro', group: 'damage', category: 'dmg_type', translations: t('High damage multipliers', 'Multiplicadores de daño altos', '高倍率', '높은 배율', 'Multiplicadores altos', '高倍率'), aliases: [] },
    { id: 'guaranteed_crit', type: 'pro', group: 'damage', category: 'dmg_type', translations: t('Guaranteed Crit', 'Crítico Garantizado', '確定クリティカル', '확정 치명타', 'Crítico Garantido', '必定暴击'), aliases: ['crit'] },
    { id: 'mech_execution', type: 'pro', group: 'damage', category: 'dmg_type', translations: t('Execution', 'Ejecución', '処刑', '처형', 'Execução', '处决'), aliases: [] },
    { id: 'reflects_damage', type: 'pro', group: 'damage', category: 'dmg_type', translations: t('Reflects Damage', 'Refleja Daño', 'ダメージ反射', '데미지 반사', 'Reflete Dano', '反射伤害'), aliases: ['reflect'] },
    { id: 'def_penetration', type: 'pro', group: 'damage', category: 'bypass', translations: t('Defense penetration', 'Penetración de defensa', '防御貫通', '방어 관통', 'Penetração de defesa', '防御穿透'), aliases: ['pen'] },
    { id: 'def_ignore_100', type: 'pro', group: 'damage', category: 'bypass', translations: t('Ignores defense (100%)', 'Ignora defensa (100%)', '防御無視', '방어 무시', 'Ignora defesa (100%)', '无视防御'), aliases: [] },
    { id: 'ignores_dmg_sharing', type: 'pro', group: 'damage', category: 'bypass', translations: t('Ignores Damage Sharing', 'Ignora Distribución de Daño', 'ダメージ分配無視', '데미지 분배 무시', 'Ignora Distribuição de Dano', '无视伤害分摊'), aliases: [] },
    { id: 'ignores_dmg_reduction', type: 'pro', group: 'damage', category: 'bypass', translations: t('Ignores Damage Reduction', 'Ignora Reducción de Daño', 'ダメージ軽減無視', '데미지 감소 무시', 'Ignora Redução de Dano', '无视伤害减免'), aliases: [] },
    { id: 'mech_ignore_dmg_limit', type: 'pro', group: 'damage', category: 'bypass', translations: t('Ignores Dmg Limit', 'Ignora Lím. Daño', 'ダメ制限無視', '피해량 제한 무시', 'Ignora Lim. Dano', '无视伤害上限'), aliases: [] },
    { id: 'shield_penetration', type: 'pro', group: 'damage', category: 'bypass', translations: t('Penetrates Shields', 'Penetra Barreras', 'シールド貫通', '보호막 관통', 'Penetra Barreiras', '护盾穿透'), aliases: ['barrier'] },
    { id: 'anti_evasion', type: 'pro', group: 'damage', category: 'bypass', translations: t('Anti-evasion', 'Anti-evasión', '回避無視', '회피 무시', 'Anti-evasão', '无视闪避'), aliases: [] },
    { id: 'elemental_ignore', type: 'pro', group: 'damage', category: 'bypass', translations: t('Ignores Element', 'Ignora Elemento', '属性無視', '속성 무시', 'Ignora Elemento', '无视属性'), aliases: ['element'] },
    { id: 'cannot_trigger_counter', type: 'pro', group: 'damage', category: 'bypass', translations: t('Cannot be countered', 'No activa contrataques', '反撃不可', '반격 불가', 'Não ativa contra-ataques', '无法触发反击'), aliases: ['counter'] },
    { id: 'ignore_effect_res', type: 'pro', group: 'damage', category: 'bypass', translations: t('Ignore Effect Res', 'Ignora Resistencia', '効果抵抗無視', '효저 무시', 'Ignora Resistência', '无视抗性'), aliases: ['er', 'res'] },
    { id: 'high_base_hp', type: 'pro', group: 'survivability', category: 'defense', translations: t('High base HP', 'HP base alta', '高HP', '높은 기본 HP', 'HP base alto', '高基础HP'), aliases: [] },
    { id: 'high_base_def', type: 'pro', group: 'survivability', category: 'defense', translations: t('High base DEF', 'DEF base alta', '高防御', '높은 기본 방어', 'DEF base alta', '高基础防御'), aliases: [] },
    { id: 'damage_reduction', type: 'pro', group: 'survivability', category: 'defense', translations: t('Damage reduction', 'Reducción de daño', 'ダメージ軽減', '데미지 감소', 'Redução de dano', '伤害减免'), aliases: [] },
    { id: 'damage_share', type: 'pro', group: 'survivability', category: 'defense', translations: t('Shares damage with allies', 'Comparte daño con aliados', 'ダメージ分散', '데미지 분산', 'Compartilha dano', '分担伤害'), aliases: [] },
    { id: 'dmg_limit', type: 'pro', group: 'survivability', category: 'defense', translations: t('Damage Limit', 'Límite de Daño Máximo', '被ダメージ制限', '최대 데미지 제한', 'Limite de Dano Máximo', '伤害上限'), aliases: [] },
    { id: 'crit_res_buff', type: 'pro', group: 'survivability', category: 'defense', translations: t('Critical Hit Resistance', 'Resistencia Crítica', 'クリティカル抵抗', '치명타 저항', 'Resistência Crítica', '暴击抗性'), aliases: [] },
    { id: 'penetration_resistance', type: 'pro', group: 'survivability', category: 'defense', translations: t('Penetration Resistance', 'Resistencia a Penetración', '貫通抵抗', '관통 저항', 'Resistência à Penetração', '穿透抗性'), aliases: [] },
    { id: 'evasion_buff', type: 'pro', group: 'survivability', category: 'defense', translations: t('High Evasion', 'Alta Evasión', '高回避', '높은 회피', 'Alta Evasão', '高闪避'), aliases: [] },
    { id: 'barrier_thick', type: 'pro', group: 'survivability', category: 'defense', translations: t('Barrier', 'Barrera', 'バリア', '보호막', 'Barreira', '护盾'), aliases: ['shield'] },
    { id: 'stealth_buff', type: 'pro', group: 'survivability', category: 'defense', translations: t('Grants Stealth', 'Otorga Sigilo', 'ステルス付与', '은신 부여', 'Concede Furtividade', '隐身'), aliases: ['stealth'] },
    { id: 'self_healing', type: 'pro', group: 'survivability', category: 'sustain', translations: t('Self healing', 'Se cura a sí mismo', '自己回復', '자가 회복', 'Auto cura', '自我治疗'), aliases: ['heal'] },
    { id: 'lifesteal_built_in', type: 'pro', group: 'survivability', category: 'sustain', translations: t('Built-in lifesteal', 'Lifesteal incorporado', '内蔵吸血', '내장 흡혈', 'Roubo de vida embutido', '内置吸血'), aliases: [] },
    { id: 'self_immunity', type: 'pro', group: 'survivability', category: 'protection', translations: t('Grants self immunity', 'Se otorga inmunidad', '自己免疫付与', '자체 면역 부여', 'Concede auto imunidade', '自我免疫'), aliases: [] },
    { id: 'skill_nullifier', type: 'pro', group: 'survivability', category: 'protection', translations: t('Grants Skill Nullifier', 'Otorga Skill Nullifier', 'スキル無効化付与', '스킬 무효화 부여', 'Concede Anulação de Skill', '技能无效化'), aliases: [] },
    { id: 'immortality_buff', type: 'pro', group: 'survivability', category: 'protection', translations: t('Grants Immortality', 'Otorga Inmortalidad', '不死付与', '불사 부여', 'Concede Imortalidade', '不死'), aliases: [] },
    { id: 'invincibility_buff', type: 'pro', group: 'survivability', category: 'protection', translations: t('Grants Invincibility', 'Otorga Invencibilidad', '無敵付与', '무적 부여', 'Concede Invencibilidade', '无敌'), aliases: [] },
    { id: 'imperishable', type: 'pro', group: 'survivability', category: 'protection', translations: t('Imperishable (Cannot die)', 'Imperecedero (No muere)', '不滅', '불멸 (죽지 않음)', 'Imperecível (Não morre)', '不灭 (免死)'), aliases: [] },
    { id: 'immune_cc', type: 'pro', group: 'survivability', category: 'protection', translations: t('Immune to control', 'Inmune a control', '行動阻害無効', 'CC 면역', 'Imune a controle', '免疫控制'), aliases: ['stun', 'sleep', 'silence', 'provoke'] },
    { id: 'immune_pushback', type: 'pro', group: 'survivability', category: 'protection', translations: t('Immune to CR Pushback', 'Inmune a Reducción CR', 'ゲージダウン免疫', '행동게이지 감소 면역', 'Imune a Redução CR', '免疫推条'), aliases: [] },
    { id: 'mech_undispellable', type: 'pro', group: 'survivability', category: 'protection', translations: t('Undispellable', 'Indisipable', '解除不可', '해제 불가', 'Indissipável', '无法驱散'), aliases: [] },
    { id: 'revive_ally', type: 'pro', group: 'survivability', category: 'revive', translations: t('Can revive allies', 'Puede revivir aliados', '味方蘇生可能', '아군 부활 가능', 'Pode reviver aliados', '可复活队友'), aliases: [] },
    { id: 'self_revive', type: 'pro', group: 'survivability', category: 'revive', translations: t('Self revive', 'Se revive a sí mismo', '自己蘇生', '자가 부활', 'Auto revive', '自我复活'), aliases: [] },
    { id: 'stun', type: 'pro', group: 'control', category: 'hard_cc', translations: t('Inflicts Stun', 'Inflige Aturdir', 'スタン付与', '기절 부여', 'Inflige Atordoamento', '眩晕'), aliases: [] },
    { id: 'sleep', type: 'pro', group: 'control', category: 'hard_cc', translations: t('Inflicts Sleep', 'Inflige Sueño', '睡眠付与', '수면 부여', 'Inflige Sono', '睡眠'), aliases: [] },
    { id: 'silence', type: 'pro', group: 'control', category: 'hard_cc', translations: t('Inflicts Silence', 'Inflige Silencio', '沈黙付与', '침묵 부여', 'Inflige Silêncio', '沉默'), aliases: [] },
    { id: 'provoke', type: 'pro', group: 'control', category: 'hard_cc', translations: t('Inflicts Provoke', 'Inflige Provocar', '挑発付与', '도발 부여', 'Inflige Provocação', '嘲讽'), aliases: [] },
    { id: 'restrict', type: 'pro', group: 'control', category: 'hard_cc', translations: t('Inflicts Restrict', 'Inflige Restringir', '拘束付与', '구속 부여', 'Inflige Restrição', '禁锢'), aliases: ['bind'] },
    { id: 'fear_debuff', type: 'pro', group: 'control', category: 'hard_cc', translations: t('Inflicts Fear', 'Inflige Miedo', '恐怖付与', '공포 부여', 'Inflige Medo', '造成恐惧'), aliases: [] },
    { id: 'seal_debuff', type: 'pro', group: 'control', category: 'hard_cc', translations: t('Inflicts Seal', 'Inflige Sello', '封印付与', '봉인 부여', 'Inflige Selo', '封印'), aliases: [] },
    { id: 'def_break', type: 'pro', group: 'control', category: 'debuffs', translations: t('Defense Break', 'Rompe Defensa', '防御ダウン', '방어력 감소', 'Quebra de Defesa', '防御下降'), aliases: ['def break', '방깍', '破甲'] },
    { id: 'decrease_atk', type: 'pro', group: 'control', category: 'debuffs', translations: t('Decreases Attack', 'Reduce Ataque', '攻撃ダウン', '공격력 감소', 'Reduz Ataque', '攻击下降'), aliases: [] },
    { id: 'decrease_speed', type: 'pro', group: 'control', category: 'debuffs', translations: t('Decreases Speed', 'Reduce Velocidad', '速度ダウン', '속도 감소', 'Reduz Velocidade', '速度下降'), aliases: [] },
    { id: 'blind', type: 'pro', group: 'control', category: 'debuffs', translations: t('Inflicts Blind', 'Inflige Ceguera', '命中ダウン', '명중 감소', 'Inflige Cegueira', '致盲'), aliases: [] },
    { id: 'target_debuff', type: 'pro', group: 'control', category: 'debuffs', translations: t('Inflicts Target', 'Inflige Objetivo', 'ターゲット付与', '타겟 부여', 'Inflige Alvo', '目标'), aliases: [] },
    { id: 'unhealable', type: 'pro', group: 'control', category: 'debuffs', translations: t('Inflicts Unhealable', 'Inflige Incurable', '回復不能付与', '회복 불가 부여', 'Inflige Incurável', '无法治愈'), aliases: [] },
    { id: 'injury_inflict', type: 'pro', group: 'control', category: 'debuffs', translations: t('Inflicts Injury', 'Aplica Herida', '負傷付与', '부상 발생', 'Aplica Ferimento', '造成创伤'), aliases: [] },
    { id: 'fracture_inflict', type: 'pro', group: 'control', category: 'debuffs', translations: t('Inflicts Fracture', 'Aplica Fractura', '骨折付与', '골절 발생', 'Aplica Fratura', '造成骨折'), aliases: [] },
    { id: 'debuff_burn', type: 'pro', group: 'control', category: 'debuffs', translations: t('Inflicts Burn', 'Inflige Quemadura', '火傷付与', '화상 부여', 'Inflige Queimadura', '造成烧伤'), aliases: ['dot'] },
    { id: 'debuff_bleed', type: 'pro', group: 'control', category: 'debuffs', translations: t('Inflicts Bleed', 'Inflige Sangrado', '出血付与', '출혈 부여', 'Inflige Sangramento', '造成流血'), aliases: ['dot'] },
    { id: 'debuff_poison', type: 'pro', group: 'control', category: 'debuffs', translations: t('Inflicts Poison', 'Inflige Veneno', '毒付与', '중독 부여', 'Inflige Veneno', '造成中毒'), aliases: ['dot'] },
    { id: 'debuff_bomb', type: 'pro', group: 'control', category: 'debuffs', translations: t('Plants Bomb', 'Coloca Bomba', '爆弾付与', '폭탄 설치', 'Coloca Bomba', '安放炸弹'), aliases: ['dot'] },
    { id: 'venom_inflict', type: 'pro', group: 'control', category: 'debuffs', translations: t('Inflicts Venom', 'Inflige Toxina', '猛毒付与', '맹독 부여', 'Inflige Toxina', '造成剧毒'), aliases: [] },
    { id: 'curse_debuff', type: 'pro', group: 'control', category: 'debuffs', translations: t('Inflicts Curse', 'Inflige Maldición', '呪い付与', '저주 부여', 'Inflige Maldição', '造成诅咒'), aliases: [] },
    { id: 'stigma_debuff', type: 'pro', group: 'control', category: 'debuffs', translations: t('Inflicts Stigma', 'Inflige Estigma', '烙印付与', '낙인 부여', 'Inflige Estigma', '造成烙印'), aliases: [] },
    { id: 'frostbite', type: 'pro', group: 'control', category: 'debuffs', translations: t('Inflicts Frostbite', 'Inflige Congelación', '凍傷付与', '동상 부여', 'Inflige Congelamento', '造成冻伤'), aliases: [] },
    { id: 'electric_shock', type: 'pro', group: 'control', category: 'debuffs', translations: t('Inflicts Shock', 'Inflige Electroshock', '感電付与', '감전 부여', 'Inflige Choque', '造成感电'), aliases: [] },
    { id: 'vampiric_touch', type: 'pro', group: 'control', category: 'debuffs', translations: t('Vampiric Touch', 'Toque Vampírico', '吸血の手', '흡혈의 손길', 'Toque Vampírico', '吸血鬼之触'), aliases: [] },
    { id: 'debuff_trauma', type: 'pro', group: 'control', category: 'debuffs', translations: t('Inflicts Trauma', 'Inflige Trauma', 'トラウマ付与', '트라우마 부여', 'Inflige Trauma', '造成创伤'), aliases: [] },
    { id: 'debuff_decrease_crit_chance', type: 'pro', group: 'control', category: 'debuffs', translations: t('Decreases crit', 'Reduce crítico', 'クリ率・クリダメダウン', '치명타 감소', 'Reduz crítico', '降低暴击'), aliases: [] },
    { id: 'extinction', type: 'pro', group: 'control', category: 'debuffs', translations: t('Inflicts Extinction', 'Inflige Extinción', '消滅付与', '소멸 부여', 'Inflige Extinção', '湮灭'), aliases: ['anti revive'] },
    { id: 'debuff_block', type: 'pro', group: 'control', category: 'debuffs', translations: t('Inflicts Block', 'Inflige Bloqueo', 'ブロック付与', '차단 부여', 'Inflige Bloqueio', '造成封锁'), aliases: ['block', 'aliados', 'allies', 'buff'] },
    { id: 'unbuffable', type: 'pro', group: 'control', category: 'anti_buff', translations: t('Inflicts Unbuffable', 'Inflige Anti-Buff', '強化不可付与', '강불 부여', 'Inflige Anti-Buff', '无法强化'), aliases: [] },
    { id: 'strip_buffs', type: 'pro', group: 'control', category: 'anti_buff', translations: t('Strips/Dispels', 'Quita/Disipa Buffs', 'バフ解除', '버프 해제', 'Remove Buffs', '驱散增益'), aliases: ['dispel', 'strip'] },
    { id: 'buff_steal', type: 'pro', group: 'control', category: 'anti_buff', translations: t('Steals Buffs', 'Roba Buffs', 'バフ奪取', '버프 강탈', 'Rouba Buffs', '偷取增益'), aliases: [] },
    { id: 'buff_duration_reduce', type: 'pro', group: 'control', category: 'anti_buff', translations: t('Reduces Buff Duration', 'Reduce Duración Buffs', 'バフ短縮', '버프 턴 감소', 'Reduz Duração Buffs', '减少增益回合'), aliases: [] },
    { id: 'debuff_extension', type: 'pro', group: 'control', category: 'anti_buff', translations: t('Extends Debuffs', 'Extiende Debuffs', 'デバフ延長', '디버프 연장', 'Estende Debuffs', '延长减益'), aliases: [] },
    { id: 'dispels_immortality', type: 'pro', group: 'control', category: 'anti_buff', translations: t('Dispels Immortality', 'Disipa Inmortalidad (ignora Res)', '不死解除 (抵抗無視)', '불사 해제 (효저 무시)', 'Disipa Imortalidade (ignora Res)', '驱散不死 (无视抗性)'), aliases: ['immortality'] },
    { id: 'seals_passive', type: 'pro', group: 'control', category: 'anti_buff', translations: t('Seals Enemy Passive', 'Sella Pasiva Enemiga', '敵パッシブ封印', '적 패시브 봉인', 'Sela Passiva Inimiga', '封印敌方被动'), aliases: ['seal'] },
    { id: 'cooldown_increase', type: 'pro', group: 'control', category: 'anti_buff', translations: t('Increases Cooldowns', 'Aumenta Enfriamientos', 'クールダウン増加', '재사용 대기시간 증가', 'Aumenta Tempos de Recarga', '增加冷却'), aliases: ['cd'] },
    { id: 'cd_reset_enemy', type: 'pro', group: 'control', category: 'anti_buff', translations: t('Resets Enemy Cooldowns', 'Resetea CD Enemigo', '敵CDリセット', '적 쿨타임 초기화', 'Reseta CD Inimigo', '重置敌方冷却'), aliases: [] },
    { id: 'resource_reduction', type: 'pro', group: 'control', category: 'anti_buff', translations: t('Reduces Souls/Focus', 'Reduce Almas/Foco', 'リソース減少', '자원 감소 (소울/집중)', 'Reduz Almas/Foco', '削减资源'), aliases: ['souls', 'focus'] },
    { id: 'counter_punisher', type: 'pro', group: 'control', category: 'punish', translations: t('Punishes Counters', 'Castiga Contraataques', '反撃に反応', '반격 반응/불가', 'Pune Contra-ataques', '反制反击'), aliases: [] },
    { id: 'extra_turn_punisher', type: 'pro', group: 'control', category: 'punish', translations: t('Punishes Extra Turns', 'Castiga Turnos Extra', '追加ターンに反応', '추가 턴 반응', 'Pune Turnos Extras', '反制追加回合'), aliases: [] },
    { id: 'non_attack_punisher', type: 'pro', group: 'control', category: 'punish', translations: t('Punishes Non-Attack', 'Castiga Habilidades No Agresivas', '非攻撃スキルに反応', '비타격 스킬 반응', 'Pune Skills Não-Ofensivas', '反制非攻击技能'), aliases: [] },
    { id: 'punishes_enemy_buffs', type: 'pro', group: 'control', category: 'punish', translations: t('Punishes Enemy Buffs', 'Castiga Buffs Enemigos', '敵バフペナルティ', '적 버프 처벌', 'Pune Buffs Inimigos', '惩罚敌方增益'), aliases: [] },
    { id: 'anti_damage_share', type: 'pro', group: 'control', category: 'punish', translations: t('Counters Damage Sharing', 'Contra Distribución de Daño', 'ダメージ分配対策', '피해 분배 카운터', 'Contra Distribuição de Dano', '反制伤害分摊'), aliases: [] },
    { id: 'stealth_detection', type: 'pro', group: 'control', category: 'punish', translations: t('Detects Stealth', 'Detecta Sigilo', 'ステルス看破', '은신 감지', 'Detecta Furtividade', '看破隐身'), aliases: [] },
    { id: 'high_base_speed', type: 'pro', group: 'speed', category: 'self_turns', translations: t('High base speed (120+)', 'Velocidad base alta (120+)', '高速度(120+)', '높은 기본 속도 (120+)', 'Velocidade base alta (120+)', '高基础速度(120+)'), aliases: ['spd'] },
    { id: 'self_cr_push', type: 'pro', group: 'speed', category: 'self_turns', translations: t('Self CR Push', 'Auto-Push CR', '自己ゲージUP', '자가 행게증', 'Auto-Push CR', '自拉条'), aliases: ['push', 'cr'] },
    { id: 'extra_turn', type: 'pro', group: 'speed', category: 'self_turns', translations: t('Extra Turn', 'Turno Extra', '追加ターン', '추가 턴', 'Turno Extra', '额外回合'), aliases: [] },
    { id: 'extra_turn_on_kill', type: 'pro', group: 'speed', category: 'self_turns', translations: t('Extra Turn on Kill', 'Turno Extra al Matar', '撃破時追加ターン', '처치 시 추가 턴', 'Turno Extra ao Matar', '击杀追加回合'), aliases: [] },
    { id: 'turn_cycler', type: 'pro', group: 'speed', category: 'self_turns', translations: t('Turn Cycler', 'Cicla Turnos Rápido', '高速ターン回転', '고속 턴 사이클러', 'Ciclador de Turnos', '快速循环回合'), aliases: [] },
    { id: 'works_without_first_turn', type: 'pro', group: 'speed', category: 'self_turns', translations: t('Doesn\'t Need First Turn', 'No Necesita Primer Turno', '先攻不要', '선턴 불필요', 'Não Precisa de Primeiro Turno', '无需先手'), aliases: [] },
    { id: 'team_cr_push', type: 'pro', group: 'speed', category: 'team_turns', translations: t('Team CR Push', 'Push CR Equipo', '味方ゲージUP', '아군 행게증', 'Push CR Equipe', '全队拉条'), aliases: ['push', 'cr', '행게증', '拉条'] },
    { id: 'speed_buff_team', type: 'pro', group: 'speed', category: 'team_turns', translations: t('Team Speed Buff', 'Buff Velocidad Equipo', 'チーム速度バフ', '팀 속도 버프', 'Buff Velocidade Equipe', '全队加速'), aliases: ['speed'] },
    { id: 'cd_reduction_team', type: 'pro', group: 'speed', category: 'team_turns', translations: t('Reduces Team Cooldowns', 'Reduce CD Equipo', '味方CD短縮', '아군 쿨감', 'Reduz CD Equipe', '全队减CD'), aliases: ['cd', 'cooldown'] },
    { id: 'enemy_cr_decrease', type: 'pro', group: 'speed', category: 'enemy_turns', translations: t('Enemy CR Decrease', 'Reduce CR Enemigo', '敵ゲージDOWN', '적 행게감', 'Reduz CR Inimigo', '推条'), aliases: ['push', 'cr', '행게감', '推条'] },
    { id: 'anti_cr_push', type: 'pro', group: 'speed', category: 'enemy_turns', translations: t('Anti-CR Push', 'Anti-Push CR', 'ゲージUP妨害', '행게증 방해', 'Anti-Push CR', '反推条'), aliases: [] },
    { id: 'atk_buff', type: 'pro', group: 'support', category: 'buffs', translations: t('ATK Buff', 'Buff de ATK', '攻撃バフ', '공격력 버프', 'Buff de ATK', '攻击增益'), aliases: [] },
    { id: 'def_buff', type: 'pro', group: 'support', category: 'buffs', translations: t('DEF Buff', 'Buff de DEF', '防御バフ', '방어력 버프', 'Buff de DEF', '防御增益'), aliases: [] },
    { id: 'crit_buff', type: 'pro', group: 'support', category: 'buffs', translations: t('Crit Chance Buff', 'Buff de Crítico', 'クリバフ', '치명타 버프', 'Buff de Crítico', '暴击增益'), aliases: [] },
    { id: 'crit_dmg_buff', type: 'pro', group: 'support', category: 'buffs', translations: t('Crit Dmg Buff', 'Buff de Daño Crítico', 'クリダメバフ', '치피 버프', 'Buff de Dano Crítico', '爆伤增益'), aliases: [] },
    { id: 'buff_hit_chance', type: 'pro', group: 'support', category: 'buffs', translations: t('Hit Chance Up', 'Aumento Prob. Golpe', '命中率UP', '명중률 증가', 'Aumento Prob. Acerto', '命中率提升'), aliases: [] },
    { id: 'vigor_buff', type: 'pro', group: 'support', category: 'buffs', translations: t('Vigor Buff', 'Buff Vigor', '覇気', '패기', 'Buff Vigor', '魄力'), aliases: [] },
    { id: 'buff_evasion_team', type: 'pro', group: 'support', category: 'buffs', translations: t('Team Evasion', 'Evasión en Equipo', 'チーム回避', '팀 회피', 'Evasão em Equipe', '群体闪避'), aliases: [] },
    { id: 'buff_crit_resist_team', type: 'pro', group: 'support', category: 'buffs', translations: t('Team Crit Resist', 'Resist. Crit Equipo', 'チームクリ抵抗', '팀 치명타 저항', 'Resist. Crit Equipe', '群体暴击抗性'), aliases: [] },
    { id: 'immunity_buff_team', type: 'pro', group: 'support', category: 'buffs', translations: t('Team Immunity', 'Inmunidad de Equipo', 'チーム免疫', '팀 면역', 'Imunidade de Equipe', '全队免疫'), aliases: [] },
    { id: 'grants_ignore_sharing', type: 'pro', group: 'support', category: 'buffs', translations: t('Grants Team Ignore Sharing', 'Equipo Ignora Distribución', 'チーム分配無視付与', '팀 분배 무시 부여', 'Equipe Ignora Distribuição', '赋予团队忽视分摊'), aliases: [] },
    { id: 'buff_counter', type: 'pro', group: 'support', category: 'buffs', translations: t('Counterattack Buff', 'Buff Contraataque', '反撃バフ', '반격 버프', 'Buff Contra-ataque', '反击增益'), aliases: [] },
    { id: 'team_healer', type: 'pro', group: 'support', category: 'heal_protect', translations: t('Team Healer', 'Curador de Equipo', 'チームヒーラー', '팀 힐러', 'Curador de Equipe', '群奶'), aliases: ['healer', 'heal'] },
    { id: 'full_cleanse', type: 'pro', group: 'support', category: 'heal_protect', translations: t('Full Team Cleanse', 'Limpieza Total Equipo', '全体解除', '전체 해제', 'Limpeza Total Equipe', '群体驱散'), aliases: ['cleanse'] },
    { id: 'preventive_cleanse', type: 'pro', group: 'support', category: 'heal_protect', translations: t('Preventive Cleanse', 'Limpieza Preventiva', '予防クレンズ', '선제 해제', 'Limpeza Preventiva', '预防净化'), aliases: ['cleanse'] },
    { id: 'protects_allies', type: 'pro', group: 'support', category: 'heal_protect', translations: t('Protects allies', 'Protege aliados', '味方を守る', '아군 보호', 'Protege aliados', '保护队友'), aliases: ['protect', 'carry'] },
    { id: 'team_soul_generation', type: 'pro', group: 'support', category: 'resources', translations: t('Team Soul Generation', 'Genera Almas al Equipo', 'チームソウル生成', '팀 소울 생성', 'Geração de Almas', '全队生魂'), aliases: ['souls'] },
    { id: 'fighting_spirit', type: 'pro', group: 'support', category: 'resources', translations: t('Uses Fighting Spirit', 'Usa Espíritu de Lucha', '闘志使用', '투지 사용', 'Usa Espírito de Luta', '斗志角色'), aliases: [] },
    { id: 'focus_mechanic', type: 'pro', group: 'support', category: 'resources', translations: t('Uses Focus', 'Usa Foco', '集中使用', '집중 사용', 'Usa Foco', '专注角色'), aliases: [] },
    { id: 'meta_rta', type: 'pro', group: 'content', category: 'pvp', translations: t('Good in RTA', 'Bueno en RTA', 'RTAで強い', 'RTA에서 강함', 'Bom no RTA', 'RTA强势'), aliases: [] },
    { id: 'meta_arena_offense', type: 'pro', group: 'content', category: 'pvp', translations: t('Arena offense', 'Arena ataque', 'アリーナ攻撃', '아레나 공격', 'Arena ataque', '竞技场进攻'), aliases: [] },
    { id: 'meta_arena_defense', type: 'pro', group: 'content', category: 'pvp', translations: t('Arena defense', 'Arena defensa', 'アリーナ防衛', '아레나 방어', 'Arena defesa', '竞技场防守'), aliases: [] },
    { id: 'meta_gw_offense', type: 'pro', group: 'content', category: 'pvp', translations: t('Guild War offense', 'GW ataque', 'ギルド戦攻撃', '길드전 공격', 'GW ataque', '公会战进攻'), aliases: ['gw', 'guild'] },
    { id: 'gw_defense_meta', type: 'pro', group: 'content', category: 'pvp', translations: t('Guild War defense', 'GW defensa', 'ギルド戦防衛', '길드전 방어', 'GW defesa', '公会战防守'), aliases: ['gw', 'guild'] },
    { id: 'safe_first_pick', type: 'pro', group: 'content', category: 'draft', translations: t('Safe First Pick', 'Primer Pick Seguro', '安定先取り', '안전 선픽', 'Primeiro Pick Seguro', '稳定先拿'), aliases: [] },
    { id: 'draft_flexible', type: 'pro', group: 'content', category: 'draft', translations: t('Draft Flexible', 'Flexible en Draft', 'ドラフト柔軟', '밴픽 유연함', 'Flexível no Draft', 'BP灵活'), aliases: ['pivot', 'flex'] },
    { id: 'pocket_pick', type: 'pro', group: 'content', category: 'draft', translations: t('Pocket Pick', 'Pick de Bolsillo', 'ポケットピック', '깜짝 픽', 'Pick de Bolso', '口袋奇兵'), aliases: [] },
    { id: 'force_ban', type: 'pro', group: 'content', category: 'draft', translations: t('Force Ban', 'Force Ban', '強制BAN', '강제 밴', 'Force Ban', '逼Ban'), aliases: ['ban'] },
    { id: 'universal_counter_pick', type: 'pro', group: 'content', category: 'draft', translations: t('Universal Counter Pick', 'Counter Pick Universal', '万能カウンターピック', '범용 카운터 픽', 'Counter Pick Universal', '万能反手'), aliases: ['counter'] },
    { id: 'draft_finisher', type: 'pro', group: 'content', category: 'draft', translations: t('Draft Finisher', 'Draft Finisher', 'ドラフトフィニッシャー', '밴픽 마무리', 'Finalizador de Draft', 'BP终结者'), aliases: ['last pick'] },
    { id: 'pve_general', type: 'pro', group: 'content', category: 'pve', translations: t('Strong in PvE', 'Bueno en PvE', 'PvEで強い', 'PvE에서 강함', 'Bom no PvE', 'PvE强势'), aliases: [] },
    { id: 'hunt_wyvern', type: 'pro', group: 'content', category: 'pve', translations: t('Wyvern Hunt', 'Cacería Wyvern', 'ワイバーン討伐', '와이번 사냥', 'Caçada Wyvern', '飞龙狩猎'), aliases: ['hunt', 'cacería'] },
    { id: 'hunt_golem', type: 'pro', group: 'content', category: 'pve', translations: t('Golem Hunt', 'Cacería Golem', 'ゴーレム討伐', '골렘 사냥', 'Caçada Golem', '魔像狩猎'), aliases: ['hunt', 'cacería'] },
    { id: 'hunt_banshee', type: 'pro', group: 'content', category: 'pve', translations: t('Banshee Hunt', 'Cacería Banshee', 'バンシー討伐', '밴시 사냥', 'Caçada Banshee', '女妖狩猎'), aliases: ['hunt', 'cacería'] },
    { id: 'hunt_azimanak', type: 'pro', group: 'content', category: 'pve', translations: t('Azimanak Hunt', 'Cacería Azimanak', 'アジマナク討伐', '아지마낙 사냥', 'Caçada Azimanak', '阿兹玛纳克狩猎'), aliases: ['hunt', 'cacería'] },
    { id: 'hunt_caides', type: 'pro', group: 'content', category: 'pve', translations: t('Caides Hunt', 'Cacería Caides', 'カイデス討伐', '카이데스 사냥', 'Caçada Caides', '凯德斯狩猎'), aliases: ['hunt', 'cacería'] },
    { id: 'abyss_vip', type: 'pro', group: 'content', category: 'pve', translations: t('Abyss', 'Abismo', '深淵', '심연', 'Abismo', '深渊'), aliases: [] },
    { id: 'expedition', type: 'pro', group: 'content', category: 'pve', translations: t('Expedition', 'Expedición', '遠征', '원정', 'Expedição', '远征'), aliases: [] },
    { id: 'hall_of_trials', type: 'pro', group: 'content', category: 'pve', translations: t('Hall of Trials', 'Sala de Pruebas', '試練の殿堂', '시련의 전당', 'Salão das Provações', '试炼殿堂'), aliases: [] },
    { id: 'labyrinth', type: 'pro', group: 'content', category: 'pve', translations: t('Labyrinth', 'Laberinto', '迷宮', '미궁', 'Labirinto', '迷宫'), aliases: [] },
    { id: 'nightmare_raid_core', type: 'pro', group: 'content', category: 'pve', translations: t('Raid', 'Raid', 'レイド', '레이드', 'Raid', '团本'), aliases: [] },
    { id: 'rift_specialist', type: 'pro', group: 'content', category: 'pve', translations: t('Rift', 'Grieta', '亀裂', '균열', 'Fenda', '裂缝'), aliases: [] },
    { id: 'otherworld_breach_pick', type: 'pro', group: 'content', category: 'pve', translations: t('Otherworld Breach', 'Brecha de Otro Mundo', '異世界侵攻', '이세계 침공', 'Brecha do Outro Mundo', '异界侵蚀'), aliases: [] },
    { id: 'constellation_trial_pick', type: 'pro', group: 'content', category: 'pve', translations: t('Trial of Constellations', 'Prueba de Constelaciones', '星座の試練', '별자리 시험', 'Prova das Constelações', '星座试炼'), aliases: [] },
];

export const CONS_TAGS: Tag[] = [
    { id: 'squishy', type: 'con', group: 'fragility', category: 'fragile', translations: t('Very Squishy', 'Muy Frágil', '紙耐久', '물몸', 'Muito Frágil', '身板脆'), aliases: [] },
    { id: 'low_base_hp', type: 'con', group: 'fragility', category: 'fragile', translations: t('Low Base HP', 'HP Base Baja', '低HP', '기본 체력 낮음', 'HP Base Baixo', '基础血量低'), aliases: [] },
    { id: 'low_base_def', type: 'con', group: 'fragility', category: 'fragile', translations: t('Low Base DEF', 'DEF Base Baja', '低防御', '기본 방어 낮음', 'DEF Base Baixa', '基础防御低'), aliases: [] },
    { id: 'no_sustain', type: 'con', group: 'fragility', category: 'fragile', translations: t('No Self Sustain', 'Sin Recuperación', '回復手段なし', '유지력 없음', 'Sem Recuperação', '无续航'), aliases: [] },
    { id: 'no_defensive_tools', type: 'con', group: 'fragility', category: 'fragile', translations: t('No Defense Skills', 'Sin Habilidades Def', '防御スキルなし', '방어 스킬 없음', 'Sem Skills Defensivas', '无保命'), aliases: [] },
    { id: 'susceptible_to_cleave', type: 'con', group: 'fragility', category: 'fragile', translations: t('Susceptible to Cleave', 'Susceptible a Cleave', 'クリーブに弱い', '속공/클리브 취약', 'Suscetível a Cleave', '怕核爆'), aliases: ['cleave'] },
    { id: 'weak_to_burst', type: 'con', group: 'fragility', category: 'fragile', translations: t('Weak to Burst', 'Débil vs Burst', 'バーストに弱い', '폭딜에 취약', 'Fraco contra Burst', '怕爆发'), aliases: ['burst'] },
    { id: 'low_damage', type: 'con', group: 'offense', category: 'offense_limits', translations: t('Low Damage', 'Daño Bajo', '低火力', '낮은 데미지', 'Dano Baixo', '伤害低'), aliases: [] },
    { id: 'single_target_only', type: 'con', group: 'offense', category: 'offense_limits', translations: t('Single Target Only', 'Solo Objetivo Único', '単体のみ', '단일 대상만', 'Apenas Alvo Único', '仅单体'), aliases: ['aoe'] },
    { id: 'long_ramp_up', type: 'con', group: 'offense', category: 'offense_limits', translations: t('Slow Ramp Up', 'Tarda en Cargar', 'スロースターター', '예열 김', 'Demora pra Carregar', '启动慢'), aliases: [] },
    { id: 'rng_damage', type: 'con', group: 'offense', category: 'offense_limits', translations: t('RNG Damage', 'Daño Inconsistente', 'ダメージ不安定', '로또 데미지', 'Dano Inconsistente', '伤害看脸'), aliases: ['rng'] },
    { id: 'unreliable_debuffs', type: 'con', group: 'offense', category: 'offense_limits', translations: t('Unreliable Debuffs', 'Debuffs Inconsistentes', 'デバフ不安定', '불안정한 디버프', 'Debuffs Inconsistentes', '减益不稳定'), aliases: [] },
    { id: 'long_cooldowns', type: 'con', group: 'offense', category: 'offense_limits', translations: t('Long Cooldowns', 'Enfriamientos Largos', 'CD長い', '쿨타임 김', 'Cooldowns Longos', 'CD太长'), aliases: ['cd'] },
    { id: 'weak_to_evasion', type: 'con', group: 'offense', category: 'offense_limits', translations: t('Struggles vs Evasion', 'Sufre vs Evasión', '対回避不利', '회피 덱에 약함', 'Sofre contra Evasão', '怕闪避'), aliases: [] },
    { id: 'low_effectiveness', type: 'con', group: 'offense', category: 'offense_limits', translations: t('Low Base Effectiveness', 'Efectividad Base Baja', '低効果命中', '기본 효적 낮음', 'Efetividade Base Baixa', '基础效命低'), aliases: ['eff'] },
    { id: 'hard_to_gear', type: 'con', group: 'dependencies', category: 'gear', translations: t('Hard to Gear', 'Difícil de Equipar', '装備難易度高', '장비 세팅 어려움', 'Difícil de Equipar', '面板难堆'), aliases: ['whale', 'expensive'] },
    { id: 'stat_hungry', type: 'con', group: 'dependencies', category: 'gear', translations: t('Stat Hungry', 'Pide Muchas Stats', 'ステータス要求高', '스탯 괴물', 'Pede Muitos Stats', '吃属性'), aliases: [] },
    { id: 'needs_100_crit', type: 'con', group: 'dependencies', category: 'gear', translations: t('Needs 100% Crit', 'Necesita 100% Crítico', 'クリ100%必須', '치확 100% 강제', 'Precisa 100% Crítico', '满爆强迫症'), aliases: ['crit'] },
    { id: 'requires_crit', type: 'con', group: 'dependencies', category: 'gear', translations: t('Requires Crit', 'Requiere Crítico', 'クリティカル必要', '치명타 필요', 'Requer Crítico', '需要暴击'), aliases: ['crit'] },
    { id: 'requires_effectiveness', type: 'con', group: 'dependencies', category: 'gear', translations: t('Requires Effectiveness', 'Requiere Efectividad', '効果命中必要', '효과적중 필요', 'Requer Efetividade', '需要命中'), aliases: ['eff'] },
    { id: 'high_er_required', type: 'con', group: 'dependencies', category: 'gear', translations: t('Needs 200%+ Effect Res', 'Requiere 200%+ Resist.', '200%+ 効果抵抗必要', '효과저항 200% 이상 필요', 'Precisa 200%+ Resistência', '需要200%+效果抗性'), aliases: ['res'] },
    { id: 'specific_set_only', type: 'con', group: 'dependencies', category: 'gear', translations: t('Specific Set Only', 'Solo con Set Específico', '特定セット専用', '특정 세트 전용', 'Apenas Set Específico', '绑定套装'), aliases: ['set'] },
    { id: 'needs_specific_arti', type: 'con', group: 'dependencies', category: 'gear', translations: t('Artifact Dependent', 'Depende de Artefacto', '特定遺物必須', '아티 의존도 높음', 'Depende de Artefato', '绑定神器'), aliases: ['artifact', 'artefacto'] },
    { id: 'limited_artifact', type: 'con', group: 'dependencies', category: 'gear', translations: t('Limited Artifact', 'Artefacto Limitado', '限定遺物', '한정 아티팩트', 'Artefato Limitado', '限定神器'), aliases: ['artifact', 'artefacto', 'limited'] },
    { id: 'limited_character', type: 'con', group: 'dependencies', category: 'gear', translations: t('Limited Character', 'Personaje Limitado', '限定キャラ', '한정 캐릭터', 'Personagem Limitado', '限定角色'), aliases: ['limited'] },
    { id: 'needs_exclusive_equip', type: 'con', group: 'dependencies', category: 'gear', translations: t('Needs Exclusive Equip', 'Requiere Equipo Exclusivo', '専用装備必須', '전용장비 필수', 'Requer Equip. Exclusivo', '绑定专属'), aliases: ['ee', 'exclusive'] },
    { id: 'needs_dupes', type: 'con', group: 'dependencies', category: 'gear', translations: t('Needs dupes (imprint)', 'Depende de duplicados', '凸必須', '돌파 필요', 'Depende de duplicatas', '依赖重复抽取'), aliases: ['imprint', 'dupes', 'duplicados', '凸', '돌파', '烙印'] },
    { id: 'mola_hungry', type: 'con', group: 'dependencies', category: 'gear', translations: t('Mola Hungry', 'Gasta Muchos Molas', 'モラゴラ泥棒', '머라고라 많이 듦', 'Gasta Muitos Molas', '吃萝卜'), aliases: ['molagora'] },
    { id: 'penetration_dependent', type: 'con', group: 'dependencies', category: 'gear', translations: t('Depends on Penetration', 'Depende de Penetración', '貫通依存', '관통 의존', 'Depende de Penetração', '依赖穿透'), aliases: ['pen', 'penetration', 'penetración'] },
    { id: 'soulburn_reliant', type: 'con', group: 'dependencies', category: 'resources_dep', translations: t('Soulburn Reliant', 'Depende de Soulburn', 'SB依存', '소울번 의존', 'Depende de Soulburn', '依赖烧魂'), aliases: ['souls', 'soulburn'] },
    { id: 'focus_reliant', type: 'con', group: 'dependencies', category: 'resources_dep', translations: t('Focus Reliant', 'Depende de Foco', '集中依存', '집중 의존', 'Depende de Foco', '依赖专注'), aliases: [] },
    { id: 'fighting_spirit_reliant', type: 'con', group: 'dependencies', category: 'resources_dep', translations: t('Fighting Spirit Reliant', 'Depende de Esp. Lucha', '闘志依存', '투지 의존', 'Depende de Esp. Luta', '依赖斗志'), aliases: [] },
    { id: 'resource_reliant', type: 'con', group: 'dependencies', category: 'resources_dep', translations: t('Resource Reliant', 'Depende de Recursos', 'リソース依存', '자원 의존', 'Depende de Recursos', '依赖资源'), aliases: [] },
    { id: 'buff_dependent', type: 'con', group: 'dependencies', category: 'resources_dep', translations: t('Buff Dependent', 'Depende de Buffs', 'バフ依存', '버프 의존', 'Depende de Buffs', '依赖增益'), aliases: [] },
    { id: 'requires_specific_debuff', type: 'con', group: 'dependencies', category: 'resources_dep', translations: t('Requires Specific Debuff', 'Requiere Debuff Específico', '特定デバフ必要', '특정 디버프 필요', 'Requer Debuff Específico', '依赖特定减益'), aliases: [] },
    { id: 'team_dependent', type: 'con', group: 'dependencies', category: 'team_dep', translations: t('Team dependent', 'Depende del equipo', '編成依存', '조합 의존', 'Depende do time', '依赖阵容'), aliases: ['exodia', 'duo'] },
    { id: 'combo_reliant', type: 'con', group: 'dependencies', category: 'team_dep', translations: t('Combo Reliant', 'Depende de Combo', 'コンボ依存', '콤보 의존', 'Depende de Combo', '依赖连招'), aliases: [] },
    { id: 'setup_reliant', type: 'con', group: 'dependencies', category: 'team_dep', translations: t('Setup Reliant', 'Depende de Setup', 'セットアップ依存', '준비 필요', 'Depende de Setup', '依赖启动'), aliases: [] },
    { id: 'rng_reliant', type: 'con', group: 'dependencies', category: 'team_dep', translations: t('RNG Reliant', 'Depende de la Suerte', '運ゲー', '운빨', 'Depende da Sorte', '看脸'), aliases: ['rng'] },
    { id: 'low_base_speed', type: 'con', group: 'speed_issues', category: 'speed_limits', translations: t('Low Base Speed', 'Velocidad Base Baja', '低速度', '기본 속도 낮음', 'Velocidade Base Baixa', '短腿'), aliases: [] },
    { id: 'needs_max_speed', type: 'con', group: 'speed_issues', category: 'speed_limits', translations: t('Needs Max Speed', 'Necesita Máxima Velocidad', '最速必須', '선턴 필수', 'Precisa Máxima Velocidade', '拼一速'), aliases: ['first turn', 'primer turno'] },
    { id: 'slow_cycling', type: 'con', group: 'speed_issues', category: 'speed_limits', translations: t('Slow Turn Cycling', 'Ciclo de Turnos Lento', '回転率悪い', '턴 순환 느림', 'Ciclo de Turnos Lento', '跑圈慢'), aliases: [] },
    { id: 'easily_kited', type: 'con', group: 'speed_issues', category: 'speed_limits', translations: t('Easily Kited', 'Fácil de Kitear', 'カイトされやすい', '카이팅 당함', 'Fácil de Kitear', '易被风筝'), aliases: ['outsped'] },
    { id: 'requires_speed_tuning', type: 'con', group: 'speed_issues', category: 'speed_limits', translations: t('Requires Speed Tuning', 'Requiere Speed Tuning', '速度調整必須', '스피드 튜닝 필요', 'Requer Speed Tuning', '需要调速'), aliases: ['tuning'] },
    { id: 'turn_order_dependent', type: 'con', group: 'speed_issues', category: 'speed_limits', translations: t('Turn Order Dependent', 'Depende del Orden de Turnos', 'ターン順依存', '턴 순서 의존', 'Depende da Ordem de Turnos', '依赖出手顺序'), aliases: [] },
    { id: 'speed_rng_reliant', type: 'con', group: 'speed_issues', category: 'speed_limits', translations: t('Speed RNG Reliant (±5%)', 'Varianza de Vel. ±5%', '速度RNG依存 (±5%)', '속도 RNG 의존 (±5%)', 'Dependente de RNG Vel. (±5%)', '依赖速度随机 (±5%)'), aliases: [] },
    { id: 'weak_to_cc', type: 'con', group: 'weak_to', category: 'weak_cc', translations: t('Weak to CC', 'Débil vs Control', 'CCに弱い', 'CC 취약', 'Fraco contra Controle', '怕控制'), aliases: ['cc', 'control'] },
    { id: 'weak_to_stun', type: 'con', group: 'weak_to', category: 'weak_cc', translations: t('Weak to Stun', 'Débil vs Stun', 'スタンに弱い', '기절에 취약', 'Fraco contra Stun', '怕眩晕'), aliases: [] },
    { id: 'weak_to_sleep', type: 'con', group: 'weak_to', category: 'weak_cc', translations: t('Weak to Sleep', 'Débil vs Sueño', '睡眠に弱い', '수면에 취약', 'Fraco contra Sono', '怕睡眠'), aliases: [] },
    { id: 'weak_to_silence', type: 'con', group: 'weak_to', category: 'weak_cc', translations: t('Weak to Silence', 'Débil vs Silencio', '沈黙に弱い', '침묵에 취약', 'Fraco contra Silêncio', '怕沉默'), aliases: [] },
    { id: 'weak_to_provoke', type: 'con', group: 'weak_to', category: 'weak_cc', translations: t('Weak to Provoke', 'Débil vs Provocar', '挑発に弱い', '도발에 취약', 'Fraco contra Provocação', '怕嘲讽'), aliases: [] },
    { id: 'countered_by_seal', type: 'con', group: 'weak_to', category: 'weak_cc', translations: t('Weak vs Seal', 'Débil vs Sello', '対封印不利', '봉인에 취약', 'Fraco contra Selo', '怕封印'), aliases: ['seal'] },
    { id: 'countered_by_immunity', type: 'con', group: 'weak_to', category: 'weak_cc', translations: t('Countered by Immunity', 'Countereado por Inmunidad', '免疫に弱い', '면역에 카운터', 'Counterado por Imunidade', '怕免疫'), aliases: [] },
    { id: 'countered_by_cleanse', type: 'con', group: 'weak_to', category: 'weak_cc', translations: t('Countered by Cleanse', 'Countereado por Cleanse', '解除に弱い', '해제에 카운터', 'Counterado por Cleanse', '怕驱散'), aliases: ['cleanse'] },
    { id: 'weak_to_unbuffable', type: 'con', group: 'weak_to', category: 'weak_debuffs', translations: t('Weak to Unbuffable', 'Débil vs Anti-Buff', '強化不可に弱い', '강불에 취약', 'Fraco contra Anti-Buff', '怕无法强化'), aliases: [] },
    { id: 'weak_to_unhealable', type: 'con', group: 'weak_to', category: 'weak_debuffs', translations: t('Weak to Unhealable', 'Débil vs Incurable', '回復不可に弱い', '회불에 취약', 'Fraco contra Incurável', '怕无法恢复'), aliases: [] },
    { id: 'weak_to_injury', type: 'con', group: 'weak_to', category: 'weak_debuffs', translations: t('Weak vs Injury', 'Débil vs Herida', '対負傷不利', '부상에 취약', 'Fraco contra Ferimento', '怕伤口'), aliases: [] },
    { id: 'countered_by_fracture', type: 'con', group: 'weak_to', category: 'weak_debuffs', translations: t('Weak vs Fracture', 'Débil vs Fractura', '対骨折不利', '골절에 취약', 'Fraco contra Fratura', '怕骨折'), aliases: [] },
    { id: 'weak_to_def_break', type: 'con', group: 'weak_to', category: 'weak_debuffs', translations: t('Weak to Def Break', 'Débil vs Def Break', '防御ダウンに弱い', '방깍 취약', 'Fraco contra Quebra Def', '怕破甲'), aliases: [] },
    { id: 'weak_to_dots', type: 'con', group: 'weak_to', category: 'weak_debuffs', translations: t('Weak to DoTs', 'Débil vs daño por turno', '継続ダメージに弱い', '지속 피해에 취약', 'Fraco contra DoTs', '怕持续伤害'), aliases: ['dot', 'burn', 'bleed', 'poison', 'bomb'] },
    { id: 'weak_to_fixed_dmg', type: 'con', group: 'weak_to', category: 'weak_debuffs', translations: t('Weak to Fixed Dmg', 'Débil vs Daño Fijo', '固定ダメに弱い', '고정뎀 취약', 'Fraco contra Dano Fixo', '怕固伤'), aliases: [] },
    { id: 'weak_to_aoe', type: 'con', group: 'weak_to', category: 'weak_debuffs', translations: t('Weak to AoE', 'Débil vs AoE', '全体攻撃に弱い', '광역기 취약', 'Fraco contra AoE', '怕AOE'), aliases: ['aoe'] },
    { id: 'weak_to_strippers', type: 'con', group: 'weak_to', category: 'weak_debuffs', translations: t('Weak to Strippers', 'Débil vs Dispel', '解除に弱い', '해제에 취약', 'Fraco contra Dispel', '怕驱散'), aliases: ['dispel', 'strip'] },
    { id: 'weak_to_extinction', type: 'con', group: 'weak_to', category: 'weak_mechanics', translations: t('Weak vs Extinction', 'Débil vs Extinción', '消滅に弱い', '소멸에 취약', 'Fraco contra Extinção', '怕湮灭'), aliases: ['anti revive'] },
    { id: 'weak_to_buff_reduction', type: 'con', group: 'weak_to', category: 'weak_mechanics', translations: t('Weak vs Buff Reduction', 'Débil vs Reducción de Buffs', 'バフ短縮に弱い', '버프 감소에 취약', 'Fraco contra Red. Buffs', '怕削buff'), aliases: [] },
    { id: 'weak_to_turn_steal', type: 'con', group: 'weak_to', category: 'weak_mechanics', translations: t('Weak vs Turn Steal', 'Débil vs Robo de Turno', 'ターン奪取に弱い', '턴 강탈에 취약', 'Fraco contra Roubo de Turno', '怕抢回合'), aliases: [] },
    { id: 'weak_to_skill_nullifier', type: 'con', group: 'weak_to', category: 'weak_mechanics', translations: t('Weak vs Skill Nullifier', 'Débil vs Skill Nullifier', 'スキル無効化に弱い', '스킬 무효화에 취약', 'Fraco contra Anulação', '怕技能无效'), aliases: [] },
    { id: 'weak_to_reflect', type: 'con', group: 'weak_to', category: 'weak_mechanics', translations: t('Weak vs Reflect', 'Débil vs Reflejo', '反射に弱い', '반사에 취약', 'Fraco contra Reflexo', '怕反射'), aliases: [] },
    { id: 'weak_to_counterattack', type: 'con', group: 'weak_to', category: 'weak_mechanics', translations: t('Weak vs Counterattack', 'Débil vs Contraataque', '反撃に弱い', '반격에 취약', 'Fraco contra Contra-ataque', '怕反击'), aliases: [] },
    { id: 'weak_to_anti_cr_push', type: 'con', group: 'weak_to', category: 'weak_mechanics', translations: t('Weak vs Anti-CR Push', 'Débil vs Anti-Push CR', 'ゲージ妨害に弱い', '행게감에 취약', 'Fraco contra Anti-Push CR', '怕压条'), aliases: [] },
    { id: 'weak_to_block', type: 'con', group: 'weak_to', category: 'weak_mechanics', translations: t('Weak to Block', 'Débil vs Bloqueo', 'ブロックに弱い', '차단에 취약', 'Fraco contra Bloqueio', '怕封锁'), aliases: [] },
    { id: 'weak_to_execution', type: 'con', group: 'weak_to', category: 'weak_mechanics', translations: t('Weak to Execution', 'Débil vs Ejecución', '処刑に弱い', '처형에 취약', 'Fraco contra Execução', '怕处决'), aliases: [] },
    { id: 'weak_to_anti_penetration', type: 'con', group: 'weak_to', category: 'weak_mechanics', translations: t('Weak to Penetration Resistance', 'Débil vs anti-penetración', '貫通抵抗に弱い', '관통 저항에 취약', 'Fraco contra anti-penetração', '怕穿透抵抗'), aliases: ['pen', 'penetration', 'penetración'] },
    { id: 'easily_countered', type: 'con', group: 'competitive', category: 'competitive_main', translations: t('Easily Countered', 'Fácil de Counterear', '対策容易', '카운터 맞기 쉬움', 'Fácil de Counterar', '容易被针对'), aliases: [] },
    { id: 'niche_pick', type: 'con', group: 'competitive', category: 'competitive_main', translations: t('Niche Pick', 'Pick Situacional', 'ニッチ', '조커 픽', 'Pick Situacional', '对策卡'), aliases: [] },
    { id: 'preban_candidate', type: 'con', group: 'competitive', category: 'competitive_main', translations: t('High Ban Rate', 'Baneado Frecuentemente', 'BAN筆頭', '필밴급', 'Banido Frequentemente', '常驻Ban位'), aliases: ['ban'] },
    { id: 'outdated', type: 'con', group: 'competitive', category: 'competitive_main', translations: t('Outdated / Powercrept', 'Desactualizado', '型落ち', '퇴물', 'Desatualizado', '时代的眼泪'), aliases: ['powercreep'] },
    { id: 'drafts_predictably', type: 'con', group: 'competitive', category: 'competitive_main', translations: t('Predictable Draft Pick', 'Pick Predecible', '予測可能なピック', '예측 가능한 픽', 'Pick Previsível', '拿法可预测'), aliases: [] },
    { id: 'no_first_pick', type: 'con', group: 'competitive', category: 'competitive_main', translations: t('Doesn\'t Work First Pick', 'No Funciona en Primer Pick', '先取り不向き', '선픽 부적합', 'Não Funciona no 1º Pick', '不适合先手拿'), aliases: [] },
    { id: 'fourth_fifth_pick_only', type: 'con', group: 'competitive', category: 'competitive_main', translations: t('4th/5th Pick Only', 'Pick de Cuarto/Quinto Solamente', '4-5番手専用', '4-5번 픽 전용', 'Apenas 4º/5º Pick', '仅4-5手位'), aliases: [] },
    { id: 'requires_preban_counter', type: 'con', group: 'competitive', category: 'competitive_main', translations: t('Requires Prebanning Counter', 'Requiere Prebanear un Counter', 'カウンター事前BAN必要', '카운터 사전 밴 필수', 'Requer Pré-ban de Counter', '需预Ban克制角色'), aliases: ['ban'] },
    { id: 'roster_depth_required', type: 'con', group: 'competitive', category: 'competitive_main', translations: t('Requires Wide Roster', 'Requiere Roster Amplio', '広いロスター必要', '폭넓은 로스터 필요', 'Requer Roster Amplo', '需要宽厚阵容'), aliases: [] },
    { id: 'only_works_on_offense', type: 'con', group: 'competitive', category: 'competitive_main', translations: t('Offense-Only (useless in GW def)', 'Solo Ofensivo (inútil en def GW)', '攻撃専用 (防衛不向き)', '공격 전용 (방덱 부적합)', 'Apenas Ofensivo (inútil GW def)', '仅进攻 (防守无用)'), aliases: ['gw'] },
    { id: 'pvp_only', type: 'con', group: 'competitive', category: 'competitive_main', translations: t('PvP only', 'Solo sirve en PvP', 'PvP専用', 'PvP 전용', 'Só serve no PvP', '仅限PvP'), aliases: [] },
    { id: 'pve_only', type: 'con', group: 'competitive', category: 'competitive_main', translations: t('PvE only', 'Solo sirve en PvE', 'PvE専用', 'PvE 전용', 'Só serve no PvE', '仅限PvE'), aliases: [] },
    { id: 'rta_coin_flip', type: 'con', group: 'competitive', category: 'competitive_main', translations: t('RTA Coin Flip', 'Cara o Cruz en RTA', 'RTA運ゲー', 'RTA 동전 던지기', 'Cara ou Coroa no RTA', 'RTA靠运气'), aliases: [] },
    { id: 'ai_issues', type: 'con', group: 'competitive', category: 'competitive_main', translations: t('Bad AI (auto)', 'Mala IA (auto)', 'オート時のAIが弱い', '자동 AI 약함', 'IA ruim (auto)', '自动AI表现差'), aliases: ['ai', 'auto'] },
];

export const ALL_TAGS: Tag[] = [...PROS_TAGS, ...CONS_TAGS];

const TAGS_BY_ID = new Map(ALL_TAGS.map((tag) => [tag.id, tag]));

export function getTagById(id: string): Tag | undefined {
    return TAGS_BY_ID.get(id);
}

function pick(labels: TagTranslations, locale: string): string {
    return labels[locale as Locale] || labels.en;
}

export function getTagLabel(tag: Tag, locale: string): string {
    return pick(tag.translations, locale);
}

export function getGroupLabel(groupId: string, locale: string): string {
    const group = TAG_GROUPS.find((g) => g.id === groupId);
    return group ? pick(group.labels, locale) : groupId;
}

export function getCategoryLabel(categoryId: string, locale: string): string {
    const category = TAG_CATEGORIES.find((c) => c.id === categoryId);
    return category ? pick(category.labels, locale) : categoryId;
}

/** Búsqueda en el nombre del tag en todos los idiomas y en sus alias (sin acentos ni mayúsculas) */
export function tagMatches(tag: Tag, query: string): boolean {
    const q = normalize(query);
    if (!q) return true;
    return [...Object.values(tag.translations), ...tag.aliases].some((text) => normalize(text).includes(q));
}

function normalize(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export const MAX_PROS = 5;
export const MAX_CONS = 5;
