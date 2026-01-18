export const BUFF_ICON_MAP: Record<string, string> = {
    // Buffs
    'Increase Attack': 'stic_att_up.png',
    'Increased Attack': 'stic_att_up.png',
    'Attack Buff': 'stic_att_up.png',
    'Greater Attack': 'stic_att_up2.png',
    'Increase Defense': 'stic_def_up.png',
    'Increased Defense': 'stic_def_up.png',
    'Defense Buff': 'stic_def_up.png',
    'Greater Defense': 'stic_def_up.png',
    'Immunity': 'stic_debuf_impossible.png', // Verified: stic_debuf_impossible
    'Invincibility': 'stic_invincible.png',
    'Immortality': 'stic_immortality.png',
    'Skill Nullifier': 'stic_top_immune.png', // Guessing, or check later. Using stic_protect as fallback.
    'Barrier': 'stic_protect.png',
    'Shield': 'stic_protect.png',
    'Continuous Healing': 'stic_heal.png',
    'Vigor': 'stic_demonpower_keep.png',
    'Evasion': 'stic_dodge_up.png',
    'Increased Evasion': 'stic_dodge_up.png',
    'Counterattack': 'stic_counter.png',
    'Stealth': 'stic_hide.png',
    'Revive': 'stic_revive.png', // Verify
    'Speed Up': 'stic_speed_up.png',
    'Increased Speed': 'stic_speed_up.png',
    'Critical Hit Resistance': 'stic_crires_up.png',
    'Reflect': 'stic_reflect.png',
    'Mind\'s Eye': 'stic_wildeye.png',
    'Enrage': 'stic_madness.png',
    'Perception': 'stic_wildeye.png', // Reusing wildeye as perception often similar
    'Possession': 'stic_possession_keep.png',
    'Offering': 'stic_richness_aura.png',
    'Insight': 'stic_wildeye.png',
    'Fetters': 'stic_restrict.png',

    // Debuffs
    'Defense Break': 'stic_def_dn.png',
    'Decreased Defense': 'stic_def_dn.png',
    'Attack Down': 'stic_att_dn.png',
    'Decreased Attack': 'stic_att_dn.png',
    'Speed Down': 'stic_speed_dn.png', // Note: File might be missing, check `stic_speed_up` reversed? Using generic for now.
    'Decreased Speed': 'stic_speed_dn.png',
    'Stun': 'stic_stun.png',
    'Sleep': 'stic_sleep.png',
    'Silence': 'stic_silence.png',
    'Provoke': 'stic_provoke.png',
    'Redirected Provoke': 'stic_provoke_hp.png',
    'Unbuffable': 'stic_buf_impossible.png',
    'Unable to be buffed': 'stic_buf_impossible.png',
    'Unhealable': 'stic_dot.png', // Placeholder if stic_unhealable missing
    'Burn': 'stic_blaze.png',
    'Bleeding': 'stic_blood.png',
    'Poison': 'stic_dot.png',
    'Bomb': 'stic_bomb.png',
    'Restrict': 'stic_restrict.png',
    'Bind': 'stic_restrict.png',
    'Seal': 'stic_seal.png',
    'Injury': 'stic_nail.png', // "nail" often used for injury
    'Injuries': 'stic_nail.png',
    'Extinction': 'stic_extinct.png',
    'Venom': 'stic_venom.png',
    'Target': 'stic_target.png',
    'Blind': 'stic_blind.png',
    'Decrease Hit Chance': 'stic_blind.png',
    'Stigma': 'stic_stigma.png',
    'Vampiric Touch': 'stic_vampire.png',
    'Curse': 'stic_curse2.png',
};

// Function to get icon path with fallback
export function getBuffIcon(term: string): string | null {
    const filename = BUFF_ICON_MAP[term] || BUFF_ICON_MAP[Object.keys(BUFF_ICON_MAP).find(k => k.toLowerCase() === term.toLowerCase()) || ''];
    if (!filename) return null;
    return `/images/buff/${filename}`;
}
