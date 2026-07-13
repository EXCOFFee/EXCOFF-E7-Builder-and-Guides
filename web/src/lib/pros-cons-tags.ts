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
        { id: 'mechanics', en: 'Mechanics', es: 'Mecánicas', ja: 'メカニクス', ko: '메커니즘', pt: 'Mecânicas', zh: '机制' },
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
 * All Tags - Pros (Cleaned & Expanded)
 */
export const PROS_TAGS: Tag[] = [
    // DAMAGE - Scaling
    { id: 'damage_hp_scaling', type: 'pro', category: 'damage', translations: t('Damage scales with HP', 'Daño escala con HP', 'HPでダメージ増加', 'HP 비례 데미지', 'Dano escala com HP', 'HP比例伤害') },
    { id: 'damage_def_scaling', type: 'pro', category: 'damage', translations: t('Damage scales with DEF', 'Daño escala con DEF', '防御でダメージ増加', '방어력 비례 데미지', 'Dano escala com DEF', '防御比例伤害') },
    { id: 'damage_spd_scaling', type: 'pro', category: 'damage', translations: t('Damage scales with SPD', 'Daño escala con VEL', '速度でダメージ増加', '속도 비례 데미지', 'Dano escala com VEL', '速度比例伤害') },
    { id: 'damage_target_hp', type: 'pro', category: 'damage', translations: t('Damage scales with enemy HP', 'Daño escala con HP enemigo', '敵HPでダメージ増加', '적 HP 비례 데미지', 'Dano escala com HP inimigo', '敌方HP比例伤害') },
    { id: 'damage_target_atk', type: 'pro', category: 'damage', translations: t('Damage scales with enemy ATK', 'Daño escala con ATK enemigo', '敵攻撃でダメージ増加', '적 공격력 비례 데미지', 'Dano escala com ATK inimigo', '敌方攻击比例伤害') },
    { id: 'max_hp_scaling', type: 'pro', category: 'damage', translations: t('Scales off Max HP', 'Escala con HP Máx', '最大HP比例', '최대 생명력 비례', 'Escala com HP Máx', '最大生命值比例') },
    { id: 'lost_hp_scaling', type: 'pro', category: 'damage', translations: t('Scales off Lost HP', 'Escala con HP Perdida', '失ったHP比例', '잃은 생명력 비례', 'Escala com HP Perdida', '已损生命值比例') },

    // NEW ORPHANS (Fixed)
    { id: 'no_crit_needed', type: 'pro', category: 'stats', translations: t('No Crit Needed', 'No Necesita Crítico', 'クリ不要', '치확 불필요', 'Não Precisa de Crítico', '无需暴击') },
    { id: 'anti_immortality', type: 'pro', category: 'mechanics', translations: t('Anti-Immortality', 'Anti-Inmortalidad', '不死対策', '불사 카운터', 'Anti-Imortalidade', '反不死') },

    // DAMAGE - Mechanics
    { id: 'guaranteed_crit', type: 'pro', category: 'damage', translations: t('Guaranteed Crit', 'Crítico Garantizado', '確定クリティカル', '확정 치명타', 'Crítico Garantido', '必定暴击') },
    { id: 'hit_chance_up', type: 'pro', category: 'damage', translations: t('Increased Hit Chance', 'Aumento Prob. Golpe', '命中率UP', '명중률 증가', 'Aumento Prob. Acerto', '命中率提升') },
    { id: 'cannot_trigger_counter', type: 'pro', category: 'damage', translations: t('Cannot be countered', 'No activa contrataques', '反撃不可', '반격 불가', 'Não ativa contra-ataques', '无法触发反击') },
    { id: 'ignores_dmg_sharing', type: 'pro', category: 'damage', translations: t('Ignores Damage Sharing', 'Ignora Distribución de Daño', 'ダメージ分配無視', '데미지 분배 무시', 'Ignora Distribuição de Dano', '无视伤害分摊') },
    { id: 'ignores_dmg_reduction', type: 'pro', category: 'damage', translations: t('Ignores Damage Reduction', 'Ignora Reducción de Daño', 'ダメージ軽減無視', '데미지 감소 무시', 'Ignora Redução de Dano', '无视伤害减免') },
    { id: 'ignores_er_soulburn', type: 'pro', category: 'damage', translations: t('Ignores ER (Soulburn)', 'Ignora Res (Soulburn)', '抵抗無視 (SB)', '효저 무시 (소울번)', 'Ignora Res (Soulburn)', '无视抗性 (烧魂)') },
    { id: 'ignores_er_skill', type: 'pro', category: 'damage', translations: t('Ignores ER (Always)', 'Ignora Res (Siempre)', '抵抗無視 (常時)', '효저 무시 (상시)', 'Ignora Res (Sempre)', '无视抗性 (常驻)') },
    { id: 'detonates_dots', type: 'pro', category: 'damage', translations: t('Detonates DoTs', 'Detona Sangrado/Quemaduras', '激爆', '격폭 (출혈/화상)', 'Detona DoTs', '激爆') },
    { id: 'splash_damage', type: 'pro', category: 'damage', translations: t('Splash Damage', 'Daño Salpicadura (Splash)', 'スプラッシュダメ', '추가 피해 (스플래시)', 'Dano Splash', '溅射伤害') },
    { id: 'extra_dmg_fixed', type: 'pro', category: 'damage', translations: t('Extra Fixed Damage', 'Daño Fijo Extra', '追加固定ダメージ', '추가 고정 데미지', 'Dano Fixo Extra', '额外固定伤害') },
    { id: 'reflects_damage', type: 'pro', category: 'damage', translations: t('Reflects Damage', 'Refleja Daño', 'ダメージ反射', '데미지 반사', 'Reflete Dano', '反射伤害') },
    { id: 'barrier_inversion', type: 'pro', category: 'damage', translations: t('Barrier Inversion', 'Inversión de Barrera', 'バリア反転', '보호막 반전', 'Inversão de Barreira', '护盾逆转') },
    { id: 'shield_penetration', type: 'pro', category: 'damage', translations: t('Penetrates Shields', 'Penetra Barreras', 'シールド貫通', '보호막 관통', 'Penetra Barreiras', '护盾穿透') },
    { id: 'injury_inflict', type: 'pro', category: 'damage', translations: t('Inflicts Injury', 'Aplica Herida', '負傷付与', '부상 발생', 'Aplica Ferimento', '造成创伤') },
    { id: 'fracture_inflict', type: 'pro', category: 'damage', translations: t('Inflicts Fracture', 'Aplica Fractura', '骨折付与', '골절 발생', 'Aplica Fratura', '造成骨折') },
    { id: 'always_element_advantage', type: 'pro', category: 'damage', translations: t('Advantages vs All Elements', 'Ventaja vs Todos los Elementos', '全属性有利', '모든 속성 우위', 'Vantagem vs Todos Elementos', '全属性克制') },

    // DAMAGE - Type
    { id: 'high_multipliers', type: 'pro', category: 'damage', translations: t('High damage multipliers', 'Multiplicadores de daño altos', '高倍率', '높은 배율', 'Multiplicadores altos', '高倍率') },
    { id: 'aoe_damage', type: 'pro', category: 'damage', translations: t('AoE damage', 'Daño en área (AoE)', '範囲攻撃', '광역 공격', 'Dano em área', '范围伤害') },
    { id: 'single_target_nuke', type: 'pro', category: 'damage', translations: t('Single target nuke', 'Nuke de objetivo único', '単体高火力', '단일 대상 누킹', 'Nuke de alvo único', '单体爆发') },
    { id: 'fixed_damage', type: 'pro', category: 'damage', translations: t('Fixed damage (ignores DEF)', 'Daño fijo (ignora DEF)', '固定ダメージ', '고정 데미지', 'Dano fixo (ignora DEF)', '固定伤害') },
    { id: 'extra_attacks', type: 'pro', category: 'damage', translations: t('Extra attacks', 'Ataques adicionales', '追加攻撃', '추가 공격', 'Ataques extras', '额外攻击') },
    { id: 'dual_attack_synergy', type: 'pro', category: 'damage', translations: t('Dual Attack synergy', 'Sinergia con Dual Attack', '協力攻撃シナジー', '협공 시너지', 'Sinergia com Ataque Duplo', '协同攻击协同') },
    { id: 'unlimited_stacking', type: 'pro', category: 'damage', translations: t('Unlimited stacking', 'Acumulación ilimitada', '無限スタック', '무한 중첩', 'Acumulação ilimitada', '无限叠加') },

    // DAMAGE - Penetration (Consolidated)
    { id: 'def_penetration', type: 'pro', category: 'damage', translations: t('Defense penetration', 'Penetración de defensa', '防御貫通', '방어 관통', 'Penetração de defesa', '防御穿透') },
    { id: 'def_ignore_100', type: 'pro', category: 'damage', translations: t('Ignores defense (100%)', 'Ignora defensa (100%)', '防御無視', '방어 무시', 'Ignora defesa (100%)', '无视防御') },
    { id: 'anti_evasion', type: 'pro', category: 'damage', translations: t('Anti-evasion', 'Anti-evasión', '回避無視', '회피 무시', 'Anti-evasão', '无视闪避') },
    { id: 'elemental_ignore', type: 'pro', category: 'damage', translations: t('Ignores Element', 'Ignora Elemento', '属性無視', '속성 무시', 'Ignora Elemento', '无视属性') },

    // SURVIVABILITY - Defensive
    { id: 'high_base_hp', type: 'pro', category: 'survivability', translations: t('High base HP', 'HP base alta', '高HP', '높은 기본 HP', 'HP base alto', '高基础HP') },
    { id: 'high_base_def', type: 'pro', category: 'survivability', translations: t('High base DEF', 'DEF base alta', '高防御', '높은 기본 방어', 'DEF base alta', '高基础防御') },
    { id: 'damage_reduction', type: 'pro', category: 'survivability', translations: t('Damage reduction', 'Reducción de daño', 'ダメージ軽減', '데미지 감소', 'Redução de dano', '伤害减免') },
    { id: 'damage_share', type: 'pro', category: 'survivability', translations: t('Shares damage with allies', 'Comparte daño con aliados', 'ダメージ分散', '데미지 분산', 'Compartilha dano', '分担伤害') },
    { id: 'self_healing', type: 'pro', category: 'survivability', translations: t('Self healing', 'Se cura a sí mismo', '自己回復', '자가 회복', 'Auto cura', '自我治疗') },
    { id: 'lifesteal_built_in', type: 'pro', category: 'survivability', translations: t('Built-in lifesteal', 'Lifesteal incorporado', '内蔵吸血', '내장 흡혈', 'Roubo de vida embutido', '内置吸血') },
    { id: 'crit_res_buff', type: 'pro', category: 'survivability', translations: t('Critical Hit Resistance', 'Resistencia Crítica', 'クリティカル抵抗', '치명타 저항', 'Resistência Crítica', '暴击抗性') },
    { id: 'anti_crit_bonus', type: 'pro', category: 'survivability', translations: t('Bonus vs Crits', 'Bonus al recibir Crítico', '被クリ時ボーナス', '피격 시 보너스', 'Bônus ao receber Crítico', '受击暴击加成') },
    { id: 'dmg_limit', type: 'pro', category: 'survivability', translations: t('Damage Limit', 'Límite de Daño Máximo', '被ダメージ制限', '최대 데미지 제한', 'Limite de Dano Máximo', '伤害上限') },
    { id: 'elem_neutrality', type: 'pro', category: 'survivability', translations: t('Elemental Neutrality (Defense)', 'Neutralidad Elemental (Def)', '属性不利無視 (防御)', '역속성 무시 (방어)', 'Neutralidade Elemental (Def)', '无视属性 (防御)') },
    { id: 'penetration_resistance', type: 'pro', category: 'survivability', translations: t('Penetration Resistance', 'Resistencia a Penetración', '貫通抵抗', '관통 저항', 'Resistência à Penetração', '穿透抗性') },

    // SURVIVABILITY - Immunity & Buffs
    { id: 'self_immunity', type: 'pro', category: 'survivability', translations: t('Grants self immunity', 'Se otorga inmunidad', '自己免疫付与', '자체 면역 부여', 'Concede auto imunidade', '自我免疫') },
    { id: 'skill_nullifier', type: 'pro', category: 'survivability', translations: t('Grants Skill Nullifier', 'Otorga Skill Nullifier', 'スキル無効化付与', '스킬 무효화 부여', 'Concede Anulação de Skill', '技能无效化') },
    { id: 'imperishable', type: 'pro', category: 'survivability', translations: t('Imperishable (Cannot die)', 'Imperecedero (No muere)', '不滅', '불멸 (죽지 않음)', 'Imperecível (Não morre)', '不灭 (免死)') },
    { id: 'immortality_buff', type: 'pro', category: 'survivability', translations: t('Grants Immortality', 'Otorga Inmortalidad', '不死付与', '불사 부여', 'Concede Imortalidade', '不死') },
    { id: 'invincibility_buff', type: 'pro', category: 'survivability', translations: t('Grants Invincibility', 'Otorga Invencibilidad', '無敵付与', '무적 부여', 'Concede Invencibilidade', '无敌') },
    { id: 'stealth_buff', type: 'pro', category: 'survivability', translations: t('Grants Stealth', 'Otorga Sigilo', 'ステルス付与', '은신 부여', 'Concede Furtividade', '隐身') },
    { id: 'stealth_permanent', type: 'pro', category: 'survivability', translations: t('Permanent Stealth', 'Sigilo Permanente', '常時ステルス', '영구 은신', 'Furtividade Permanente', '永久隐身') },
    { id: 'evasion_buff', type: 'pro', category: 'survivability', translations: t('High Evasion', 'Alta Evasión', '高回避', '높은 회피', 'Alta Evasão', '高闪避') },
    { id: 'barrier_thick', type: 'pro', category: 'survivability', translations: t('Thick Barrier', 'Barrera Gruesa', '高耐久バリア', '두꺼운 보호막', 'Barreira Espessa', '厚护盾') },
    { id: 'perception_buff', type: 'pro', category: 'survivability', translations: t('Perception (Hit/Crit)', 'Percepción (Golpe/Crit)', '看破', '간파 (명중/치명)', 'Percepção (Acerto/Crit)', '识破 (命中/暴击)') },

    // SURVIVABILITY - Revive
    { id: 'revive_ally', type: 'pro', category: 'survivability', translations: t('Can revive allies', 'Puede revivir aliados', '味方蘇生可能', '아군 부활 가능', 'Pode reviver aliados', '可复活队友') },
    { id: 'self_revive', type: 'pro', category: 'survivability', translations: t('Self revive', 'Se revive a sí mismo', '自己蘇生', '자가 부활', 'Auto revive', '自我复活') },
    { id: 'revive_buffs', type: 'pro', category: 'survivability', translations: t('Revives with Buffs', 'Revive con Buffs', 'バフ付き蘇生', '버프와 함께 부활', 'Revive com Buffs', '复活带增益') },

    // CONTROL
    { id: 'stun', type: 'pro', category: 'control', translations: t('Inflicts Stun', 'Inflige Aturdir', 'スタン付与', '기절 부여', 'Inflige Atordoamento', '眩晕') },
    { id: 'sleep', type: 'pro', category: 'control', translations: t('Inflicts Sleep', 'Inflige Sueño', '睡眠付与', '수면 부여', 'Inflige Sono', '睡眠') },
    { id: 'silence', type: 'pro', category: 'control', translations: t('Inflicts Silence', 'Inflige Silencio', '沈黙付与', '침묵 부여', 'Inflige Silêncio', '沉默') },
    { id: 'provoke', type: 'pro', category: 'control', translations: t('Inflicts Provoke', 'Inflige Provocar', '挑発付与', '도발 부여', 'Inflige Provocação', '嘲讽') },
    { id: 'redirect_provoke', type: 'pro', category: 'control', translations: t('Redirected Provoke', 'Provocar Redirigido', '指定挑発', '지정 도발', 'Provocação Redirecionada', '指定挑衅') },
    { id: 'restrict', type: 'pro', category: 'control', translations: t('Inflicts Restrict', 'Inflige Restringir', '拘束付与', '구속 부여', 'Inflige Restrição', '禁锢') },
    { id: 'def_break', type: 'pro', category: 'control', translations: t('Defense Break', 'Rompe Defensa', '防御ダウン', '방어력 감소', 'Quebra de Defesa', '防御下降') },
    { id: 'target_debuff', type: 'pro', category: 'control', translations: t('Inflicts Target', 'Inflige Objetivo', 'ターゲット付与', '타겟 부여', 'Inflige Alvo', '目标') },
    { id: 'decrease_speed', type: 'pro', category: 'control', translations: t('Decreases Speed', 'Reduce Velocidad', '速度ダウン', '속도 감소', 'Reduz Velocidade', '速度下降') },
    { id: 'decrease_atk', type: 'pro', category: 'control', translations: t('Decreases Attack', 'Reduce Ataque', '攻撃ダウン', '공격력 감소', 'Reduz Ataque', '攻击下降') },
    { id: 'unhealable', type: 'pro', category: 'control', translations: t('Inflicts Unhealable', 'Inflige Incurable', '回復不能付与', '회복 불가 부여', 'Inflige Incurável', '无法治愈') },
    { id: 'unbuffable', type: 'pro', category: 'control', translations: t('Inflicts Unbuffable', 'Inflige Anti-Buff', '強化不可付与', '강불 부여', 'Inflige Anti-Buff', '无法强化') },
    { id: 'strip_buffs', type: 'pro', category: 'control', translations: t('Strips/Dispels', 'Quita/Disipa Buffs', 'バフ解除', '버프 해제', 'Remove Buffs', '驱散增益') },
    { id: 'extinction', type: 'pro', category: 'control', translations: t('Inflicts Extinction', 'Inflige Extinción', '消滅付与', '소멸 부여', 'Inflige Extinção', '湮灭') },
    { id: 'seal_debuff', type: 'pro', category: 'control', translations: t('Inflicts Seal', 'Inflige Sello', '封印付与', '봉인 부여', 'Inflige Selo', '封印') },
    { id: 'blind', type: 'pro', category: 'control', translations: t('Inflicts Blind', 'Inflige Ceguera', '命中ダウン', '명중 감소', 'Inflige Cegueira', '致盲') },
    { id: 'cooldown_increase', type: 'pro', category: 'control', translations: t('Increases Cooldowns', 'Aumenta Enfriamientos', 'クールダウン増加', '재사용 대기시간 증가', 'Aumenta Tempos de Recarga', '增加冷却') },
    { id: 'cd_reset_enemy', type: 'pro', category: 'control', translations: t('Resets Enemy Cooldowns', 'Resetea CD Enemigo', '敵CDリセット', '적 쿨타임 초기화', 'Reseta CD Inimigo', '重置敌方冷却') },
    { id: 'resource_reduction', type: 'pro', category: 'control', translations: t('Reduces Souls/Focus', 'Reduce Almas/Foco', 'リソース減少', '자원 감소 (소울/집중)', 'Reduz Almas/Foco', '削减资源') },
    { id: 'buff_steal', type: 'pro', category: 'control', translations: t('Steals Buffs', 'Roba Buffs', 'バフ奪取', '버프 강탈', 'Rouba Buffs', '偷取增益') },
    { id: 'buff_duration_reduce', type: 'pro', category: 'control', translations: t('Reduces Buff Duration', 'Reduce Duración Buffs', 'バフ短縮', '버프 턴 감소', 'Reduz Duração Buffs', '减少增益回合') },
    { id: 'debuff_extension', type: 'pro', category: 'control', translations: t('Extends Debuffs', 'Extiende Debuffs', 'デバフ延長', '디버프 연장', 'Estende Debuffs', '延长减益') },
    { id: 'debuff_transfer', type: 'pro', category: 'control', translations: t('Transfers Debuffs', 'Transfiere Debuffs', 'デバフ転嫁', '디버프 전이', 'Transfere Debuffs', '转移减益') },
    { id: 'venom_inflict', type: 'pro', category: 'control', translations: t('Inflicts Venom', 'Inflige Veneno', '猛毒付与', '맹독 부여', 'Inflige Veneno', '剧毒') },
    { id: 'vampiric_touch', type: 'pro', category: 'control', translations: t('Vampiric Touch', 'Toque Vampírico', '吸血の手', '흡혈의 손길', 'Toque Vampírico', '吸血鬼之触') },

    // IMMUNITIES (Self)
    { id: 'immune_stun', type: 'pro', category: 'survivability', translations: t('Immune to Stun', 'Inmune a Aturdimiento', 'スタン免疫', '기절 면역', 'Imune a Atordoamento', '免疫眩晕') },
    { id: 'immune_sleep', type: 'pro', category: 'survivability', translations: t('Immune to Sleep', 'Inmune a Sueño', '睡眠免疫', '수면 면역', 'Imune a Sono', '免疫睡眠') },
    { id: 'immune_provoke', type: 'pro', category: 'survivability', translations: t('Immune to Provoke', 'Inmune a Provocar', '挑発免疫', '도발 면역', 'Imune a Provocação', '免疫嘲讽') },
    { id: 'immune_silence', type: 'pro', category: 'survivability', translations: t('Immune to Silence', 'Inmune a Silencio', '沈黙免疫', '침묵 면역', 'Imune a Silêncio', '免疫沉默') },
    { id: 'immune_pushback', type: 'pro', category: 'survivability', translations: t('Immune to CR Pushback', 'Inmune a Reducción CR', 'ゲージダウン免疫', '행동게이지 감소 면역', 'Imune a Redução CR', '免疫推条') },
    { id: 'immune_unbuffable', type: 'pro', category: 'survivability', translations: t('Immune to Unbuffable', 'Inmune a Anti-Buff', '強化不可免疫', '강불 면역', 'Imune a Anti-Buff', '免疫无法强化') },

    // SPEED
    { id: 'high_base_speed', type: 'pro', category: 'speed', translations: t('High base speed (120+)', 'Velocidad base alta (120+)', '高速度(120+)', '높은 기본 속도 (120+)', 'Velocidade base alta (120+)', '高基础速度(120+)') },
    { id: 'speed_super', type: 'pro', category: 'speed', translations: t('Super Fast (128+)', 'Súper Rápido (128+)', '超高速(128+)', '초고속 (128+)', 'Super Rápido (128+)', '极速 (128+)') },
    { id: 'self_cr_push', type: 'pro', category: 'speed', translations: t('Self CR Push', 'Auto-Push CR', '自己ゲージUP', '자가 행게증', 'Auto-Push CR', '自拉条') },
    { id: 'team_cr_push', type: 'pro', category: 'speed', translations: t('Team CR Push', 'Push CR Equipo', '味方ゲージUP', '아군 행게증', 'Push CR Equipe', '全队拉条') },
    { id: 'enemy_cr_decrease', type: 'pro', category: 'speed', translations: t('Enemy CR Decrease', 'Reduce CR Enemigo', '敵ゲージDOWN', '적 행게감', 'Reduz CR Inimigo', '推条') },
    { id: 'extra_turn', type: 'pro', category: 'speed', translations: t('Extra Turn', 'Turno Extra', '追加ターン', '추가 턴', 'Turno Extra', '额外回合') },
    { id: 'extra_turn_on_kill', type: 'pro', category: 'speed', translations: t('Extra Turn on Kill', 'Turno Extra al Matar', '撃破時追加ターン', '처치 시 추가 턴', 'Turno Extra ao Matar', '击杀追加回合') },
    { id: 'speed_buff_team', type: 'pro', category: 'speed', translations: t('Team Speed Buff', 'Buff Velocidad Equipo', 'チーム速度バフ', '팀 속도 버프', 'Buff Velocidade Equipe', '全队加速') },

    // UTILITY - Support & Buffs
    { id: 'atk_buff', type: 'pro', category: 'utility', translations: t('ATK Buff', 'Buff de ATK', '攻撃バフ', '공격력 버프', 'Buff de ATK', '攻击增益') },
    { id: 'greater_atk_buff', type: 'pro', category: 'utility', translations: t('Greater ATK Buff', 'Buff de ATK Mayor', '大攻撃バフ', '대형 공격력 버프', 'Buff de ATK Maior', '大攻击增益') },
    { id: 'def_buff', type: 'pro', category: 'utility', translations: t('DEF Buff', 'Buff de DEF', '防御バフ', '방어력 버프', 'Buff de DEF', '防御增益') },
    { id: 'crit_buff', type: 'pro', category: 'utility', translations: t('Crit Chance Buff', 'Buff de Crítico', 'クリバフ', '치명타 버프', 'Buff de Crítico', '暴击增益') },
    { id: 'crit_dmg_buff', type: 'pro', category: 'utility', translations: t('Crit Dmg Buff', 'Buff de Daño Crítico', 'クリダメバフ', '치피 버프', 'Buff de Dano Crítico', '爆伤增益') },
    { id: 'immunity_buff_team', type: 'pro', category: 'utility', translations: t('Team Immunity', 'Inmunidad de Equipo', 'チーム免疫', '팀 면역', 'Imunidade de Equipe', '全队免疫') },
    { id: 'vigor_buff', type: 'pro', category: 'utility', translations: t('Vigor Buff', 'Buff Vigor', '覇気', '패기', 'Buff Vigor', '魄力') },
    { id: 'enrage_buff', type: 'pro', category: 'utility', translations: t('Enrage Buff', 'Buff Rabia', '激怒', '격분', 'Buff Raiva', '激怒') },
    { id: 'team_healer', type: 'pro', category: 'utility', translations: t('Team Healer', 'Curador de Equipo', 'チームヒーラー', '팀 힐러', 'Curador de Equipe', '群奶') },
    { id: 'full_cleanse', type: 'pro', category: 'utility', translations: t('Full Team Cleanse', 'Limpieza Total Equipo', '全体解除', '전체 해제', 'Limpeza Total Equipe', '群体驱散') },
    { id: 'reviver', type: 'pro', category: 'utility', translations: t('Reviver', 'Revividor', '蘇生役', '부활러', 'Revividor', '复活') },
    { id: 'cd_reduction_team', type: 'pro', category: 'utility', translations: t('Reduces Team Cooldowns', 'Reduce CD Equipo', '味方CD短縮', '아군 쿨감', 'Reduz CD Equipe', '全队减CD') },

    // MECHANICS (New & Consolidated)
    { id: 'passive_seal_mechanic', type: 'pro', category: 'mechanics', translations: t('Passive Sealer', 'Sella Pasivas', 'パッシブ封印', '패시브 봉인', 'Sela Passivas', '被动封印') },
    { id: 'counter_punisher', type: 'pro', category: 'mechanics', translations: t('Punishes Counters', 'Castiga Contraataques', '反撃に反応', '반격 반응/불가', 'Pune Contra-ataques', '反制反击') },
    { id: 'extra_turn_punisher', type: 'pro', category: 'mechanics', translations: t('Punishes Extra Turns', 'Castiga Turnos Extra', '追加ターンに反応', '추가 턴 반응', 'Pune Turnos Extras', '反制追加回合') },
    { id: 'non_attack_punisher', type: 'pro', category: 'mechanics', translations: t('Punishes Non-Attack', 'Castiga Habilidades No Agresivas', '非攻撃スキルに反応', '비타격 스킬 반응', 'Pune Skills Não-Ofensivas', '反制非攻击技能') },
    { id: 'stealth_mechanic', type: 'pro', category: 'mechanics', translations: t('Stealth User', 'Usuario de Sigilo', '潜伏使用者', '은신 사용', 'Usuário de Furtividade', '隐身角色') },
    { id: 'restrict_mechanic', type: 'pro', category: 'mechanics', translations: t('Restrict User', 'Usuario de Restricción', '拘束使用者', '속박 사용', 'Usuário de Restrição', '束缚角色') },
    { id: 'fixed_damage_mechanic', type: 'pro', category: 'mechanics', translations: t('Fixed Damage Dealer', 'Dealer Daño Fijo', '固定ダメ', '고정 데미지 딜러', 'Dealer Dano Fixo', '固伤角色') },
    { id: 'cascade_effect', type: 'pro', category: 'mechanics', translations: t('Cascade Effect', 'Efecto Cascada', 'カスケード', '연쇄 효과', 'Efeito Cascata', '连锁效应') },
    { id: 'fighting_spirit', type: 'pro', category: 'mechanics', translations: t('Uses Fighting Spirit', 'Usa Espíritu de Lucha', '闘志使用', '투지 사용', 'Usa Espírito de Luta', '斗志角色') },
    { id: 'focus_mechanic', type: 'pro', category: 'mechanics', translations: t('Uses Focus', 'Usa Foco', '集中使用', '집중 사용', 'Usa Foco', '专注角色') },

    // META 2025/2026
    { id: 'rta_god_tier', type: 'pro', category: 'meta', translations: t('God Tier (RTA)', 'God Tier (RTA)', 'RTA神ティア', 'RTA 0티어', 'God Tier (RTA)', 'RTA T0') },
    { id: 'meta_opener', type: 'pro', category: 'meta', translations: t('Meta Opener', 'Opener Meta', 'メタ・オープナー', '메타 선턴잡이', 'Opener Meta', '主流先手') },
    { id: 'meta_anchor', type: 'pro', category: 'meta', translations: t('Meta Anchor', 'Anchor Meta', 'メタ・アンカー', '메타 앵커', 'Anchor Meta', '主流大C') },
    { id: 'anti_cleave', type: 'pro', category: 'meta', translations: t('Anti-Cleave', 'Anti-Cleave', 'アンチクリーブ', '안티 클리브', 'Anti-Cleave', '反核爆') },
    { id: 'aggro_carry', type: 'pro', category: 'meta', translations: t('Aggro Carry', 'Carry Aggro', 'アグロキャリー', '어그로 캐리', 'Carry Aggro', '快攻核心') },
    { id: 'standard_carry', type: 'pro', category: 'meta', translations: t('Standard Carry', 'Carry Standard', 'スタンダード', '스탠다드 캐리', 'Carry Standard', '阵地核心') },
    { id: 'draft_exodia', type: 'pro', category: 'meta', translations: t('Exodia Piece', 'Pieza de Exodia', 'エクゾディアパーツ', '엑조디아 파츠', 'Peça de Exodia', 'Exodia组件') },
    { id: 'budget_king', type: 'pro', category: 'meta', translations: t('Budget King', 'Rey F2P', '無課金の星', '가성비 킹', 'Rei F2P', '平民战神') },
    { id: 'gw_defense_meta', type: 'pro', category: 'meta', translations: t('GW Defense Meta', 'Meta Defensa GW', 'ギルド防衛メタ', '기사단 방덱 메타', 'Meta Defesa GW', '团战防守毒瘤') },
    { id: 'nightmare_raid_core', type: 'pro', category: 'meta', translations: t('Nightmare Raid Core', 'Core Laberinto Pesadilla', '悪夢迷宮コア', '악몽 미궁 핵심', 'Core Labirinto Pesadelo', '噩梦迷宫核心') },
    { id: 'abyss_vip', type: 'pro', category: 'meta', translations: t('Abyss VIP', 'VIP del Abismo', '深淵VIP', '심연 VIP', 'VIP do Abismo', '深渊VIP') },
    { id: 'rift_mvp', type: 'pro', category: 'meta', translations: t('Rift MVP', 'MVP de Grieta', '亀裂MVP', '균열 MVP', 'MVP da Fenda', '裂缝MVP') },

    // STATS & SETS
    { id: 'easy_gear', type: 'pro', category: 'stats', translations: t('Easy to Gear', 'Fácil de Equipar', '装備難易度低', '장비 쉬움', 'Fácil de Equipar', '装备要求低') },
    { id: 'flexible_build', type: 'pro', category: 'stats', translations: t('Flexible Builds', 'Builds Flexibles', 'ビルド柔軟', '유연한 세팅', 'Builds Flexíveis', '配装灵活') },
    { id: 'counter_set_best', type: 'pro', category: 'stats', translations: t('Best on Counter Set', 'Mejor con Set Contraataque', '反撃セット推奨', '반격셋 추천', 'Melhor com Set Contra-ataque', '推荐反击套') },
    { id: 'lifesteal_set_best', type: 'pro', category: 'stats', translations: t('Best on Lifesteal Set', 'Mejor con Set Robo Vida', '吸血セット推奨', '흡혈셋 추천', 'Melhor com Set Roubo Vida', '推荐吸血套') },
    { id: 'speed_set_best', type: 'pro', category: 'stats', translations: t('Best on Speed Set', 'Mejor con Set Velocidad', '速度セット推奨', '속도셋 추천', 'Melhor com Set Velocidade', '推荐速度套') },
    { id: 'rage_set_best', type: 'pro', category: 'stats', translations: t('Best on Rage Set', 'Mejor con Set Ira', '激怒セット推奨', '분노셋 추천', 'Melhor com Set Ira', '推荐愤怒套') },
    { id: 'torrent_set_best', type: 'pro', category: 'stats', translations: t('Best on Torrent Set', 'Mejor con Set Torrente', '激流セット推奨', '격류셋 추천', 'Melhor com Set Torrente', '推荐激流套') },
    { id: 'protection_set_best', type: 'pro', category: 'stats', translations: t('Best on Protection Set', 'Mejor con Set Protección', '保護セット推奨', '보호셋 추천', 'Melhor com Set Proteção', '推荐保护套') },
    // MORE MECHANICS & BUFFS (Expansion Phase 2)
    { id: 'curse_debuff', type: 'pro', category: 'damage', translations: t('Inflicts Curse', 'Inflige Maldición', '呪い付与', '저주 부여', 'Inflige Maldição', '造成诅咒') },
    { id: 'stigma_debuff', type: 'pro', category: 'control', translations: t('Inflicts Stigma', 'Inflige Estigma', '烙印付与', '낙인 부여', 'Inflige Estigma', '造成烙印') },
    { id: 'fear_debuff', type: 'pro', category: 'control', translations: t('Inflicts Fear', 'Inflige Miedo', '恐怖付与', '공포 부여', 'Inflige Medo', '造成恐惧') },
    { id: 'bind_debuff', type: 'pro', category: 'control', translations: t('Inflicts Bind', 'Inflige Atadura', '束縛付与', '속박 부여', 'Inflige Amarra', '造成束缚') },
    { id: 'frostbite', type: 'pro', category: 'damage', translations: t('Inflicts Frostbite', 'Inflige Congelación', '凍傷付与', '동상 부여', 'Inflige Congelamento', '造成冻伤') },
    { id: 'electric_shock', type: 'pro', category: 'damage', translations: t('Inflicts Shock', 'Inflige Electroshock', '感電付与', '감전 부여', 'Inflige Choque', '造成感电') },
    { id: 'stealth_detection', type: 'pro', category: 'mechanics', translations: t('Detects Stealth', 'Detecta Sigilo', 'ステルス看破', '은신 감지', 'Detecta Furtividade', '看破隐身') },
    { id: 'reflect_buff', type: 'pro', category: 'utility', translations: t('Reflect Buff', 'Buff Reflejo', '反射バフ', '반사 버프', 'Buff Reflexo', '反射增益') },
    { id: 'revive_prevention', type: 'pro', category: 'mechanics', translations: t('Extinction (Anti-Revive)', 'Extinción (Anti-Revive)', '消滅', '소멸', 'Extinção (Anti-Revive)', '灭亡 (无法复活)') },
    { id: 'ignore_effect_res', type: 'pro', category: 'mechanics', translations: t('Ignore Effect Res', 'Ignora Resistencia', '効果抵抗無視', '효저 무시', 'Ignora Resistência', '无视抗性') },

    // MORE META ROLES
    { id: 'pivot_pick', type: 'pro', category: 'meta', translations: t('Pivot Pick', 'Pick Pivote', 'ピボット', '전환 픽 (Pivot)', 'Pick Pivô', '摇摆位') },
    { id: 'force_ban_rta', type: 'pro', category: 'meta', translations: t('Must Ban (RTA)', 'Must Ban (RTA)', 'RTA必須BAN', 'RTA 필밴', 'Must Ban (RTA)', 'RTA必Ban') },
    { id: 'matchup_flipper', type: 'pro', category: 'meta', translations: t('Matchup Flipper', 'Voltea Partidas', '逆転要素', '판 뒤집기', 'Vira Jogo', '翻盘点') },
    { id: 'pocket_pick', type: 'pro', category: 'meta', translations: t('Pocket Pick', 'Pick de Bolsillo', 'ポケットピック', '깜짝 픽', 'Pick de Bolso', '口袋奇兵') },
    { id: 'draft_finisher', type: 'pro', category: 'meta', translations: t('Draft Finisher', 'Draft Finisher', 'ドラフトフィニッシャー', '밴픽 마무리', 'Finalizador de Draft', 'BP终结者') },

    // NEW META 2026 PROS
    { id: 'anti_opener', type: 'pro', category: 'meta', translations: t('Anti-Opener', 'Anti-Opener', 'アンチオープナー', '선턴잡이 카운터', 'Anti-Opener', '反先手') },
    { id: 'rift_specialist', type: 'pro', category: 'pve', translations: t('Rift Specialist', 'Especialista en Grieta', '亀裂スペシャリスト', '균열 전문가', 'Especialista em Fenda', '裂缝专家') },
    { id: 'harid_tier', type: 'pro', category: 'meta', translations: t('Harid Tier (Late Game)', 'Tier Harid (Late Game)', 'ハリドティア', '하리드 티어', 'Tier Harid', '后期战神') },
    { id: 'draft_flexible', type: 'pro', category: 'meta', translations: t('Draft Flexible', 'Flexible en Draft', 'ドラフト柔軟', '밴픽 유연함', 'Flexível no Draft', 'BP灵活') },

    // SYNERGIES
    { id: 'synergy_aoe', type: 'pro', category: 'mechanics', translations: t('Synergizes with AoE', 'Sinergia con AoE', '全体攻撃シナジー', '광역 시너지', 'Sinergia com AoE', 'AOE协同') },
    { id: 'synergy_non_attack', type: 'pro', category: 'mechanics', translations: t('Synergizes with Non-Attack', 'Sinergia con Skills No Ofensivas', '非攻撃スキルシナジー', '비타격 시너지', 'Sinergia com Skills Não-Ofensivas', '非攻击技能协同') },

    // NEW BUFFS
    { id: 'buff_speed', type: 'pro', category: 'speed', translations: t('Speed Up', 'Aumento de Velocidad', '速度UP', '속도 증가', 'Aumento de Velocidade', '速度增加') },
    { id: 'buff_continuous_healing', type: 'pro', category: 'survivability', translations: t('Continuous Healing', 'Curación Continua', '継続回復', '지속 회복', 'Cura Contínua', '持续恢复') },
    { id: 'buff_reflect', type: 'pro', category: 'damage', translations: t('Reflect', 'Reflejo', '反射', '반사', 'Reflexo', '反射') },
    { id: 'buff_barrier', type: 'pro', category: 'survivability', translations: t('Barrier', 'Barrera', 'シールド', '보호막', 'Barreira', '防护罩') },
    { id: 'buff_revive', type: 'pro', category: 'survivability', translations: t('Revive Buff', 'Buff de Revivir', '蘇生バフ', '부활 버프', 'Buff de Reviver', '复活增益') },
    { id: 'buff_cascade', type: 'pro', category: 'mechanics', translations: t('Cascade', 'Cascada', 'カスケード', '연쇄', 'Cascata', '连锁') },
    { id: 'buff_rage', type: 'pro', category: 'damage', translations: t('Rage', 'Ira', '怒り', '분노', 'Ira', '愤怒') },
    { id: 'buff_possession', type: 'pro', category: 'mechanics', translations: t('Possession', 'Posesión', '憑依', '빙의', 'Possessão', '附身') },
    { id: 'buff_insight', type: 'pro', category: 'utility', translations: t('Insight', 'Perspicacia', '洞察', '통찰', 'Perspicácia', '洞察') },

    // NEW BUFFS (2026 Expansion)
    { id: 'buff_greater_def', type: 'pro', category: 'utility', translations: t('Greater Defense', 'Mayor Defensa', '防御力大幅UP', '방어력 대폭 증가', 'Maior Defesa', '防御大幅提升') },
    { id: 'buff_evasion_team', type: 'pro', category: 'utility', translations: t('Team Evasion', 'Evasión en Equipo', 'チーム回避', '팀 회피', 'Evasão em Equipe', '群体闪避') },
    { id: 'buff_crit_resist_team', type: 'pro', category: 'utility', translations: t('Team Crit Resist', 'Resist. Crit Equipo', 'チームクリ抵抗', '팀 치명타 저항', 'Resist. Crit Equipe', '群体暴击抗性') },
    { id: 'buff_revive_auto', type: 'pro', category: 'survivability', translations: t('Auto-Revive Buff', 'Buff Auto-Revivir', '自動蘇生', '자동 부활', 'Buff Auto-Reviver', '自动复活') },

    // SPECIAL EFFECTS
    { id: 'effect_escort', type: 'pro', category: 'survivability', translations: t('Escort', 'Escolta', '護衛', '호위', 'Escolta', '护卫') },
    { id: 'effect_mine', type: 'pro', category: 'damage', translations: t('Plant Mine', 'Planta Mina', '爆弾設置', '지뢰 설치', 'Mina', '埋雷') },
    { id: 'effect_magic_nail', type: 'pro', category: 'damage', translations: t('Magic Nail', 'Clavo Mágico', '魔法釘', '마법 못', 'Prego Mágico', '魔法钉') },

    // NEW DEBUFFS
    { id: 'debuff_burn', type: 'pro', category: 'damage', translations: t('Burn', 'Quemadura', '火傷', '화상', 'Queimadura', '烧伤') },
    { id: 'debuff_bleed', type: 'pro', category: 'damage', translations: t('Bleed', 'Sangrado', '出血', '출혈', 'Sangramento', '流血') },
    { id: 'debuff_poison', type: 'pro', category: 'damage', translations: t('Poison', 'Veneno', '毒', '중독', 'Veneno', '中毒') },
    { id: 'debuff_bomb', type: 'pro', category: 'damage', translations: t('Bomb', 'Bomba', '爆弾', '폭탄', 'Bomba', '炸弹') },
    { id: 'debuff_venom', type: 'pro', category: 'damage', translations: t('Venom', 'Toxina', '猛毒', '맹독', 'Toxina', '剧毒') },
    { id: 'debuff_stigma', type: 'pro', category: 'control', translations: t('Stigma', 'Estigma', '烙印', '낙인', 'Estigma', '烙印') },
    { id: 'debuff_curse', type: 'pro', category: 'damage', translations: t('Curse', 'Maldición', '呪い', '저주', 'Maldição', '诅咒') },
    { id: 'debuff_bind', type: 'pro', category: 'control', translations: t('Bind', 'Atadura', '束縛', '속박', 'Atadura', '束缚') },
    { id: 'debuff_beguile', type: 'pro', category: 'control', translations: t('Beguile', 'Seducción', '誘惑', '현혹', 'Sedução', '迷惑') },
    { id: 'debuff_vampiric', type: 'pro', category: 'damage', translations: t('Vampiric Touch', 'Toque Vampírico', '吸血の手', '흡혈의 손길', 'Toque Vampírico', '吸血鬼之触') },
    { id: 'debuff_share', type: 'pro', category: 'damage', translations: t('Share Damage', 'Compartir Daño', 'ダメージ分配', '피해 분담', 'Compartilhar Dano', '分担伤害') },
    { id: 'debuff_frostbite', type: 'pro', category: 'damage', translations: t('Frostbite', 'Congelación', '凍傷', '동상', 'Congelamento', '冻伤') },
    { id: 'debuff_fear', type: 'pro', category: 'control', translations: t('Fear', 'Miedo', '恐怖', '공포', 'Medo', '恐惧') },

    // NEW DEBUFFS (2026 Expansion)
    { id: 'debuff_block', type: 'pro', category: 'control', translations: t('Block', 'Bloqueo', 'ブロック', '차단', 'Bloqueio', '封锁') },
    { id: 'debuff_trauma', type: 'pro', category: 'damage', translations: t('Trauma', 'Trauma', 'トラウマ', '트라우마', 'Trauma', '创伤') },
    { id: 'debuff_decrease_crit_chance', type: 'pro', category: 'control', translations: t('Decr. Crit Chance', 'Red. Prob. Crítico', 'クリ率ダウン', '치명타 확률 감소', 'Red. Chance Crítica', '暴击率降低') },
    { id: 'debuff_decrease_crit_dmg', type: 'pro', category: 'control', translations: t('Decr. Crit Dmg', 'Red. Daño Crítico', 'クリダメダウン', '치명타 피해 감소', 'Red. Dano Crítico', '暴击伤害降低') },
    { id: 'debuff_confuse', type: 'pro', category: 'control', translations: t('Confusion', 'Confusión', '混乱', '혼란', 'Confusão', '混乱') },

    // MECHANICS (Advanced)
    { id: 'mech_reset_cooldown', type: 'pro', category: 'utility', translations: t('Reset Cooldown', 'Resetea CD', 'CDリセット', '쿨타임 초기화', 'Reseta CD', '重置冷却') },
    { id: 'mech_dispel_debuff', type: 'pro', category: 'utility', translations: t('Dispel Debuffs', 'Disipa Debuffs', 'デバフ解除', '디버프 해제', 'Disipa Debuffs', '驱散减益') },

    // NEW META
    { id: 'meta_aggro', type: 'pro', category: 'meta', translations: t('Aggro', 'Aggro', 'アグロ', '어그로', 'Aggro', '快攻') },
    { id: 'meta_cleave', type: 'pro', category: 'meta', translations: t('Cleave', 'Cleave', 'クリーブ', '속공', 'Cleave', '核爆') },
    { id: 'meta_control', type: 'pro', category: 'meta', translations: t('Control', 'Control', 'コントロール', '컨트롤', 'Control', '控制') },
    { id: 'meta_antitank', type: 'pro', category: 'meta', translations: t('Anti-Tank', 'Anti-Tanque', 'アンチタンク', '탱커 카운터', 'Anti-Tanque', '反肉盾') },
    { id: 'meta_anticontrol', type: 'pro', category: 'meta', translations: t('Anti-Control', 'Anti-Control', 'アンチコントロール', '컨트롤 카운터', 'Anti-Controle', '反控制') },

    // ADDITIONAL BUFFS & MECHS (Final Expansion)
    { id: 'buff_hit_chance', type: 'pro', category: 'utility', translations: t('Hit Chance Up', 'Aumento Prob. Golpe', '命中率UP', '명중률 증가', 'Aumento Prob. Acerto', '命中率提升') },
    { id: 'buff_counter', type: 'pro', category: 'damage', translations: t('Counterattack Buff', 'Buff Contraataque', '反撃バフ', '반격 버프', 'Buff Contra-ataque', '反击增益') },
    { id: 'mech_always_crit', type: 'pro', category: 'damage', translations: t('Always Crits', 'Siempre Crítico', '常時クリティカル', '항상 치명타', 'Sempre Crítico', '必定暴击') },
    { id: 'mech_never_crit', type: 'pro', category: 'stats', translations: t('Cannot Crit', 'No puede Criticar', 'クリティカル不可', '치명타 불가', 'Não pode Critar', '无法暴击') },
    { id: 'mech_start_stealth', type: 'pro', category: 'survivability', translations: t('Starts in Stealth', 'Inicia con Sigilo', '開幕隠れ身', '시작 시 은신', 'Inicia com Furtividade', '开局隐身') },
    { id: 'mech_start_barrier', type: 'pro', category: 'survivability', translations: t('Starts with Barrier', 'Inicia con Barrera', '開幕シールド', '시작 시 보호막', 'Inicia com Barreira', '开局护盾') },
    { id: 'mech_start_immunity', type: 'pro', category: 'survivability', translations: t('Starts with Immunity', 'Inicia con Inmunidad', '開幕免疫', '시작 시 면역', 'Inicia com Imunidade', '开局免疫') },
    { id: 'synergy_elbris', type: 'pro', category: 'stats', translations: t('Elbris Synergy', 'Sinergia Elbris', 'エルブリス相性', '엘브리스 시너지', 'Sinergia Elbris', '大宝剑协同') },
    { id: 'synergy_dual', type: 'pro', category: 'mechanics', translations: t('Dual Atk Synergy', 'Sinergia Dual', '連携相性', '협공 시너지', 'Sinergia Dual', '夹攻协同') },

    // NEW MECHANICS & DAMAGE TYPES (2026 Expansion)
    { id: 'mech_crushing_hit', type: 'pro', category: 'damage', translations: t('Crushing Hit', 'Golpe Aplastante', '壊滅打撃', '분쇄', 'Golpe Esmagador', '粉碎') },
    { id: 'mech_execution', type: 'pro', category: 'damage', translations: t('Execution', 'Ejecución', '処刑', '처형', 'Execução', '处决') },
    { id: 'damage_collision', type: 'pro', category: 'damage', translations: t('Collision Damage', 'Daño Colisión', '衝突ダメージ', '충돌 피해', 'Dano Colisão', '碰撞伤害') },
    { id: 'mech_zone_effect', type: 'pro', category: 'mechanics', translations: t('Zone Effect', 'Efecto de Zona', '領域展開', '영역 전개', 'Efeito de Zona', '领域效果') },
    { id: 'mech_undispellable', type: 'pro', category: 'mechanics', translations: t('Undispellable', 'Indisipable', '解除不可', '해제 불가', 'Indissipável', '无法驱散') },
    { id: 'mech_ignore_dmg_limit', type: 'pro', category: 'damage', translations: t('Ignores Dmg Limit', 'Ignora Lím. Daño', 'ダメ制限無視', '피해량 제한 무시', 'Ignora Lim. Dano', '无视伤害上限') },
    { id: 'mech_resource_block', type: 'pro', category: 'control', translations: t('Resource Block', 'Bloqueo Recursos', 'リソース封印', '자원 차단', 'Bloqueio Recursos', '资源封锁') },

    // NEW ERA 2026 — Mechanics & Buffs
    { id: 'grants_radiance', type: 'pro', category: 'survivability', translations: t('Grants Radiance', 'Otorga Radiancia', '輝き付与', '광휘 부여', 'Concede Radiância', '赋予光辉') },
    { id: 'grants_ignore_sharing', type: 'pro', category: 'utility', translations: t('Grants Team Ignore Sharing', 'Equipo Ignora Distribución', 'チーム分配無視付与', '팀 분배 무시 부여', 'Equipe Ignora Distribuição', '赋予团队忽视分摊') },
    { id: 'dispels_immortality', type: 'pro', category: 'mechanics', translations: t('Dispels Immortality', 'Disipa Inmortalidad (ignora Res)', '不死解除 (抵抗無視)', '불사 해제 (효저 무시)', 'Disipa Imortalidade (ignora Res)', '驱散不死 (无视抗性)') },
    { id: 'anti_damage_share', type: 'pro', category: 'mechanics', translations: t('Counters Damage Sharing', 'Contra Distribución de Daño', 'ダメージ分配対策', '피해 분배 카운터', 'Contra Distribuição de Dano', '反制伤害分摊') },
    { id: 'seals_passive', type: 'pro', category: 'mechanics', translations: t('Seals Enemy Passive', 'Sella Pasiva Enemiga', '敵パッシブ封印', '적 패시브 봉인', 'Sela Passiva Inimiga', '封印敌方被动') },
    { id: 'turn_cycler', type: 'pro', category: 'speed', translations: t('Turn Cycler', 'Cicla Turnos Rápido', '高速ターン回転', '고속 턴 사이클러', 'Ciclador de Turnos', '快速循环回合') },
    { id: 'works_without_first_turn', type: 'pro', category: 'speed', translations: t("Doesn't Need First Turn", 'No Necesita Primer Turno', '先攻不要', '선턴 불필요', 'Não Precisa de Primeiro Turno', '无需先手') },
    { id: 'duo_mechanic', type: 'pro', category: 'mechanics', translations: t('Dual Character Mechanic', 'Mecánica Doble Personaje', 'デュオキャラ', '듀오 캐릭터', 'Mecânica Personagem Duplo', '双角色机制') },

    // NEW ERA 2026 — Meta & Competitive
    { id: 'anti_bruiser', type: 'pro', category: 'meta', translations: t('Anti-Bruiser', 'Anti-Tanque Bruiser', 'アンチブルーザー', '브루저 카운터', 'Anti-Bruiser', '反肉盾') },
    { id: 'new_era_staple', type: 'pro', category: 'meta', translations: t('New Era Staple', 'Esencial New Era', 'ニューエラ定番', '뉴에라 필수픽', 'Indispensável New Era', '新纪元核心') },
    { id: 'speed_variance_immune', type: 'pro', category: 'stats', translations: t('Ignores Speed Variance', 'Inmune Varianza Vel.', '速度差無視', '속도 편차 무시', 'Ignora Variância de Vel.', '无视速度差') },

    // NEW ERA 2026 — Gear Sets
    { id: 'fervor_set_best', type: 'pro', category: 'stats', translations: t('Best on Fervor Set', 'Mejor con Set Fervor', 'フェルボーセット推奨', '열정셋 추천', 'Melhor com Set Fervor', '推荐热情套') },
    { id: 'weakening_set_synergy', type: 'pro', category: 'stats', translations: t('Weakening Set Synergy', 'Sinergia Set Debilitador', 'ウィークニングセット相性', '약화셋 시너지', 'Sinergia Set Enfraquecedor', '虚弱套协同') },

    // NEW ERA 2026 — PvE Content
    { id: 'otherworld_breach_pick', type: 'pro', category: 'pve', translations: t('Otherworld Breach Pick', 'Pick Brecha Otro Mundo', '異世界侵攻推奨', '이세계 침공 추천', 'Pick Brecha do Outro Mundo', '异界侵蚀推荐') },
    { id: 'constellation_trial_pick', type: 'pro', category: 'pve', translations: t('Trial of Constellations Pick', 'Pick Prueba Constelaciones', '星座試練推奨', '별자리 시험 추천', 'Pick Prova das Constelações', '星座试炼推荐') },

    // NEW — Damage & Offense
    { id: 'one_shot_potential', type: 'pro', category: 'damage', translations: t('One-Shot Potential', 'Potencial de One-Shot', 'ワンショット性能', '원샷 잠재력', 'Potencial de One-Shot', '秒杀潜力') },
    { id: 'redirects_damage', type: 'pro', category: 'mechanics', translations: t('Redirects Damage', 'Redirige Daño', 'ダメージ転向', '데미지 전환', 'Redireciona Dano', '伤害转向') },
    { id: 'anti_cr_push', type: 'pro', category: 'speed', translations: t('Anti-CR Push', 'Anti-Push CR', 'ゲージUP妨害', '행게증 방해', 'Anti-Push CR', '反推条') },
    { id: 'enables_second_turn', type: 'pro', category: 'speed', translations: t('Enables Second Turn', 'Habilita Segundo Turno', 'セカンドターン確保', '2턴 확보', 'Habilita Segundo Turno', '确保第二回合') },
    { id: 'preventive_cleanse', type: 'pro', category: 'utility', translations: t('Preventive Cleanse', 'Limpieza Preventiva', '予防クレンズ', '선제 해제', 'Limpeza Preventiva', '预防净化') },
    { id: 'team_soul_generation', type: 'pro', category: 'utility', translations: t('Team Soul Generation', 'Genera Almas al Equipo', 'チームソウル生成', '팀 소울 생성', 'Geração de Almas', '全队生魂') },
    { id: 'anti_cleave_defensive', type: 'pro', category: 'meta', translations: t('Anti-Cleave (Defensive)', 'Anti-Cleave (Defensivo)', 'アンチクリーブ(防御)', '안티 클리브 (방어)', 'Anti-Cleave (Defensivo)', '反核爆 (防御)') },
    { id: 'punishes_enemy_buffs', type: 'pro', category: 'mechanics', translations: t('Punishes Enemy Buffs', 'Castiga Buffs Enemigos', '敵バフペナルティ', '적 버프 처벌', 'Pune Buffs Inimigos', '惩罚敌方增益') },
    { id: 'anti_tank', type: 'pro', category: 'meta', translations: t('Anti-Tank', 'Anti-Tanke', 'アンチタンク', '탱커 카운터', 'Anti-Tanque', '反肉盾') },
    { id: 'force_ban', type: 'pro', category: 'meta', translations: t('Force Ban', 'Force Ban', '強制BAN', '강제 밴', 'Force Ban', '逼Ban') },
    { id: 'safe_first_pick', type: 'pro', category: 'meta', translations: t('Safe First Pick', 'Primer Pick Seguro', '安定先取り', '안전 선픽', 'Primeiro Pick Seguro', '稳定先拿') },
    { id: 'universal_counter_pick', type: 'pro', category: 'meta', translations: t('Universal Counter Pick', 'Counter Pick Universal', '万能カウンターピック', '범용 카운터 픽', 'Counter Pick Universal', '万能反手') },
    { id: 'safe_blind_pick', type: 'pro', category: 'meta', translations: t('Safe Blind Pick', 'Pick Ciego Seguro', '安定ブラインドピック', '안전 블라인드 픽', 'Pick Cego Seguro', '安全盲选') },
    { id: 'draft_bait', type: 'pro', category: 'meta', translations: t('Draft Bait', 'Bait de Draft', 'ドラフトベイト', '밴픽 미끼', 'Isca de Draft', 'BP诱饵') },
    { id: 'recently_buffed', type: 'pro', category: 'meta', translations: t('Recently Buffed', 'Buffeado Recientemente', '最近強化', '최근 상향', 'Bufado Recentemente', '近期加强') },
    { id: 'relevant_post_buff', type: 'pro', category: 'meta', translations: t('Relevant Post-Buff', 'Relevante Post-Buff', '強化後活躍中', '상향 후 활약 중', 'Relevante Pós-Buff', '加强后活跃') },
    { id: 'meta_gw_offense', type: 'pro', category: 'meta', translations: t('GW Offense Meta', 'Meta Ofensiva GW', 'ギルド攻撃メタ', '길전 공격 메타', 'Meta Ofensiva GW', '公会战进攻核心') },
    { id: 'meta_arena_offense', type: 'pro', category: 'meta', translations: t('Arena Offense Meta', 'Meta Ofensiva Arena', 'アリーナ攻撃メタ', '아레나 공격 메타', 'Meta Ofensiva Arena', '竞技场进攻核心') },
    { id: 'meta_rta', type: 'pro', category: 'meta', translations: t('RTA Meta', 'Meta en RTA', 'RTAメタ', 'RTA 메타', 'Meta no RTA', 'RTA核心') },
];

/**
 * All Tags - Cons (Cleaned & Expanded)
 */
export const CONS_TAGS: Tag[] = [
    // ... existing cons ...

    // OFFENSIVE WEAKNESS
    { id: 'low_damage', type: 'con', category: 'offense', translations: t('Low Damage', 'Daño Bajo', '低火力', '낮은 데미지', 'Dano Baixo', '伤害低') },
    { id: 'single_target_only', type: 'con', category: 'offense', translations: t('Single Target Only', 'Solo Objetivo Único', '単体のみ', '단일 대상만', 'Apenas Alvo Único', '仅单体') },
    { id: 'no_aoe', type: 'con', category: 'offense', translations: t('No AoE', 'Sin AoE', '全体攻撃なし', '광역기 없음', 'Sem AoE', '无AOE') },
    { id: 'long_ramp_up', type: 'con', category: 'offense', translations: t('Slow Ramp Up', 'Tarda en Cargar', 'スロースターター', '예열 김', 'Demora pra Carregar', '启动慢') },
    { id: 'rng_damage', type: 'con', category: 'offense', translations: t('RNG Damage', 'Daño Inconsistente', 'ダメージ不安定', '로또 데미지', 'Dano Inconsistente', '伤害看脸') },
    { id: 'unreliable_debuffs', type: 'con', category: 'offense', translations: t('Unreliable Debuffs', 'Debuffs Inconsistentes', 'デバフ不安定', '불안정한 디버프', 'Debuffs Inconsistentes', '减益不稳定') },

    // FRAGILITY
    { id: 'squishy', type: 'con', category: 'fragility', translations: t('Very Squishy', 'Muy Frágil', '紙耐久', '물몸', 'Muito Frágil', '身板脆') },
    { id: 'low_base_hp', type: 'con', category: 'fragility', translations: t('Low Base HP', 'HP Base Baja', '低HP', '기본 체력 낮음', 'HP Base Baixo', '基础血量低') },
    { id: 'low_base_def', type: 'con', category: 'fragility', translations: t('Low Base DEF', 'DEF Base Baja', '低防御', '기본 방어 낮음', 'DEF Base Baixa', '基础防御低') },
    { id: 'weak_to_fixed_dmg', type: 'con', category: 'fragility', translations: t('Weak to Fixed Dmg', 'Débil vs Daño Fijo', '固定ダメに弱い', '고정뎀 취약', 'Fraco contra Dano Fixo', '怕固伤') },
    { id: 'weak_to_aoe', type: 'con', category: 'fragility', translations: t('Weak to AoE', 'Débil vs AoE', '全体攻撃に弱い', '광역기 취약', 'Fraco contra AoE', '怕AOE') },
    { id: 'weak_to_cc', type: 'con', category: 'fragility', translations: t('Weak to CC', 'Débil vs Control', 'CCに弱い', 'CC 취약', 'Fraco contra Controle', '怕控制') },
    { id: 'countered_by_control', type: 'con', category: 'fragility', translations: t('Countered by Control', 'Countereado por Control', 'コントロールに弱い', '컨트롤에 카운터', 'Counterado por Controle', '怕控制 (Counter)') },
    { id: 'no_sustain', type: 'con', category: 'fragility', translations: t('No Self Sustain', 'Sin Recuperación', '回復手段なし', '유지력 없음', 'Sem Recuperação', '无续航') },

    // CONTROL ISSUES
    { id: 'low_effectiveness', type: 'con', category: 'control_issues', translations: t('Low Base Effectiveness', 'Efectividad Base Baja', '低効果命中', '기본 효적 낮음', 'Efetividade Base Baixa', '基础效命低') },
    { id: 'needs_high_effectiveness', type: 'con', category: 'control_issues', translations: t('Needs High Effectiveness', 'Requiere Mucha Efec.', '高命中必要', '고효적 필요', 'Precisa Alta Efec.', '吃命中') },
    { id: 'countered_by_immunity', type: 'con', category: 'control_issues', translations: t('Countered by Immunity', 'Countereado por Inmunidad', '免疫に弱い', '면역에 카운터', 'Counterado por Imunidade', '怕免疫') },
    { id: 'countered_by_cleanse', type: 'con', category: 'control_issues', translations: t('Countered by Cleanse', 'Countereado por Cleanse', '解除に弱い', '해제에 카운터', 'Counterado por Cleanse', '怕驱散') },

    // SPEED ISSUES
    { id: 'low_base_speed', type: 'con', category: 'speed_issues', translations: t('Low Base Speed', 'Velocidad Base Baja', '低速度', '기본 속도 낮음', 'Velocidade Base Baixa', '短腿') },
    { id: 'needs_max_speed', type: 'con', category: 'speed_issues', translations: t('Needs Max Speed', 'Necesita Máxima Velocidad', '最速必須', '선턴 필수', 'Precisa Máxima Velocidade', '拼一速') },
    { id: 'slow_cycling', type: 'con', category: 'speed_issues', translations: t('Slow Turn Cycling', 'Ciclo de Turnos Lento', '回転率悪い', '턴 순환 느림', 'Ciclo de Turnos Lento', '跑圈慢') },

    // GEAR REQUIREMENTS
    { id: 'hard_to_gear', type: 'con', category: 'gear', translations: t('Hard to Gear', 'Difícil de Equipar', '装備難易度高', '장비 세팅 어려움', 'Difícil de Equipar', '面板难堆') },
    { id: 'stat_hungry', type: 'con', category: 'gear', translations: t('Stat Hungry', 'Pide Muchas Stats', 'ステータス要求高', '스탯 괴물', 'Pede Muitos Stats', '吃属性') },
    { id: 'mola_hungry', type: 'con', category: 'gear', translations: t('Mola Hungry', 'Gasta Muchos Molas', 'モラゴラ泥棒', '머라고라 많이 듦', 'Gasta Muitos Molas', '吃萝卜') },
    { id: 'needs_molagora', type: 'con', category: 'gear', translations: t('Needs Molagora Investments', 'Requiere Inversión de Molas', 'モラゴラ投資必須', '머라고라 투자 필요', 'Requer Molagoras', '需大量萝卜') },
    { id: 'needs_specific_arti', type: 'con', category: 'gear', translations: t('Artifact Dependent', 'Depende de Artefacto', '特定遺物必須', '아티 의존도 높음', 'Depende de Artefato', '绑定神器') },
    { id: 'needs_exclusive_equip', type: 'con', category: 'gear', translations: t('Needs Exclusive Equip', 'Requiere Equipo Exclusivo', '専用装備必須', '전용장비 필수', 'Requer Equip. Exclusivo', '绑定专属') },
    { id: 'needs_100_crit', type: 'con', category: 'gear', translations: t('Needs 100% Crit', 'Necesita 100% Crítico', 'クリ100%必須', '치확 100% 강제', 'Precisa 100% Crítico', '满爆强迫症') },

    // UTILITY LIMITS
    { id: 'long_cooldowns', type: 'con', category: 'utility_limits', translations: t('Long Cooldowns', 'Enfriamientos Largos', 'CD長い', '쿨타임 김', 'Cooldowns Longos', 'CD太长') },
    { id: 'soulburn_reliant', type: 'con', category: 'utility_limits', translations: t('Soulburn Reliant', 'Depende de Soulburn', 'SB依存', '소울번 의존', 'Depende de Soulburn', '依赖烧魂') },
    { id: 'focus_reliant', type: 'con', category: 'utility_limits', translations: t('Focus Reliant', 'Depende de Foco', '集中依存', '집중 의존', 'Depende de Foco', '依赖专注') },
    { id: 'fighting_spirit_reliant', type: 'con', category: 'utility_limits', translations: t('Fighting Spirit Reliant', 'Depende de Esp. Lucha', '闘志依存', '투지 의존', 'Depende de Esp. Luta', '依赖斗志') },
    { id: 'buff_dependent', type: 'con', category: 'utility_limits', translations: t('Buff Dependent', 'Depende de Buffs', 'バフ依存', '버프 의존', 'Depende de Buffs', '依赖增益') },
    { id: 'ai_issues', type: 'con', category: 'utility_limits', translations: t('Bad AI', 'Mala IA', 'AI挙動難あり', 'AI 멍청함', 'IA Ruim', '智障AI') },

    // COMPETITIVE ISSUES
    { id: 'easily_countered', type: 'con', category: 'competitive', translations: t('Easily Countered', 'Fácil de Counterear', '対策容易', '카운터 맞기 쉬움', 'Fácil de Counterar', '容易被针对') },
    { id: 'preban_candidate', type: 'con', category: 'competitive', translations: t('High Ban Rate', 'Baneado Frecuentemente', 'BAN筆頭', '필밴급', 'Banido Frequentemente', '常驻Ban位') },
    { id: 'niche_pick', type: 'con', category: 'competitive', translations: t('Niche Pick', 'Pick Situacional', 'ニッチ', '조커 픽', 'Pick Situacional', '对策卡') },
    { id: 'outdated', type: 'con', category: 'competitive', translations: t('Outdated / Powercrept', 'Desactualizado', '型落ち', '퇴물', 'Desatualizado', '时代的眼泪') },
    { id: 'countered_by_politis', type: 'con', category: 'competitive', translations: t('Weak vs Politis', 'Débil vs Politis', '対ポリティス不利', '폴리티스 밥', 'Fraco contra Politis', '怕Politis') },
    { id: 'countered_by_belian', type: 'con', category: 'competitive', translations: t('Weak vs Belian', 'Débil vs Belian', '対ベリアン不利', '벨리안 밥', 'Fraco contra Belian', '怕Belian') },
    { id: 'countered_by_seal', type: 'con', category: 'competitive', translations: t('Weak vs Seal', 'Débil vs Sello', '対封印不利', '봉인에 취약', 'Fraco contra Selo', '怕封印') },
    { id: 'countered_by_fracture', type: 'con', category: 'competitive', translations: t('Weak vs Fracture', 'Débil vs Fractura', '対骨折不利', '골절에 취약', 'Fraco contra Fratura', '怕骨折') },
    { id: 'weak_to_injury', type: 'con', category: 'competitive', translations: t('Weak vs Injury', 'Débil vs Herida', '対負傷不利', '부상에 취약', 'Fraco contra Ferimento', '怕伤口') },

    // NEW META 2026 CONS

    { id: 'weak_to_evasion', type: 'con', category: 'offense', translations: t('Struggles vs Evasion', 'Sufre vs Evasión', '対回避不利', '회피 덱에 약함', 'Sofre contra Evasão', '怕闪避') },
    { id: 'susceptible_to_cleave', type: 'con', category: 'fragility', translations: t('Susceptible to Cleave', 'Susceptible a Cleave', 'クリーブに弱い', '속공/클리브 취약', 'Suscetível a Cleave', '怕核爆') },
    { id: 'resource_reliant', type: 'con', category: 'utility_limits', translations: t('Resource Reliant', 'Depende de Recursos', 'リソース依存', '자원 의존', 'Depende de Recursos', '依赖资源') },

    // WEAKNESSES - Mechanics
    { id: 'weak_to_stun', type: 'con', category: 'fragility', translations: t('Weak to Stun', 'Débil vs Stun', 'スタンに弱い', '기절에 취약', 'Fraco contra Stun', '怕眩晕') },
    { id: 'weak_to_sleep', type: 'con', category: 'fragility', translations: t('Weak to Sleep', 'Débil vs Sueño', '睡眠に弱い', '수면에 취약', 'Fraco contra Sono', '怕睡眠') },
    { id: 'weak_to_silence', type: 'con', category: 'fragility', translations: t('Weak to Silence', 'Débil vs Silencio', '沈黙に弱い', '침묵에 취약', 'Fraco contra Silêncio', '怕沉默') },
    { id: 'weak_to_provoke', type: 'con', category: 'fragility', translations: t('Weak to Provoke', 'Débil vs Provocar', '挑発に弱い', '도발에 취약', 'Fraco contra Provocação', '怕嘲讽') },
    { id: 'weak_to_unbuffable', type: 'con', category: 'fragility', translations: t('Weak to Unbuffable', 'Débil vs Anti-Buff', '強化不可に弱い', '강불에 취약', 'Fraco contra Anti-Buff', '怕无法强化') },
    { id: 'weak_to_unhealable', type: 'con', category: 'fragility', translations: t('Weak to Unhealable', 'Débil vs Incurable', '回復不可に弱い', '회불에 취약', 'Fraco contra Incurável', '怕无法恢复') },
    { id: 'weak_to_burn', type: 'con', category: 'fragility', translations: t('Weak to Burn', 'Débil vs Quemadura', '火傷に弱い', '화상에 취약', 'Fraco contra Queimadura', '怕烧伤') },
    { id: 'weak_to_bleed', type: 'con', category: 'fragility', translations: t('Weak to Bleed', 'Débil vs Sangrado', '出血に弱い', '출혈에 취약', 'Fraco contra Sangramento', '怕流血') },
    { id: 'weak_to_poison', type: 'con', category: 'fragility', translations: t('Weak to Poison', 'Débil vs Veneno', '毒に弱い', '중독에 취약', 'Fraco contra Veneno', '怕中毒') },
    { id: 'weak_to_bomb', type: 'con', category: 'fragility', translations: t('Weak to Bomb', 'Débil vs Bombas', '爆弾に弱い', '폭탄에 취약', 'Fraco contra Bombas', '怕炸弹') },

    // DEPENDENCIES - Resources & Stats
    { id: 'requires_souls', type: 'con', category: 'dependencies', translations: t('Requires Souls', 'Requiere Almas', 'ソウル必要', '소울 필요', 'Requer Almas', '需要魂') },
    { id: 'requires_focus', type: 'con', category: 'dependencies', translations: t('Requires Focus', 'Requiere Foco', '集中必要', '집중 필요', 'Requer Foco', '需要专注') },
    { id: 'requires_fighting_spirit', type: 'con', category: 'dependencies', translations: t('Requires Fighting Spirit', 'Requiere Esp. Lucha', '闘志必要', '투지 필요', 'Requer Esp. Luta', '需要斗志') },
    { id: 'requires_specific_debuff', type: 'con', category: 'dependencies', translations: t('Requires Specific Debuff', 'Requiere Debuff Específico', '特定デバフ必要', '특정 디버프 필요', 'Requer Debuff Específico', '依赖特定减益') },
    { id: 'requires_specific_buff', type: 'con', category: 'dependencies', translations: t('Requires Specific Buff', 'Requiere Buff Específico', '特定バフ必要', '특정 버프 필요', 'Requer Buff Específico', '依赖特定增益') },
    { id: 'requires_crit', type: 'con', category: 'dependencies', translations: t('Requires Crit', 'Requiere Crítico', 'クリティカル必要', '치명타 필요', 'Requer Crítico', '需要暴击') },
    { id: 'requires_high_speed', type: 'con', category: 'dependencies', translations: t('Requires High Speed', 'Requiere Alta Velocidad', '高速度必要', '높은 속도 필요', 'Requer Alta Velocidade', '需要高速') },
    { id: 'requires_effectiveness', type: 'con', category: 'dependencies', translations: t('Requires Effectiveness', 'Requiere Efectividad', '効果命中必要', '효과적중 필요', 'Requer Efetividade', '需要命中') },
    { id: 'requires_effect_res', type: 'con', category: 'dependencies', translations: t('Requires Eff Res', 'Requiere Resistencia', '効果抵抗必要', '효과저항 필요', 'Requer Resistência', '需要抗性') },

    // META CONS
    { id: 'easily_kited', type: 'con', category: 'speed_issues', translations: t('Easily Kited', 'Fácil de Kitear', 'カイトされやすい', '카이팅 당함', 'Fácil de Kitear', '易被风筝') },
    { id: 'turn_limit', type: 'con', category: 'utility_limits', translations: t('Turn Limit', 'Límite de Turnos', 'ターン制限', '턴 제한', 'Limite de Turnos', '回合限制') },
    { id: 'cannot_use_skills', type: 'con', category: 'control_issues', translations: t('Cannot Use Skills (AI)', 'No Usa Skills (IA)', 'AIスキル使用不可', 'AI 스킬 미사용', 'Não Usa Skills (IA)', 'AI不放技能') },
    { id: 'rng_reliant', type: 'con', category: 'dependencies', translations: t('RNG Reliant', 'Depende de la Suerte', '運ゲー', '운빨', 'Depende da Sorte', '看脸') },

    // MORE WEAKNESSES
    { id: 'weak_to_strippers', type: 'con', category: 'competitive', translations: t('Weak to Strippers', 'Débil vs Dispel', '解除に弱い', '해제에 취약', 'Fraco contra Dispel', '怕驱散') },
    { id: 'weak_to_def_break', type: 'con', category: 'fragility', translations: t('Weak to Def Break', 'Débil vs Def Break', '防御ダウンに弱い', '방깍 취약', 'Fraco contra Quebra Def', '怕破甲') },
    { id: 'weak_to_burst', type: 'con', category: 'fragility', translations: t('Weak to Burst', 'Débil vs Burst', 'バーストに弱い', '폭딜에 취약', 'Fraco contra Burst', '怕爆发') },
    { id: 'no_defensive_tools', type: 'con', category: 'fragility', translations: t('No Defense Skills', 'Sin Habilidades Def', '防御スキルなし', '방어 스킬 없음', 'Sem Skills Defensivas', '无保命') },
    { id: 'combo_reliant', type: 'con', category: 'dependencies', translations: t('Combo Reliant', 'Depende de Combo', 'コンボ依存', '콤보 의존', 'Depende de Combo', '依赖连招') },
    { id: 'setup_reliant', type: 'con', category: 'dependencies', translations: t('Setup Reliant', 'Depende de Setup', 'セットアップ依存', '준비 필요', 'Depende de Setup', '依赖启动') },

    // NEW WEAKNESSES (2026 Expansion)
    { id: 'weak_to_block', type: 'con', category: 'fragility', translations: t('Weak to Block', 'Débil vs Bloqueo', 'ブロックに弱い', '차단에 취약', 'Fraco contra Bloqueio', '怕封锁') },
    { id: 'weak_to_zone', type: 'con', category: 'fragility', translations: t('Weak to Zone Eff.', 'Débil vs Zonas', '領域に弱い', '영역 효과에 취약', 'Fraco contra Zonas', '怕领域') },
    { id: 'weak_to_fixed_dmg_burst', type: 'con', category: 'fragility', translations: t('Weak to Fixed Burst', 'Débil vs Burst Fijo', '固定ダメバースト弱', '고정딜 폭발 취약', 'Fraco contra Burst Fixo', '怕固伤爆发') },
    { id: 'weak_to_execution', type: 'con', category: 'fragility', translations: t('Weak to Execution', 'Débil vs Ejecución', '処刑に弱い', '처형에 취약', 'Fraco contra Execução', '怕处决') },

    // NEW ERA 2026 — Competitive Weaknesses
    { id: 'speed_rng_reliant', type: 'con', category: 'speed_issues', translations: t('Speed RNG Reliant (±5%)', 'Varianza de Vel. ±5%', '速度RNG依存 (±5%)', '속도 RNG 의존 (±5%)', 'Dependente de RNG Vel. (±5%)', '依赖速度随机 (±5%)') },
    { id: 'passive_sealable', type: 'con', category: 'competitive', translations: t('Passive Can Be Sealed', 'Pasiva Sellable', 'パッシブ封印可能', '패시브 봉인 가능', 'Passiva Pode Ser Selada', '被动可被封印') },
    { id: 'exodia_dependent', type: 'con', category: 'dependencies', translations: t('Exodia Comp Only', 'Solo en Combo Exodia', 'エクゾディア依存', '엑조디아 의존', 'Apenas em Combo Exodia', '仅Exodia组合') },
    { id: 'countered_by_ivana', type: 'con', category: 'competitive', translations: t('Hard-Countered by Ivana', 'Contrarrestado por Ivana', 'イバナにカウンター', '이바나에 카운터', 'Counterado por Ivana', '被伊万娜克制') },
    { id: 'rta_coin_flip', type: 'con', category: 'competitive', translations: t('RTA Coin Flip', 'Cara o Cruz en RTA', 'RTA運ゲー', 'RTA 동전 던지기', 'Cara ou Coroa no RTA', 'RTA靠运气') },
    { id: 'roster_depth_required', type: 'con', category: 'competitive', translations: t('Requires Wide Roster', 'Requiere Roster Amplio', '広いロスター必要', '폭넓은 로스터 필요', 'Requer Roster Amplo', '需要宽厚阵容') },
    { id: 'only_works_on_offense', type: 'con', category: 'utility_limits', translations: t('Offense-Only (useless in GW def)', 'Solo Ofensivo (inútil en def GW)', '攻撃専用 (防衛不向き)', '공격 전용 (방덱 부적합)', 'Apenas Ofensivo (inútil GW def)', '仅进攻 (防守无用)') },
    { id: 'new_era_countered', type: 'con', category: 'competitive', translations: t('Outclassed by New Era Heroes', 'Superado por Héroes New Era', 'ニューエラに抜かれた', '뉴에라에 추월당함', 'Superado por Heróis New Era', '被新纪元英雄超越') },
    { id: 'high_er_required', type: 'con', category: 'gear', translations: t('Needs 200%+ Effect Res', 'Requiere 200%+ Resist.', '200%+ 効果抵抗必要', '효과저항 200% 이상 필요', 'Precisa 200%+ Resistência', '需要200%+效果抗性') },
    { id: 'drafts_predictably', type: 'con', category: 'competitive', translations: t('Predictable Draft Pick', 'Pick Predecible', '予測可能なピック', '예측 가능한 픽', 'Pick Previsível', '拿法可预测') },
    { id: 'countered_by_notos', type: 'con', category: 'competitive', translations: t('Weak vs Notos', 'Débil vs Notos', '対ノートス不利', '노토스 밥', 'Fraco contra Notos', '怕Notos') },
    { id: 'countered_by_ecate', type: 'con', category: 'competitive', translations: t('Weak vs Ecate', 'Débil vs Ecate', '対エカテ不利', '에카테 밥', 'Fraco contra Ecate', '怕Ecate') },
    { id: 'duo_comp_only', type: 'con', category: 'dependencies', translations: t('Only Viable in Duo Comp', 'Solo Viable en Comp Dúo', 'デュオコンプのみ', '듀오 덱 전용', 'Apenas Viável em Comp Dupla', '仅在双人组合有用') },
    { id: 'imprint_locked', type: 'con', category: 'gear', translations: t('Imprint Circuit PvE-Only', 'Circuito de Impronta solo PvE', 'インプリントPvE専用', '각인 회로 PvE 전용', 'Circuito Impronta apenas PvE', '烙印回路仅PvE') },

    // NEW — Sustainability & Turn Order
    { id: 'no_self_sustain', type: 'con', category: 'fragility', translations: t('No Self-Sustain', 'Sin Auto-Sustain', '自己維持力なし', '자체 유지력 없음', 'Sem Auto-Sustain', '无自保能力') },
    { id: 'requires_speed_tuning', type: 'con', category: 'speed_issues', translations: t('Requires Speed Tuning', 'Requiere Speed Tuning', '速度調整必須', '스피드 튜닝 필요', 'Requer Speed Tuning', '需要调速') },
    { id: 'useless_without_first_turn', type: 'con', category: 'speed_issues', translations: t('Useless without First Turn', 'Inútil sin Primer Turno', '先攻なしでは無力', '선턴 없으면 무용', 'Inútil sem Primeiro Turno', '没先手就废') },
    { id: 'turn_order_dependent', type: 'con', category: 'dependencies', translations: t('Turn Order Dependent', 'Depende del Orden de Turnos', 'ターン順依存', '턴 순서 의존', 'Depende da Ordem de Turnos', '依赖出手顺序') },

    // NEW — Weakness vs Mechanics
    { id: 'weak_to_extinction', type: 'con', category: 'competitive', translations: t('Weak vs Extinction', 'Débil vs Extinción', '消滅に弱い', '소멸에 취약', 'Fraco contra Extinção', '怕湮灭') },
    { id: 'weak_to_anti_revive', type: 'con', category: 'competitive', translations: t('Weak vs Anti-Revive', 'Débil vs Anti-Revive', '蘇生妨害に弱い', '부활 방해에 취약', 'Fraco contra Anti-Revive', '怕反复活') },
    { id: 'weak_to_buff_reduction', type: 'con', category: 'competitive', translations: t('Weak vs Buff Reduction', 'Débil vs Reducción de Buffs', 'バフ短縮に弱い', '버프 감소에 취약', 'Fraco contra Red. Buffs', '怕削buff') },
    { id: 'weak_to_turn_steal', type: 'con', category: 'competitive', translations: t('Weak vs Turn Steal', 'Débil vs Robo de Turno', 'ターン奪取に弱い', '턴 강탈에 취약', 'Fraco contra Roubo de Turno', '怕抢回合') },
    { id: 'weak_to_skill_nullifier', type: 'con', category: 'competitive', translations: t('Weak vs Skill Nullifier', 'Débil vs Skill Nullifier', 'スキル無効化に弱い', '스킬 무효화에 취약', 'Fraco contra Anulação', '怕技能无效') },
    { id: 'weak_to_reflect', type: 'con', category: 'competitive', translations: t('Weak vs Reflect', 'Débil vs Reflejo', '反射に弱い', '반사에 취약', 'Fraco contra Reflexo', '怕反射') },
    { id: 'weak_to_counterattack', type: 'con', category: 'competitive', translations: t('Weak vs Counterattack', 'Débil vs Contraataque', '反撃に弱い', '반격에 취약', 'Fraco contra Contra-ataque', '怕反击') },
    { id: 'weak_to_anti_cr_push', type: 'con', category: 'competitive', translations: t('Weak vs Anti-CR Push', 'Débil vs Anti-Push CR', 'ゲージ妨害に弱い', '행게감에 취약', 'Fraco contra Anti-Push CR', '怕压条') },

    // NEW — Weakness vs Specific Heroes
    { id: 'weak_to_byblis', type: 'con', category: 'competitive', translations: t('Weak vs Byblis', 'Débil vs Byblis', '対ビブリス不利', '비블리스에 취약', 'Fraco contra Byblis', '怕Byblis') },
    { id: 'weak_to_rhianna_luciella', type: 'con', category: 'competitive', translations: t('Weak vs Rhianna & Luciella', 'Débil vs Rhianna & Luciella', '対リアナ＆ルシエラ不利', '리아나&루시엘라에 취약', 'Fraco contra Rhianna & Luciella', '怕Rhianna&Luciella') },
    { id: 'weak_to_lady_scales', type: 'con', category: 'competitive', translations: t('Weak vs Lady of the Scales', 'Débil vs Lady of the Scales', '対天秤の女神不利', '저울의 여신에 취약', 'Fraco contra Lady of the Scales', '怕天秤女神') },
    { id: 'weak_to_setsuka', type: 'con', category: 'competitive', translations: t('Weak vs Setsuka', 'Débil vs Setsuka', '対セツカ不利', '셋츠카에 취약', 'Fraco contra Setsuka', '怕Setsuka') },
    { id: 'weak_to_ludwig', type: 'con', category: 'competitive', translations: t('Weak vs Ludwig', 'Débil vs Ludwig', '対ルートヴィヒ不利', '루드비히에 취약', 'Fraco contra Ludwig', '怕Ludwig') },
    { id: 'weak_to_dominiel', type: 'con', category: 'competitive', translations: t('Weak vs Dominiel', 'Débil vs Dominiel', '対ドミニエル不利', '도미니엘에 취약', 'Fraco contra Dominiel', '怕Dominiel') },
    { id: 'weak_to_genesis_ras', type: 'con', category: 'competitive', translations: t('Weak vs Genesis Ras', 'Débil vs Genesis Ras', '対ジェネシスラス不利', '제네시스 라스에 취약', 'Fraco contra Genesis Ras', '怕创世Ras') },
    { id: 'weak_to_frieren', type: 'con', category: 'competitive', translations: t('Weak vs Frieren', 'Débil vs Frieren', '対フリーレン不利', '프리렌에 취약', 'Fraco contra Frieren', '怕Frieren') },
    { id: 'weak_to_ivanna', type: 'con', category: 'competitive', translations: t('Weak vs Ivanna', 'Débil vs Ivanna', '対イバナ不利', '이바나에 취약', 'Fraco contra Ivanna', '怕Ivanna') },
    { id: 'weak_to_mort', type: 'con', category: 'competitive', translations: t('Weak vs Mort', 'Débil vs Mort', '対モルト不利', '모르트에 취약', 'Fraco contra Mort', '怕Mort') },

    // NEW — Conditional Weaknesses
    { id: 'nullified_without_buffs', type: 'con', category: 'dependencies', translations: t('Nullified without Buffs', 'Anulado sin Buffs', 'バフなしでは無力', '버프 없이 무용', 'Anulado sem Buffs', '没增益就废') },
    { id: 'useless_combo_stolen', type: 'con', category: 'dependencies', translations: t('Useless if Combo Stolen', 'Inútil si le Roban el Combo', 'コンボ奪われると無力', '콤보 뺏기면 무용', 'Inútil se Combo Roubado', '被断连招就废') },
    { id: 'specific_set_only', type: 'con', category: 'gear', translations: t('Specific Set Only', 'Solo con Set Específico', '特定セット専用', '특정 세트 전용', 'Apenas Set Específico', '绑定套装') },

    // NEW — Availability & Cost
    { id: 'limited_character', type: 'con', category: 'gear', translations: t('Limited Character', 'Personaje Limitado', '限定キャラ', '한정 캐릭터', 'Personagem Limitado', '限定角色') },
    { id: 'limited_artifact', type: 'con', category: 'gear', translations: t('Limited Artifact', 'Artefacto Limitado', '限定遺物', '한정 아티팩트', 'Artefato Limitado', '限定神器') },
    { id: 'whale_gear_required', type: 'con', category: 'gear', translations: t('Requires Whale Gear', 'Requiere Gear de Ballena', '廃課金装備必要', '과금 장비 필요', 'Requer Gear de Baleia', '需要氪金装备') },
    { id: 'expensive_to_build', type: 'con', category: 'gear', translations: t('Expensive to Build', 'Costoso de Armar', '育成コスト高', '육성 비용 높음', 'Caro de Montar', '培养成本高') },

    // NEW — Draft & Competitive Issues
    { id: 'frequently_prebanned', type: 'con', category: 'competitive', translations: t('Frequently Prebanned', 'Prebaneado Frecuentemente', '事前BAN常連', '사전 밴 단골', 'Pré-banido Frequentemente', '常被预Ban') },
    { id: 'fourth_fifth_pick_only', type: 'con', category: 'competitive', translations: t('4th/5th Pick Only', 'Pick de Cuarto/Quinto Solamente', '4-5番手専用', '4-5번 픽 전용', 'Apenas 4º/5º Pick', '仅4-5手位') },
    { id: 'no_first_pick', type: 'con', category: 'competitive', translations: t('Doesn\'t Work First Pick', 'No Funciona en Primer Pick', '先取り不向き', '선픽 부적합', 'Não Funciona no 1º Pick', '不适合先手拿') },
    { id: 'telegraphs_strategy', type: 'con', category: 'competitive', translations: t('Telegraphs Strategy', 'Telegrafía tu Estrategia', '戦略バレる', '전략 노출', 'Telegrafar Estratégia', '暴露策略') },
    { id: 'requires_preban_counter', type: 'con', category: 'competitive', translations: t('Requires Prebanning Counter', 'Requiere Prebanear un Counter', 'カウンター事前BAN必要', '카운터 사전 밴 필수', 'Requer Pré-ban de Counter', '需预Ban克制角色') },
    { id: 'recently_nerfed', type: 'con', category: 'competitive', translations: t('Recently Nerfed', 'Nerfeado Recientemente', '最近弱体化', '최근 하향', 'Nerfado Recentemente', '近期削弱') },
    { id: 'obsolete_new_era', type: 'con', category: 'competitive', translations: t('Obsolete by New Era', 'Obsoleto por New Era', 'ニューエラで時代遅れ', '뉴에라로 구식', 'Obsoleto pela New Era', '被新纪元淘汰') },
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
