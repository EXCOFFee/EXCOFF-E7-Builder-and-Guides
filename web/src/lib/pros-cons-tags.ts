/**
 * Pros/Cons Tags Data - Epic Seven Build System
 * 
 * Structure: Each tag has a unique ID, category, type (pro/con), and translations.
 * SOLID: Single source of truth for all tag data.
 * KISS: Simple key-value structure for easy lookup.
 * 
 * Supports 6 languages: EN, ES, JA, KO, PT, ZH
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

export interface Tag {
    id: string;
    type: TagType;
    category: string;
    translations: TagTranslations;
}

/**
 * Tag Categories for filtering (6 languages)
 */
export const TAG_CATEGORIES = {
    pros: [
        { id: 'damage', en: 'Damage', es: 'Daño', ja: 'ダメージ', ko: '데미지', pt: 'Dano', zh: '伤害' },
        { id: 'survivability', en: 'Survivability', es: 'Supervivencia', ja: '生存能力', ko: '생존력', pt: 'Sobrevivência', zh: '生存能力' },
        { id: 'control', en: 'Control', es: 'Control', ja: 'コントロール', ko: '컨트롤', pt: 'Controle', zh: '控制' },
        { id: 'speed', en: 'Speed', es: 'Velocidad', ja: '速度', ko: '속도', pt: 'Velocidade', zh: '速度' },
        { id: 'utility', en: 'Utility', es: 'Utilidad', ja: 'ユーティリティ', ko: '유틸리티', pt: 'Utilidade', zh: '功能' },
        { id: 'stats', en: 'Stats/Build', es: 'Stats/Build', ja: 'ステータス/ビルド', ko: '스탯/빌드', pt: 'Stats/Build', zh: '属性/构建' },
        { id: 'meta', en: 'Meta', es: 'Meta', ja: 'メタ', ko: '메타', pt: 'Meta', zh: 'Meta' },
        { id: 'pve', en: 'PvE', es: 'PvE', ja: 'PvE', ko: 'PvE', pt: 'PvE', zh: 'PvE' },
    ],
    cons: [
        { id: 'offense', en: 'Offensive Weakness', es: 'Debilidad Ofensiva', ja: '攻撃面の弱点', ko: '공격 약점', pt: 'Fraqueza Ofensiva', zh: '攻击弱点' },
        { id: 'fragility', en: 'Fragility', es: 'Fragilidad', ja: '脆弱性', ko: '취약함', pt: 'Fragilidade', zh: '脆弱' },
        { id: 'control_issues', en: 'Control Issues', es: 'Problemas de Control', ja: 'コントロール問題', ko: '컨트롤 문제', pt: 'Problemas de Controle', zh: '控制问题' },
        { id: 'speed_issues', en: 'Speed Issues', es: 'Problemas de Velocidad', ja: '速度問題', ko: '속도 문제', pt: 'Problemas de Velocidade', zh: '速度问题' },
        { id: 'gear', en: 'Gear Requirements', es: 'Requisitos de Equipo', ja: '装備要件', ko: '장비 조건', pt: 'Requisitos de Equipamento', zh: '装备要求' },
        { id: 'utility_limits', en: 'Utility Limits', es: 'Límites de Utilidad', ja: 'ユーティリティ制限', ko: '유틸리티 한계', pt: 'Limites de Utilidade', zh: '功能限制' },
        { id: 'competitive', en: 'Competitive Issues', es: 'Problemas Competitivos', ja: '競技問題', ko: '경쟁 문제', pt: 'Problemas Competitivos', zh: '竞技问题' },
        { id: 'pve_limits', en: 'PvE Limits', es: 'Límites PvE', ja: 'PvE制限', ko: 'PvE 한계', pt: 'Limites PvE', zh: 'PvE限制' },
        { id: 'dependencies', en: 'Dependencies', es: 'Dependencias', ja: '依存関係', ko: '의존성', pt: 'Dependências', zh: '依赖性' },
    ],
} as const;

// Helper function to create translations with all 6 languages
const t = (en: string, es: string, ja: string, ko: string, pt: string, zh: string): TagTranslations =>
    ({ en, es, ja, ko, pt, zh });

/**
 * All Tags - Pros (95 tags with 6 language translations)
 */
export const PROS_TAGS: Tag[] = [
    // DAMAGE - Scaling
    { id: 'damage_hp_scaling', type: 'pro', category: 'damage', translations: t('Damage scales with HP', 'Daño escala con HP', 'HPでダメージ増加', 'HP 비례 데미지', 'Dano escala com HP', 'HP比例伤害') },
    { id: 'damage_def_scaling', type: 'pro', category: 'damage', translations: t('Damage scales with DEF', 'Daño escala con DEF', '防御でダメージ増加', '방어력 비례 데미지', 'Dano escala com DEF', '防御比例伤害') },
    { id: 'damage_spd_scaling', type: 'pro', category: 'damage', translations: t('Damage scales with SPD', 'Daño escala con VEL', '速度でダメージ増加', '속도 비례 데미지', 'Dano escala com VEL', '速度比例伤害') },
    { id: 'damage_target_hp', type: 'pro', category: 'damage', translations: t('Damage scales with enemy HP', 'Daño escala con HP enemigo', '敵HPでダメージ増加', '적 HP 비례 데미지', 'Dano escala com HP inimigo', '敌方HP比例伤害') },
    { id: 'damage_target_atk', type: 'pro', category: 'damage', translations: t('Damage scales with enemy ATK', 'Daño escala con ATK enemigo', '敵攻撃でダメージ増加', '적 공격력 비례 데미지', 'Dano escala com ATK inimigo', '敌方攻击比例伤害') },
    // DAMAGE - Type
    { id: 'high_multipliers', type: 'pro', category: 'damage', translations: t('High damage multipliers', 'Multiplicadores de daño altos', '高倍率', '높은 배율', 'Multiplicadores altos', '高倍率') },
    { id: 'aoe_damage', type: 'pro', category: 'damage', translations: t('AoE damage', 'Daño en área (AoE)', '範囲攻撃', '광역 공격', 'Dano em área', '范围伤害') },
    { id: 'single_target_nuke', type: 'pro', category: 'damage', translations: t('Single target nuke', 'Nuke de objetivo único', '単体高火力', '단일 대상 누킹', 'Nuke de alvo único', '单体爆发') },
    { id: 'fixed_damage', type: 'pro', category: 'damage', translations: t('Fixed damage (ignores DEF)', 'Daño fijo (ignora DEF)', '固定ダメージ', '고정 데미지', 'Dano fixo (ignora DEF)', '固定伤害') },
    { id: 'extra_attacks', type: 'pro', category: 'damage', translations: t('Extra attacks', 'Ataques adicionales', '追加攻撃', '추가 공격', 'Ataques extras', '额外攻击') },
    { id: 'dual_attack_synergy', type: 'pro', category: 'damage', translations: t('Dual Attack synergy', 'Sinergia con Dual Attack', '協力攻撃シナジー', '협공 시너지', 'Sinergia com Ataque Duplo', '协同攻击协同') },
    // DAMAGE - Penetration
    { id: 'def_penetration', type: 'pro', category: 'damage', translations: t('Defense penetration', 'Penetración de defensa', '防御貫通', '방어 관통', 'Penetração de defesa', '防御穿透') },
    { id: 'def_ignore', type: 'pro', category: 'damage', translations: t('Ignores defense (100%)', 'Ignora defensa (100%)', '防御無視', '방어 무시', 'Ignora defesa (100%)', '无视防御') },
    { id: 'element_advantage', type: 'pro', category: 'damage', translations: t('Always elemental advantage', 'Siempre ventaja elemental', '常時属性有利', '항상 속성 유리', 'Sempre vantagem elemental', '始终元素有利') },

    // SURVIVABILITY - Defensive
    { id: 'high_base_hp', type: 'pro', category: 'survivability', translations: t('High base HP', 'HP base alta', '高HP', '높은 기본 HP', 'HP base alto', '高基础HP') },
    { id: 'high_base_def', type: 'pro', category: 'survivability', translations: t('High base DEF', 'DEF base alta', '高防御', '높은 기본 방어', 'DEF base alta', '高基础防御') },
    { id: 'damage_reduction', type: 'pro', category: 'survivability', translations: t('Damage reduction', 'Reducción de daño', 'ダメージ軽減', '데미지 감소', 'Redução de dano', '伤害减免') },
    { id: 'damage_share', type: 'pro', category: 'survivability', translations: t('Shares damage with allies', 'Comparte daño con aliados', 'ダメージ分散', '데미지 분산', 'Compartilha dano', '分担伤害') },
    { id: 'self_healing', type: 'pro', category: 'survivability', translations: t('Self healing', 'Se cura a sí mismo', '自己回復', '자가 회복', 'Auto cura', '自我治疗') },
    { id: 'lifesteal_built_in', type: 'pro', category: 'survivability', translations: t('Built-in lifesteal', 'Lifesteal incorporado', '内蔵吸血', '내장 흡혈', 'Roubo de vida embutido', '内置吸血') },
    // SURVIVABILITY - Immunity
    { id: 'self_immunity', type: 'pro', category: 'survivability', translations: t('Grants self immunity', 'Se otorga inmunidad', '自己免疫付与', '자체 면역 부여', 'Concede auto imunidade', '自我免疫') },
    { id: 'skill_nullifier', type: 'pro', category: 'survivability', translations: t('Grants Skill Nullifier', 'Otorga Skill Nullifier', 'スキル無効化付与', '스킬 무효화 부여', 'Concede Anulação de Skill', '技能无效化') },
    { id: 'invincibility', type: 'pro', category: 'survivability', translations: t('Grants invincibility', 'Otorga invencibilidad', '無敵付与', '무적 부여', 'Concede invencibilidade', '无敌') },
    { id: 'immortality_buff', type: 'pro', category: 'survivability', translations: t('Grants immortality', 'Otorga inmortalidad', '不死付与', '불사 부여', 'Concede imortalidade', '不死') },
    { id: 'stealth', type: 'pro', category: 'survivability', translations: t('Grants stealth', 'Otorga sigilo', 'ステルス付与', '은신 부여', 'Concede furtividade', '隐身') },
    { id: 'evasion_buff', type: 'pro', category: 'survivability', translations: t('High evasion', 'Alta evasión', '高回避', '높은 회피', 'Alta evasão', '高闪避') },
    // SURVIVABILITY - Revive
    { id: 'revive_ally', type: 'pro', category: 'survivability', translations: t('Can revive allies', 'Puede revivir aliados', '味方蘇生可能', '아군 부활 가능', 'Pode reviver aliados', '可复活队友') },
    { id: 'self_revive', type: 'pro', category: 'survivability', translations: t('Self revive', 'Se revive a sí mismo', '自己蘇生', '자가 부활', 'Auto revive', '自我复活') },
    { id: 'barrier_provider', type: 'pro', category: 'survivability', translations: t('Provides barriers', 'Otorga barreras', 'バリア付与', '보호막 부여', 'Fornece barreiras', '提供护盾') },

    // CONTROL
    { id: 'stun', type: 'pro', category: 'control', translations: t('Inflicts stun', 'Inflige aturdir', 'スタン付与', '기절 부여', 'Inflige atordoamento', '眩晕') },
    { id: 'sleep', type: 'pro', category: 'control', translations: t('Inflicts sleep', 'Inflige sueño', '睡眠付与', '수면 부여', 'Inflige sono', '睡眠') },
    { id: 'silence', type: 'pro', category: 'control', translations: t('Inflicts silence', 'Inflige silencio', '沈黙付与', '침묵 부여', 'Inflige silêncio', '沉默') },
    { id: 'provoke', type: 'pro', category: 'control', translations: t('Inflicts provoke', 'Inflige provocar', '挑発付与', '도발 부여', 'Inflige provocação', '嘲讽') },
    { id: 'restrict', type: 'pro', category: 'control', translations: t('Inflicts restrict', 'Inflige restringir', '拘束付与', '구속 부여', 'Inflige restrição', '禁锢') },
    { id: 'def_break', type: 'pro', category: 'control', translations: t('Defense break', 'Rompe defensa', '防御ダウン', '방어력 감소', 'Quebra de defesa', '防御下降') },
    { id: 'target_debuff', type: 'pro', category: 'control', translations: t('Inflicts target', 'Inflige objetivo', 'ターゲット付与', '타겟 부여', 'Inflige alvo', '目标') },
    { id: 'decrease_speed', type: 'pro', category: 'control', translations: t('Decreases speed', 'Reduce velocidad', '速度ダウン', '속도 감소', 'Reduz velocidade', '速度下降') },
    { id: 'decrease_atk', type: 'pro', category: 'control', translations: t('Decreases attack', 'Reduce ataque', '攻撃ダウン', '공격력 감소', 'Reduz ataque', '攻击下降') },
    { id: 'unhealable', type: 'pro', category: 'control', translations: t('Inflicts unhealable', 'Inflige incurable', '回復不能付与', '회복 불가 부여', 'Inflige incurável', '无法治愈') },
    { id: 'unable_to_buff', type: 'pro', category: 'control', translations: t('Blocks buffs', 'Bloquea buffs', 'バフ封印', '버프 불가', 'Bloqueia buffs', '禁止增益') },
    { id: 'strip_buffs', type: 'pro', category: 'control', translations: t('Strips/Dispels buffs', 'Quita/Disipa buffs', 'バフ解除', '버프 해제', 'Remove buffs', '驱散增益') },
    { id: 'extinction', type: 'pro', category: 'control', translations: t('Inflicts extinction', 'Inflige extinción', '消滅付与', '소멸 부여', 'Inflige extinção', '湮灭') },
    { id: 'injury', type: 'pro', category: 'control', translations: t('Inflicts injury', 'Inflige herida', '負傷付与', '부상 부여', 'Inflige ferimento', '创伤') },
    { id: 'seal', type: 'pro', category: 'control', translations: t('Inflicts seal', 'Inflige sello', '封印付与', '봉인 부여', 'Inflige selo', '封印') },
    { id: 'cooldown_increase', type: 'pro', category: 'control', translations: t('Increases cooldowns', 'Aumenta enfriamientos', 'クールダウン増加', '재사용 대기시간 증가', 'Aumenta tempos de recarga', '增加冷却') },

    // SPEED
    { id: 'high_base_speed', type: 'pro', category: 'speed', translations: t('High base speed (110+)', 'Velocidad base alta (110+)', '高速度(110+)', '높은 기본 속도 (110+)', 'Velocidade base alta (110+)', '高基础速度(110+)') },
    { id: 'very_high_base_speed', type: 'pro', category: 'speed', translations: t('Very high base speed (115+)', 'Velocidad base muy alta (115+)', '超高速度(115+)', '매우 높은 기본 속도 (115+)', 'Velocidade base muito alta (115+)', '极高基础速度(115+)') },
    { id: 'cr_push_self', type: 'pro', category: 'speed', translations: t('Self CR push', 'Push de CR propio', '自己CR増加', '자신 CR 증가', 'Push de CR próprio', '自我CR推进') },
    { id: 'cr_push_team', type: 'pro', category: 'speed', translations: t('Team CR push', 'Push de CR al equipo', 'チームCR増加', '팀 CR 증가', 'Push de CR para equipe', '团队CR推进') },
    { id: 'cr_decrease_enemy', type: 'pro', category: 'speed', translations: t('Enemy CR decrease', 'Reduce CR enemigo', '敵CR減少', '적 CR 감소', 'Reduz CR inimigo', '降低敌方CR') },
    { id: 'extra_turn', type: 'pro', category: 'speed', translations: t('Extra turn', 'Turno extra', '追加ターン', '추가 턴', 'Turno extra', '额外回合') },
    { id: 'turn_cycling', type: 'pro', category: 'speed', translations: t('Good turn cycling', 'Buen ciclado de turnos', 'ターン回転良好', '좋은 턴 순환', 'Bom ciclo de turnos', '良好的轮换') },

    // UTILITY - Buffs
    { id: 'atk_buff', type: 'pro', category: 'utility', translations: t('ATK buff', 'Buff de ATK', '攻撃バフ', '공격력 버프', 'Buff de ATK', '攻击增益') },
    { id: 'def_buff', type: 'pro', category: 'utility', translations: t('DEF buff', 'Buff de DEF', '防御バフ', '방어력 버프', 'Buff de DEF', '防御增益') },
    { id: 'speed_buff', type: 'pro', category: 'utility', translations: t('Speed buff', 'Buff de velocidad', '速度バフ', '속도 버프', 'Buff de velocidade', '速度增益') },
    { id: 'crit_buff', type: 'pro', category: 'utility', translations: t('Crit buff', 'Buff de crítico', 'クリバフ', '치명타 버프', 'Buff de crítico', '暴击增益') },
    { id: 'immunity_buff', type: 'pro', category: 'utility', translations: t('Team immunity', 'Inmunidad al equipo', 'チーム免疫', '팀 면역', 'Imunidade para equipe', '团队免疫') },
    { id: 'greater_atk_buff', type: 'pro', category: 'utility', translations: t('Greater ATK buff', 'Buff de ATK mayor', '大攻撃バフ', '대형 공격력 버프', 'Buff de ATK maior', '大攻击增益') },
    { id: 'skill_nullifier_team', type: 'pro', category: 'utility', translations: t('Team Skill Nullifier', 'Skill Nullifier al equipo', 'チームスキル無効化', '팀 스킬 무효화', 'Anulação de Skill para equipe', '团队技能无效化') },
    { id: 'immortality_team', type: 'pro', category: 'utility', translations: t('Team immortality', 'Inmortalidad al equipo', 'チーム不死', '팀 불사', 'Imortalidade para equipe', '团队不死') },
    // UTILITY - Cleanse
    { id: 'cleanse_debuffs', type: 'pro', category: 'utility', translations: t('Cleanses debuffs', 'Limpia debuffs', 'デバフ解除', '디버프 해제', 'Limpa debuffs', '净化减益') },
    { id: 'transfer_debuffs', type: 'pro', category: 'utility', translations: t('Transfers debuffs', 'Transfiere debuffs', 'デバフ移転', '디버프 전이', 'Transfere debuffs', '转移减益') },
    { id: 'full_team_cleanse', type: 'pro', category: 'utility', translations: t('Full team cleanse', 'Cleanse completo al equipo', 'フルチーム解除', '전체 해제', 'Limpeza completa da equipe', '全队净化') },
    // UTILITY - Support
    { id: 'team_healer', type: 'pro', category: 'utility', translations: t('Team healer', 'Curador del equipo', 'チームヒーラー', '팀 힐러', 'Curador da equipe', '团队治疗者') },
    { id: 'cr_pusher', type: 'pro', category: 'utility', translations: t('CR pusher', 'Pusher de CR', 'CRプッシャー', 'CR 푸셔', 'Pusher de CR', 'CR推进者') },
    { id: 'buff_extender', type: 'pro', category: 'utility', translations: t('Extends buffs', 'Extiende buffs', 'バフ延長', '버프 연장', 'Estende buffs', '延长增益') },
    { id: 'anti_revive', type: 'pro', category: 'utility', translations: t('Anti-revive (extinction)', 'Anti-revive (extinción)', '蘇生防止', '부활 방지', 'Anti-revive (extinção)', '反复活') },

    // STATS
    { id: 'easy_to_gear', type: 'pro', category: 'stats', translations: t('Easy to gear', 'Fácil de equipar', '装備しやすい', '장비하기 쉬움', 'Fácil de equipar', '易于装备') },
    { id: 'flexible_builds', type: 'pro', category: 'stats', translations: t('Flexible builds', 'Builds flexibles', '柔軟なビルド', '유연한 빌드', 'Builds flexíveis', '灵活构建') },
    { id: 'low_speed_requirement', type: 'pro', category: 'stats', translations: t('Low speed requirement', 'No requiere ser rápido', '低速度要件', '속도 요구 낮음', 'Baixo requisito de velocidade', '低速度要求') },
    { id: 'works_broken_gear', type: 'pro', category: 'stats', translations: t('Works with average gear', 'Funciona con gear promedio', '平均装備でOK', '보통 장비로 가능', 'Funciona com gear médio', '普通装备可用') },
    { id: 'multiple_viable_sets', type: 'pro', category: 'stats', translations: t('Multiple viable sets', 'Varios sets viables', '複数セット可能', '여러 세트 가능', 'Vários sets viáveis', '多套装可选') },
    { id: 'no_crit_needed', type: 'pro', category: 'stats', translations: t('No crit needed', 'No necesita crítico', 'クリ不要', '치명타 불필요', 'Não precisa de crítico', '无需暴击') },

    // META - RTA
    { id: 'rta_first_pick', type: 'pro', category: 'meta', translations: t('Good RTA first pick', 'Buen first pick en RTA', 'RTA先出し推奨', 'RTA 선픽 추천', 'Bom primeiro pick no RTA', 'RTA先手推荐') },
    { id: 'rta_flex_pick', type: 'pro', category: 'meta', translations: t('RTA flex pick', 'Pick flexible en RTA', 'RTA柔軟ピック', 'RTA 유연 픽', 'Pick flexível no RTA', 'RTA灵活选择') },
    { id: 'rta_counter_pick', type: 'pro', category: 'meta', translations: t('Good counter pick', 'Buen counter pick', 'カウンターピック', '카운터 픽 추천', 'Bom counter pick', '好的反制选择') },
    { id: 'rta_safe_pick', type: 'pro', category: 'meta', translations: t('Safe pick', 'Pick seguro', '安全ピック', '안전 픽', 'Pick seguro', '安全选择') },
    { id: 'rta_pick_guard', type: 'pro', category: 'meta', translations: t('Good pick guard', 'Buen pick guard', 'ピックガード', '픽 가드 추천', 'Bom pick guard', '好的守护选择') },
    { id: 'rta_carry', type: 'pro', category: 'meta', translations: t('Can carry games', 'Puede carry partidas', 'キャリー可能', '캐리 가능', 'Pode carregar jogos', '可carry比赛') },
    // META - Arena/GW
    { id: 'arena_offense', type: 'pro', category: 'meta', translations: t('Great Arena offense', 'Excelente en Arena Offense', 'アリーナ攻撃に最適', '아레나 공격 추천', 'Ótimo para ataque na Arena', '竞技场进攻强') },
    { id: 'arena_defense', type: 'pro', category: 'meta', translations: t('Great Arena defense', 'Excelente en Arena Defense', 'アリーナ防衛に最適', '아레나 방어 추천', 'Ótimo para defesa na Arena', '竞技场防守强') },
    { id: 'gw_offense', type: 'pro', category: 'meta', translations: t('Great GW offense', 'Excelente en GW Offense', 'ギルド戦攻撃に最適', '길드전 공격 추천', 'Ótimo para ataque na GW', '公会战进攻强') },
    { id: 'gw_defense', type: 'pro', category: 'meta', translations: t('Great GW defense', 'Excelente en GW Defense', 'ギルド戦防衛に最適', '길드전 방어 추천', 'Ótimo para defesa na GW', '公会战防守强') },
    // META - Counters
    { id: 'counters_cleave', type: 'pro', category: 'meta', translations: t('Counters cleave', 'Counterea cleave', 'クリーブ対策', '클리브 카운터', 'Counterea cleave', '克制开速') },
    { id: 'counters_bruisers', type: 'pro', category: 'meta', translations: t('Counters bruisers', 'Counterea bruisers', 'ブルーザー対策', '브루저 카운터', 'Counterea bruisers', '克制坦刺') },
    { id: 'counters_tanks', type: 'pro', category: 'meta', translations: t('Counters tanks', 'Counterea tanks', 'タンク対策', '탱커 카운터', 'Counterea tanks', '克制坦克') },
    { id: 'counters_revivers', type: 'pro', category: 'meta', translations: t('Counters revivers', 'Counterea revivers', '蘇生対策', '부활 카운터', 'Counterea revive', '克制复活') },
    { id: 'counters_openers', type: 'pro', category: 'meta', translations: t('Counters openers', 'Counterea openers', 'オープナー対策', '오프너 카운터', 'Counterea openers', '克制先手') },

    // PVE
    { id: 'pve_general', type: 'pro', category: 'pve', translations: t('Good in PvE', 'Bueno en PvE', 'PvE向き', 'PvE 적합', 'Bom em PvE', 'PvE好用') },
    { id: 'hunt_specialist', type: 'pro', category: 'pve', translations: t('Hunt specialist', 'Especialista en Hunts', '討伐専門', '사냥 전문', 'Especialista em Caçadas', '讨伐专家') },
    { id: 'abyss_useful', type: 'pro', category: 'pve', translations: t('Useful in Abyss', 'Útil en Abyss', '深淵で有用', '심연에 유용', 'Útil no Abismo', '深渊有用') },
    { id: 'expedition_core', type: 'pro', category: 'pve', translations: t('Expedition core', 'Core en Expeditions', '遠征コア', '원정 핵심', 'Core de Expedição', '远征核心') },
    { id: 'constellation_trial', type: 'pro', category: 'pve', translations: t('Good in Constellation Trial', 'Bueno en Prueba de Constelaciones', '星座試練向き', '별자리 시련 적합', 'Bom em Prova de Constelação', '星座试炼好用') },
    { id: 'automaton_tower', type: 'pro', category: 'pve', translations: t('Good in Automaton Tower', 'Bueno en Torre Autómata', 'オートマタ塔向き', '오토마타 타워 적합', 'Bom na Torre Autômata', '自动塔好用') },
    { id: 'labyrinth', type: 'pro', category: 'pve', translations: t('Good in Labyrinth', 'Bueno en Laberinto', '迷宮向き', '미로 적합', 'Bom no Labirinto', '迷宫好用') },
];

/**
 * All Tags - Cons (65 tags with 6 language translations)
 */
export const CONS_TAGS: Tag[] = [
    // OFFENSIVE WEAKNESS
    { id: 'low_damage', type: 'con', category: 'offense', translations: t('Low damage', 'Daño bajo', '低火力', '낮은 데미지', 'Dano baixo', '伤害低') },
    { id: 'needs_setup', type: 'con', category: 'offense', translations: t('Needs setup', 'Necesita preparación', '準備が必要', '셋업 필요', 'Precisa de preparação', '需要铺垫') },
    { id: 'single_target_only', type: 'con', category: 'offense', translations: t('Single target only', 'Solo objetivo único', '単体のみ', '단일 대상만', 'Apenas alvo único', '仅单体') },
    { id: 'no_def_penetration', type: 'con', category: 'offense', translations: t('No defense penetration', 'Sin penetración de defensa', '防御貫通なし', '방어 관통 없음', 'Sem penetração de defesa', '无防御穿透') },
    { id: 'weak_multipliers', type: 'con', category: 'offense', translations: t('Weak multipliers', 'Multiplicadores bajos', '低倍率', '낮은 배율', 'Multiplicadores baixos', '低倍率') },
    { id: 'unreliable_damage', type: 'con', category: 'offense', translations: t('Unreliable damage', 'Daño inconsistente', '不安定ダメージ', '불안정한 데미지', 'Dano inconsistente', '伤害不稳定') },
    { id: 'penetration_dependent', type: 'con', category: 'offense', translations: t('Penetration dependent', 'Depende de penetración', '貫通依存', '관통 의존', 'Dependente de penetração', '依赖穿透') },

    // FRAGILITY
    { id: 'low_base_hp', type: 'con', category: 'fragility', translations: t('Low base HP', 'HP base baja', '低HP', '낮은 기본 HP', 'HP base baixo', '低基础HP') },
    { id: 'low_base_def', type: 'con', category: 'fragility', translations: t('Low base DEF', 'DEF base baja', '低防御', '낮은 기본 방어', 'DEF base baixa', '低基础防御') },
    { id: 'squishy', type: 'con', category: 'fragility', translations: t('Very squishy', 'Muy frágil', '非常に脆い', '매우 취약', 'Muito frágil', '非常脆弱') },
    { id: 'no_self_sustain', type: 'con', category: 'fragility', translations: t('No self sustain', 'Sin sustain propio', '自己維持なし', '자체 유지력 없음', 'Sem auto sustentação', '无自我维持') },
    { id: 'easily_killed', type: 'con', category: 'fragility', translations: t('Easily killed', 'Fácil de matar', '倒されやすい', '쉽게 죽음', 'Fácil de matar', '容易死') },
    { id: 'weak_to_burst', type: 'con', category: 'fragility', translations: t('Weak to burst', 'Débil al burst', 'バーストに弱い', '버스트에 약함', 'Fraco contra burst', '怕爆发') },

    // CONTROL ISSUES
    { id: 'low_effectiveness', type: 'con', category: 'control_issues', translations: t('Low base effectiveness', 'Efectividad base baja', '低効果命中', '낮은 기본 효과적중', 'Efetividade base baixa', '效命低') },
    { id: 'unreliable_debuffs', type: 'con', category: 'control_issues', translations: t('Unreliable debuffs', 'Debuffs poco confiables', '不安定デバフ', '불안정한 디버프', 'Debuffs não confiáveis', '减益不稳定') },
    { id: 'needs_effectiveness', type: 'con', category: 'control_issues', translations: t('Needs high effectiveness', 'Requiere mucha efectividad', '高効果命中必要', '높은 효적 필요', 'Precisa de alta efetividade', '需要高效命') },
    { id: 'single_target_debuffs', type: 'con', category: 'control_issues', translations: t('Single target debuffs', 'Debuffs solo ST', '単体デバフのみ', '단일 대상 디버프만', 'Debuffs apenas em alvo único', '仅单体减益') },
    { id: 'countered_by_immunity', type: 'con', category: 'control_issues', translations: t('Countered by immunity', 'Countered por inmunidad', '免疫で無力化', '면역에 취약', 'Counterado por imunidade', '被免疫克制') },
    { id: 'countered_by_cleanse', type: 'con', category: 'control_issues', translations: t('Countered by cleanse', 'Countered por cleanse', '解除で無力化', '해제에 취약', 'Counterado por limpeza', '被净化克制') },

    // SPEED ISSUES
    { id: 'low_base_speed', type: 'con', category: 'speed_issues', translations: t('Low base speed', 'Velocidad base baja', '低速度', '낮은 기본 속도', 'Velocidade base baixa', '基础速度低') },
    { id: 'slow_turn_cycling', type: 'con', category: 'speed_issues', translations: t('Slow turn cycling', 'Ciclado lento', 'ターン回転が遅い', '느린 턴 순환', 'Ciclo de turnos lento', '轮换慢') },
    { id: 'needs_to_be_fastest', type: 'con', category: 'speed_issues', translations: t('Needs to be fastest', 'Necesita ser el más rápido', '最速必須', '선턴 필수', 'Precisa ser o mais rápido', '需要先手') },
    { id: 'speed_contesting', type: 'con', category: 'speed_issues', translations: t('Hard to speed contest', 'Difícil competir en velocidad', '速度競争困難', '선속 경쟁 어려움', 'Difícil competir em velocidade', '难以抢速') },
    { id: 'outsped_easily', type: 'con', category: 'speed_issues', translations: t('Easily outsped', 'Fácil de outspeed', '先手取られやすい', '쉽게 선턴 뺏김', 'Facilmente superado em velocidade', '容易被抢速') },
    { id: 'no_cr_manipulation', type: 'con', category: 'speed_issues', translations: t('No CR manipulation', 'Sin manipulación de CR', 'CR操作なし', 'CR 조작 없음', 'Sem manipulação de CR', '无CR操作') },

    // GEAR REQUIREMENTS
    { id: 'hard_to_gear', type: 'con', category: 'gear', translations: t('Hard to gear', 'Difícil de equipar', '装備が難しい', '장비하기 어려움', 'Difícil de equipar', '难以装备') },
    { id: 'needs_premium_gear', type: 'con', category: 'gear', translations: t('Needs premium gear', 'Necesita gear premium', '最高級装備必要', '프리미엄 장비 필요', 'Precisa de equipamento premium', '需要顶级装备') },
    { id: 'stat_hungry', type: 'con', category: 'gear', translations: t('Stat hungry', 'Requiere muchas stats', 'ステータス多く必要', '스탯 요구 높음', 'Exigente em stats', '属性需求高') },
    { id: 'specific_set_required', type: 'con', category: 'gear', translations: t('Specific set required', 'Set específico requerido', '特定セット必須', '특정 세트 필수', 'Set específico necessário', '需要特定套装') },
    { id: 'high_speed_requirement', type: 'con', category: 'gear', translations: t('High speed requirement', 'Requiere mucha velocidad', '高速度必要', '높은 속도 필요', 'Exige alta velocidade', '需要高速度') },
    { id: 'needs_100_crit', type: 'con', category: 'gear', translations: t('Needs 100% crit', 'Necesita 100% crítico', '100%クリ必要', '100% 치명타 필요', 'Precisa 100% de crítico', '需要100%暴击') },
    { id: 'needs_high_eff_res', type: 'con', category: 'gear', translations: t('Needs high Eff Res', 'Necesita alta Res Efecto', '高効抵必要', '높은 효저 필요', 'Precisa alta Res de Efeito', '需要高效抗') },

    // UTILITY LIMITS
    { id: 'no_utility', type: 'con', category: 'utility_limits', translations: t('No extra utility', 'Sin utilidad extra', '追加ユーティリティなし', '추가 유틸리티 없음', 'Sem utilidade extra', '无额外功能') },
    { id: 'selfish_kit', type: 'con', category: 'utility_limits', translations: t('Selfish kit', 'Kit egoísta', '利己的キット', '이기적 키트', 'Kit egoísta', '自私技能组') },
    { id: 'long_cooldowns', type: 'con', category: 'utility_limits', translations: t('Long cooldowns', 'Enfriamientos largos', 'クールダウンが長い', '긴 재사용 대기', 'Tempos de recarga longos', '冷却长') },
    { id: 'needs_soulburn', type: 'con', category: 'utility_limits', translations: t('Soulburn dependent', 'Depende de soulburn', 'ソウルバーン依存', '소울번 의존', 'Dependente de Soulburn', '依赖燃魂') },
    { id: 'needs_molagora', type: 'con', category: 'utility_limits', translations: t('Needs many molas', 'Necesita muchos molas', 'モラ多く必要', '몰라고라 많이 필요', 'Precisa de muitos molas', '需要很多魔种') },
    { id: 'imprint_dependent', type: 'con', category: 'utility_limits', translations: t('Imprint dependent', 'Depende del imprint', '陣形効果依存', '각인 의존', 'Dependente de Imprint', '依赖刻印') },

    // COMPETITIVE
    { id: 'easily_countered', type: 'con', category: 'competitive', translations: t('Easily countered', 'Fácil de counterear', '対策されやすい', '쉽게 카운터됨', 'Facilmente counterado', '易被克制') },
    { id: 'countered_by_tanks', type: 'con', category: 'competitive', translations: t('Countered by tanks', 'Countered por tanks', 'タンクに弱い', '탱커에 취약', 'Counterado por tanks', '被坦克克制') },
    { id: 'countered_by_bruisers', type: 'con', category: 'competitive', translations: t('Countered by bruisers', 'Countered por bruisers', 'ブルーザーに弱い', '브루저에 취약', 'Counterado por bruisers', '被坦刺克制') },
    { id: 'countered_by_strippers', type: 'con', category: 'competitive', translations: t('Countered by strippers', 'Countered por strip', 'バフ解除に弱い', '버프 해제에 취약', 'Counterado por removedores', '被驱散克制') },
    { id: 'countered_by_control', type: 'con', category: 'competitive', translations: t('Countered by control', 'Countered por control', 'コントロールに弱い', '컨트롤에 취약', 'Counterado por controle', '被控制克制') },
    { id: 'countered_by_speed', type: 'con', category: 'competitive', translations: t('Countered by speed', 'Countered por velocidad', '速度に弱い', '속도에 취약', 'Counterado por velocidade', '被速度克制') },
    { id: 'off_meta', type: 'con', category: 'competitive', translations: t('Off meta', 'Fuera del meta', 'メタ外', '메타 밖', 'Fora do meta', '非主流') },
    { id: 'niche_pick', type: 'con', category: 'competitive', translations: t('Niche pick', 'Pick situacional', 'ニッチピック', '니치 픽', 'Pick de nicho', '小众选择') },
    { id: 'easily_banned', type: 'con', category: 'competitive', translations: t('Easily banned (RTA)', 'Fácil de banear (RTA)', 'BAN対象になりやすい', '쉽게 밴됨 (RTA)', 'Facilmente banido (RTA)', '容易被禁') },
    { id: 'predictable', type: 'con', category: 'competitive', translations: t('Predictable', 'Predecible', '予測可能', '예측 가능', 'Previsível', '可预测') },
    { id: 'replaced_by_better', type: 'con', category: 'competitive', translations: t('Better options exist', 'Hay mejores opciones', 'より良い選択肢あり', '더 좋은 대안 있음', 'Existem opções melhores', '有更好选择') },

    // PVE LIMITS
    { id: 'bad_in_hunts', type: 'con', category: 'pve_limits', translations: t('Bad in Hunts', 'Malo en Hunts', '討伐に不向き', '사냥에 부적합', 'Ruim em Caçadas', '讨伐不好用') },
    { id: 'bad_in_abyss', type: 'con', category: 'pve_limits', translations: t('Bad in Abyss', 'Malo en Abyss', '深淵に不向き', '심연에 부적합', 'Ruim no Abismo', '深渊不好用') },
    { id: 'pvp_only', type: 'con', category: 'pve_limits', translations: t('PvP only', 'Solo útil en PvP', 'PvPのみ', 'PvP 전용', 'Apenas PvP', '仅PvP') },
    { id: 'limited_pve_use', type: 'con', category: 'pve_limits', translations: t('Limited PvE use', 'Uso PvE limitado', 'PvE用途限定', 'PvE 용도 제한', 'Uso PvE limitado', 'PvE用途有限') },

    // DEPENDENCIES
    { id: 'team_dependent', type: 'con', category: 'dependencies', translations: t('Team dependent', 'Depende del equipo', 'チーム依存', '팀 의존', 'Dependente da equipe', '依赖队伍') },
    { id: 'needs_cr_pusher', type: 'con', category: 'dependencies', translations: t('Needs CR pusher', 'Necesita CR pusher', 'CRプッシャー必要', 'CR 푸셔 필요', 'Precisa de CR pusher', '需要CR推进') },
    { id: 'needs_defense_breaker', type: 'con', category: 'dependencies', translations: t('Needs def breaker', 'Necesita def breaker', '防御ダウン必要', '방깎 필요', 'Precisa de quebra de defesa', '需要防御下降') },
    { id: 'needs_specific_comp', type: 'con', category: 'dependencies', translations: t('Specific comp required', 'Composición específica', '特定構成必要', '특정 조합 필요', 'Composição específica necessária', '需要特定阵容') },
    { id: 'needs_attack_buffer', type: 'con', category: 'dependencies', translations: t('Needs ATK buffer', 'Necesita ATK buffer', '攻撃バッファー必要', '공버 필요', 'Precisa de ATK buffer', '需要攻击buff') },
    { id: 'synergy_dependent', type: 'con', category: 'dependencies', translations: t('Synergy dependent', 'Depende de sinergias', 'シナジー依存', '시너지 의존', 'Dependente de sinergias', '依赖协同') },
];

/**
 * All tags combined for easy lookup
 */
export const ALL_TAGS: Tag[] = [...PROS_TAGS, ...CONS_TAGS];

/**
 * Get tag by ID - DRY helper function
 */
export function getTagById(id: string): Tag | undefined {
    return ALL_TAGS.find(tag => tag.id === id);
}

/**
 * Get translated tag label - supports all 6 languages
 */
export function getTagLabel(tag: Tag, locale: string): string {
    const loc = locale as Locale;
    if (tag.translations[loc]) return tag.translations[loc];
    return tag.translations.en; // Default fallback
}

/**
 * Get category label - supports all 6 languages
 */
export function getCategoryLabel(categoryId: string, type: TagType, locale: string): string {
    const categories = type === 'pro' ? TAG_CATEGORIES.pros : TAG_CATEGORIES.cons;
    const category = categories.find(c => c.id === categoryId);
    if (!category) return categoryId;
    const loc = locale as keyof typeof category;
    return (category[loc] as string) || category.en;
}

/**
 * Tag limits - DRY constant
 */
export const MAX_PROS = 5;
export const MAX_CONS = 5;
