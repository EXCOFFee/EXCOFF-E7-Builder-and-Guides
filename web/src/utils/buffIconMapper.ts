export const BUFF_ICON_MAP: Record<string, string> = {
    // Buffs
    // Buffs
    'Increase Attack': 'stic_att_up.png',
    'Increased Attack': 'stic_att_up.png',
    'Attack Buff': 'stic_att_up.png',
    'Greater Attack': 'stic_att_up2.png',
    'Exploiting Weak Points': 'stic_att_inc.png', // Aram S3
    'Increase Defense': 'stic_def_up.png',
    'Increased Defense': 'stic_def_up.png',
    'Defense Buff': 'stic_def_up.png',
    'Greater Defense': 'stic_def_up.png',
    'Indomitable': 'stic_indomitable_keep.png', // Ilynav S3
    'Immunity': 'stic_debuf_impossible.png',
    'Invincibility': 'stic_invincible.png',
    'Immortality': 'stic_immortality.png',
    'Skill Nullifier': 'stic_charm_1.png', // Corrected
    'Skill Effect Nullifier': 'stic_shroud_1.png', // MB Dominiel / NM Luna
    'Barrier': 'stic_protect.png',
    'Shield': 'stic_protect.png',
    'Defensive Magic': 'stic_barriermagic_keep.png', // Frieren
    'Continuous Healing': 'stic_heal.png',
    'Vigor': 'stic_haki.png', // Corrected from demonpower
    'Power of the Archdemon': 'stic_demonpower_keep.png', // A. Vildred
    'Evasion': 'stic_dodge_up.png',
    'Increased Evasion': 'stic_dodge_up.png',
    'Counterattack': 'stic_counter.png',
    'Stealth': 'stic_hide.png',
    'Revive': 'stic_revive.png', // Still missing? User didn't provide image for this generic one.
    'Protection of Essential Spirit': 'stic_spiritlord_keep.png', // Ruele S3
    'Speed Up': 'stic_speed_up.png',
    'Increased Speed': 'stic_speed_up.png',
    'Rampage': 'stic_overrun_keep.png', // LW Peira
    'Critical Hit Resistance': 'stic_crires_up.png',
    'Reflect': 'stic_reflect.png',
    'Mind\'s Eye': 'stic_wildeye.png',
    'Dragon Eye': 'stic_dragoneye_keep.png', // Milim
    'Enrage': 'stic_madness.png', // Corrected
    'Perception': 'stic_wildeye.png',
    'Detection': 'stic_detection_keep.png', // Insight/Detection
    'Insight': 'stic_detection_keep.png',
    'Possession': 'stic_possession_keep.png',
    'Offering': 'stic_sacrifice_aura.png', // Corrected
    'Abundance': 'stic_richness_aura.png', // Lady of Scales
    'Fetters': 'stic_restrict.png',
    'Front Row': 'stic_guardian_keep.png',
    'Covenant': 'stic_covenant_keep.png', // Genesis Ras
    'Oath of Punishment': 'stic_vow_keep.png', // DB Senya
    'Ice Cream': 'stic_icecream_keep.png', // OB Luluca
    'Special Friendship': 'stic_friendship_keep.png', // Young Senya
    'War God': 'stic_wargod_aura.png', // A. Ravi
    'Demon Mode': 'stic_oni_keep.png', // Rem
    'Shyness': 'stic_shame_keep.png', // F. Eda
    'Superhumanization': 'stic_superhuman_keep.png', // Nurse Yulha
    'Damage Limit': 'stic_dmg_limit.png', // Ruele/Lilias
    'Challenge': 'stic_challenge_keep.png', // Lua
    'Blood Aura': 'stic_bloodaura_keep.png', // BM Haste
    'Idol': 'stic_showtime.png', // Tamarinne
    'Phantom Sword': 'stic_illusionblade_aura.png', // LP Karin
    'Illusion': 'stic_illusion_aura.png', // S. Tenebria
    'Deify': 'stic_almighty_keep.png', // Zio

    // Debuffs
    'Defense Break': 'stic_def_dn.png',
    'Decreased Defense': 'stic_def_dn.png',
    'Attack Down': 'stic_att_dn.png',
    'Decreased Attack': 'stic_att_dn.png',
    'Speed Down': 'stic_speed_dn.png',
    'Decreased Speed': 'stic_speed_dn.png',
    'Stun': 'stic_stun.png',
    'Sleep': 'stic_sleep.png',
    'Silence': 'stic_silence.png',
    'Provoke': 'stic_provoke.png',
    'Redirected Provoke': 'stic_provoke_hp.png',
    'Unbuffable': 'stic_buf_impossible.png',
    'Unable to be buffed': 'stic_buf_impossible.png',
    'Unhealable': 'stic_dot.png', // User didn't specify replacement for this, mentioned generic only.
    'Burn': 'stic_blaze.png',
    'Bleeding': 'stic_blood.png',
    'Poison': 'stic_dot.png',
    'Pestilence': 'stic_venomspread_keep.png', // DDR
    'Bomb': 'stic_bomb.png',
    'Restrict': 'stic_restrict.png',
    'Bind': 'stic_ab_up_block.png', // User requested stic_ab_up_block for "Atadura" (Bind)
    'Seal': 'stic_dizzy.png', // User requested stic_dizzy
    'Injury': '../sets/SET_Injury.png',
    'Injuries': '../sets/SET_Injury.png',
    'Extinction': 'stic_extinct.png', // User said "No existe imagen... se queda sin imagen" -> Maybe map to null or keep broken? Safe to keep if code handles error.
    'Venom': 'stic_venom.png',
    'Target': 'stic_target.png',
    'Blind': 'stic_blind.png',
    'Decrease Hit Chance': 'stic_blind.png',
    'Decreased Hit Chance': 'stic_blind.png',
    'Beguile': 'stic_deceptive.png',
    'Stigma': 'stic_stigma.png',
    'Vampiric Touch': 'stic_vampire.png',
    'Curse': 'stic_curse2.png',
    'Collapse': 'stic_collapse.png', // Genesis Ras
    'Freezing': 'stic_freezing.png',
    'Death Sentence': 'stic_death_1_keep.png', // Ainz
    'Omen': 'stic_debuff_one_aura.png', // Lethe
    'Fear': 'stic_fear.png',
    'Cascade': 'stic_dmg_fixed_keep.png',
};

// Function to get icon path with fallback
export function getBuffIcon(term: string): string | null {
    const filename = BUFF_ICON_MAP[term] || BUFF_ICON_MAP[Object.keys(BUFF_ICON_MAP).find(k => k.toLowerCase() === term.toLowerCase()) || ''];
    if (!filename) return null;
    return `/images/buff/${filename}`;
}
