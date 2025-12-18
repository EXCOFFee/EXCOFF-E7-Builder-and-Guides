/**
 * Equipment Sets Configuration
 * Centralized configuration for all equipment sets in Epic Seven
 */

// All available sets
export const SETS = [
    'speed', 'attack', 'health', 'defense', 'critical',
    'destruction', 'counter', 'lifesteal', 'immunity',
    'rage', 'revenge', 'injury', 'penetration', 'protection',
    'unity', 'hit', 'resist', 'torrent', 'warfare', 'pursuit',
    'riposte', 'revival'
] as const;

export type SetType = typeof SETS[number];

// Set to image mapping (lowercase keys for user builds)
export const SET_IMAGES: Record<string, string> = {
    speed: '/images/sets/SET_Speed.png',
    attack: '/images/sets/SET_Attack.png',
    health: '/images/sets/SET_Health.png',
    defense: '/images/sets/SET_Defense.png',
    critical: '/images/sets/SET_Critical.png',
    destruction: '/images/sets/SET_Destruction.png',
    counter: '/images/sets/SET_Counter.png',
    lifesteal: '/images/sets/SET_Lifesteal.png',
    immunity: '/images/sets/SET_Immunity.png',
    rage: '/images/sets/SET_Rage.png',
    revenge: '/images/sets/SET_Revenge.png',
    injury: '/images/sets/SET_Injury.png',
    penetration: '/images/sets/SET_Penetration.png',
    protection: '/images/sets/SET_Barrier.png',
    unity: '/images/sets/SET_Unity.png',
    hit: '/images/sets/SET_Hit.png',
    resist: '/images/sets/SET_Resist.png',
    torrent: '/images/sets/SET_Torrent.png',
    warfare: '/images/sets/SET_Warfare.png',
    pursuit: '/images/sets/SET_Pursuit.png',
    riposte: '/images/sets/SET_Riposte.png',
    revival: '/images/sets/SET_Revival.png',
};

// Set display names
export const SET_NAMES: Record<string, string> = {
    speed: 'Speed',
    attack: 'Attack',
    health: 'Health',
    defense: 'Defense',
    critical: 'Critical',
    destruction: 'Destruction',
    counter: 'Counter',
    lifesteal: 'Lifesteal',
    immunity: 'Immunity',
    rage: 'Rage',
    revenge: 'Revenge',
    injury: 'Injury',
    penetration: 'Penetration',
    protection: 'Protection',
    unity: 'Unity',
    hit: 'Hit',
    resist: 'Resist',
    torrent: 'Torrent',
    warfare: 'Warfare',
    pursuit: 'Pursuit',
    riposte: 'Riposte',
    revival: 'Revival',
};

// Set codes mapping (for Fribbels data - snake_case)
export const SET_CODE_IMAGES: Record<string, string> = {
    set_speed: '/images/sets/SET_Speed.png',
    set_att: '/images/sets/SET_Attack.png',
    set_cri: '/images/sets/SET_Critical.png',
    set_cri_dmg: '/images/sets/SET_Destruction.png',
    set_def: '/images/sets/SET_Defense.png',
    set_max_hp: '/images/sets/SET_Health.png',
    set_acc: '/images/sets/SET_Hit.png',
    set_res: '/images/sets/SET_Resist.png',
    set_lifesteal: '/images/sets/SET_Lifesteal.png',
    set_counter: '/images/sets/SET_Counter.png',
    set_immunity: '/images/sets/SET_Immunity.png',
    set_rage: '/images/sets/SET_Rage.png',
    set_unity: '/images/sets/SET_Unity.png',
    set_penetrate: '/images/sets/SET_Penetration.png',
    set_revenge: '/images/sets/SET_Revenge.png',
    set_injury: '/images/sets/SET_Injury.png',
    set_torrent: '/images/sets/SET_Torrent.png',
    set_protection: '/images/sets/SET_Barrier.png',
    set_warfare: '/images/sets/SET_Warfare.png',
    set_pursuit: '/images/sets/SET_Pursuit.png',
    set_riposte: '/images/sets/SET_Riposte.png',
    set_revival: '/images/sets/SET_Revival.png',
};

// Emoji icons for sets (fallback)
export const SET_ICONS: Record<string, string> = {
    Speed: '⚡',
    Attack: '⚔️',
    Critical: '🎯',
    Destruction: '💥',
    Defense: '🛡️',
    Health: '❤️',
    Hit: '🎪',
    Resist: '🔰',
    Lifesteal: '🧛',
    Counter: '↩️',
    Immunity: '✨',
    Rage: '😤',
    Unity: '🤝',
    Penetration: '🔱',
    Revenge: '⚡',
    Injury: '💀',
    Torrent: '🌊',
    Protection: '🛡️',
    Warfare: '⚔️',
    Pursuit: '🏃',
    Riposte: '↩️',
    Revival: '💫',
};

// Helper function to format set name
export const formatSetName = (set: string): string => {
    return set.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};
