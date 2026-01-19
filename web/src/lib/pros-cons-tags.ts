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
    { id: 'barrier_inversion_mechanic', type: 'pro', category: 'mechanics', translations: t('Barrier Inversion', 'Inversión de Barrera', 'バリア反転', '보호막 반전', 'Inversão de Barreira', '护盾逆转') },
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
    { id: 'requires_debuffs', type: 'con', category: 'dependencies', translations: t('Requires Debuffs', 'Requiere Debuffs', 'デバフ依存', '디버프 필요', 'Requer Debuffs', '依赖减益') },
    { id: 'requires_buffs', type: 'con', category: 'dependencies', translations: t('Requires Buffs', 'Requiere Buffs', 'バフ依存', '버프 필요', 'Requer Buffs', '依赖增益') },
    { id: 'requires_aoe', type: 'con', category: 'dependencies', translations: t('Requires AoE', 'Requiere AoE', '全体攻撃持ちと相性良', '광역기 필요', 'Requer AoE', '依赖AOE') },
    { id: 'requires_non_attack', type: 'con', category: 'dependencies', translations: t('Requires Non-Attack', 'Requiere Skills No Ofensivas', '非攻撃スキル依存', '비타격 스킬 필요', 'Requer Skills Não-Ofensivas', '依赖非攻击技能') },
    // VARIETY EXPANSION (Round 3) - User Requested Specifics
    // Anti-Evasion
    { id: 'hit_chance_buff', type: 'pro', category: 'damage', translations: t('Accuracy Buff', 'Buff de Puntería', '命中バフ', '명중 버프', 'Buff de Precisão', '命中增益') },
    { id: 'ignore_evasion_mechanic', type: 'pro', category: 'mechanics', translations: t('Ignores Evasion', 'Ignora Evasión', '回避無視', '회피 무시', 'Ignora Evasão', '无视闪避') },

    // Anti-Revive & Revive
    { id: 'anti_revive_passive', type: 'pro', category: 'mechanics', translations: t('Anti-Revive Passive', 'Pasiva Anti-Revive', '蘇生不可パッシブ', '부활 불가 패시브', 'Passiva Anti-Revive', '被动无法复活') },
    { id: 'cannot_be_revived', type: 'con', category: 'fragility', translations: t('Cannot be Revived', 'No puede ser revivido', '蘇生不可', '부활 불가', 'Não pode ser revivido', '无法复活') },

    // Counter Mechanics
    { id: 'counter_stance', type: 'pro', category: 'mechanics', translations: t('Counter Stance', 'Postura de Contraataque', '反撃体勢', '반격 태세', 'Postura de Contra-ataque', '反击架势') },
    { id: 'elbris_holder', type: 'pro', category: 'stats', translations: t('Elbris Holder', 'Usuario de Elbris', 'エルブリス', '엘브리스', 'Usuário de Elbris', '大保健') },
    { id: 'reacts_to_crit', type: 'pro', category: 'mechanics', translations: t('Reacts to Crits', 'Reacciona a Críticos', '被クリ反応', '피격 시 반응 (치명)', 'Reage a Críticos', '暴击反击') },
    { id: 'reacts_to_aoe', type: 'pro', category: 'mechanics', translations: t('Reacts to AoE', 'Reacciona a AoE', '全体攻撃反応', '광역 피격 시 반응', 'Reage a AoE', 'AOE反击') },

    // Dual & Extra Attacks
    { id: 'forced_dual_attack', type: 'pro', category: 'mechanics', translations: t('Forced Dual Attack', 'Dual Attack Forzado', '強制協力攻撃', '강제 협공', 'Ataque Duplo Forçado', '强制夹攻') },
    { id: 'random_dual_attack', type: 'pro', category: 'mechanics', translations: t('Random Dual Attack', 'Dual Attack Aleatorio', 'ランダム協力攻撃', '랜덤 협공', 'Ataque Duplo Aleatório', '随机夹攻') },
    { id: 'extra_attack_trigger', type: 'pro', category: 'mechanics', translations: t('Triggers Extra Attack', 'Activa Ataque Extra', '追加攻撃発生', '추가 공격 발동', 'Ativa Ataque Extra', '触发额外攻击') },
    { id: 'follow_up_attack', type: 'pro', category: 'mechanics', translations: t('Follow-up Attack', 'Ataque de Seguimiento', '追撃', '후속 타격', 'Ataque de Seguimento', '追加打击') },
    // COMMUNITY ESSENTIALS (Round 4)
    { id: 'soul_generator', type: 'pro', category: 'utility', translations: t('Soul Generator', 'Generador de Almas', 'ソウル獲得', '소울 수급', 'Gerador de Almas', '产魂') },
    { id: 'undispellable', type: 'pro', category: 'mechanics', translations: t('Undispellable Buffs', 'Buffs Indisipables', '解除不可バフ', '해제 불가 버프', 'Buffs Indispelláveis', '不可驱散增益') },
    { id: 'stat_stacking', type: 'pro', category: 'mechanics', translations: t('Stacks Stats', 'Acumula Stats', 'ステータス累積', '스탯 중첩', 'Acumula Stats', '叠加属性') },
    { id: 'skill_chain', type: 'pro', category: 'mechanics', translations: t('Skill Chain/Combo', 'Combo de Habilidades', 'スキル連携', '스킬 연계', 'Combo de Habilidades', '技能连招') },
    { id: 'one_shot_capable', type: 'pro', category: 'damage', translations: t('One-Shot Capable', 'Capaz de One-Shot', 'ワンパン可能', '원킬 가능', 'Capaz de One-Shot', '一击必杀') },
    { id: 'variable_stats', type: 'pro', category: 'mechanics', translations: t('Stat Conversion', 'Conversión de Stats', 'ステータス変換', '스탯 변환', 'Conversão de Stats', '属性转化') },
    { id: 'ignore_dmg_limit', type: 'pro', category: 'damage', translations: t('Ignores Dmg Limit', 'Ignora Límite de Daño', 'ダメージ制限無視', '피격 제한 무시', 'Ignora Limite de Dano', '无视伤害上限') },
    { id: 'block_focus', type: 'pro', category: 'control', translations: t('Blocks Focus', 'Bloquea Foco', '集中獲得不可', '집중 획득 불가', 'Bloqueia Foco', '阻止专注') },
    { id: 'block_fighting_spirit', type: 'pro', category: 'control', translations: t('Blocks Fighting Spirit', 'Bloquea Esp. Lucha', '闘志獲得不可', '투지 획득 불가', 'Bloqueia Esp. Luta', '阻止斗志') },
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
    { id: 'weak_to_fixed_dmg', type: 'con', category: 'fragility', translations: t('Weak to Fixed Dmg', 'Débil vs Daño Fijo', '固定ダメに弱い', '고정뎀 취약', 'Fraco contra Dano Fixo', '怕固伤') },
    { id: 'weak_to_seal', type: 'con', category: 'competitive', translations: t('Weak vs Seal', 'Débil vs Sello', '対封印不利', '봉인에 취약', 'Fraco contra Selo', '怕封印') },
    { id: 'weak_to_evasion', type: 'con', category: 'offense', translations: t('Struggles vs Evasion', 'Sufre vs Evasión', '対回避不利', '회피 덱에 약함', 'Sofre contra Evasão', '怕闪避') },
    { id: 'susceptible_to_cleave', type: 'con', category: 'fragility', translations: t('Susceptible to Cleave', 'Susceptible a Cleave', 'クリーブに弱い', '속공/클리브 취약', 'Suscetível a Cleave', '怕核爆') },
    { id: 'resource_reliant', type: 'con', category: 'utility_limits', translations: t('Resource Reliant', 'Depende de Recursos', 'リソース依存', '자원 의존', 'Depende de Recursos', '依赖资源') },

    // NEW META 2026 PROS (Should be up but putting here for context or moving up? Let's keep cons in cons section.
    // Wait, PROS tags are in PROS_TAGS array. I need to edit PROS_TAGS for the pros.)
    { id: 'rng_reliant', type: 'con', category: 'dependencies', translations: t('RNG Reliant', 'Depende de la Suerte', '運ゲー', '운빨', 'Depende da Sorte', '看脸') },
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
