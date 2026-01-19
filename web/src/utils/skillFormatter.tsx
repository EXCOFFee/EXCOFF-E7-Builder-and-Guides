import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SkillTermTooltip } from '@/components/SkillTermTooltip';

// Dictionary of terms to highlight
const TERMS: Record<string, string> = {
    // Buffs (Blue/Green theme)
    'Increase Attack': 'text-blue-300 font-bold',
    'Increased Attack': 'text-blue-300 font-bold',
    'Attack Buff': 'text-blue-300 font-bold',
    'Greater Attack': 'text-blue-300 font-bold',
    'Increase Defense': 'text-blue-300 font-bold',
    'Increased Defense': 'text-blue-300 font-bold',
    'Defense Buff': 'text-blue-300 font-bold',
    'Greater Defense': 'text-blue-300 font-bold',
    'Immunity': 'text-blue-300 font-bold',
    'Invincibility': 'text-blue-300 font-bold',
    'Immortality': 'text-blue-300 font-bold',
    'Skill Nullifier': 'text-blue-300 font-bold',
    'Barrier': 'text-blue-300 font-bold',
    'Shield': 'text-blue-300 font-bold',
    'Continuous Healing': 'text-green-300 font-bold',
    'Vigor': 'text-yellow-300 font-bold',
    'Evasion': 'text-blue-300 font-bold',
    'Increased Evasion': 'text-blue-300 font-bold',
    'Counterattack': 'text-blue-300 font-bold',
    'Stealth': 'text-gray-300 font-bold',
    'Revive': 'text-green-400 font-bold',
    'Speed Up': 'text-blue-300 font-bold',
    'Increased Speed': 'text-blue-300 font-bold',
    'Critical Hit Resistance': 'text-blue-300 font-bold',
    'Reflect': 'text-purple-300 font-bold',
    'Mind\'s Eye': 'text-yellow-300 font-bold',
    'Enrage': 'text-red-400 font-bold',
    'Cascade': 'text-blue-300 font-bold',
    'Perception': 'text-purple-300 font-bold',
    'Possession': 'text-red-400 font-bold',
    'Offering': 'text-e7-gold font-bold',
    'Insight': 'text-yellow-300 font-bold',
    'Fetters': 'text-red-500 font-bold',

    // Healing (Green theme)
    'Recover Health': 'text-green-300 font-bold',
    'Recovers Health': 'text-green-300 font-bold',
    'Heal': 'text-green-300 font-bold',
    'Heals': 'text-green-300 font-bold',
    'Healing': 'text-green-300 font-bold',
    'Regenerate': 'text-green-300 font-bold',

    // Debuffs (Red theme)
    'Defense Break': 'text-red-400 font-bold',
    'Decreased Defense': 'text-red-400 font-bold',
    'Attack Down': 'text-red-400 font-bold',
    'Decreased Attack': 'text-red-400 font-bold',
    'Speed Down': 'text-red-400 font-bold',
    'Decreased Speed': 'text-red-400 font-bold',
    'Stun': 'text-red-400 font-bold',
    'Sleep': 'text-red-400 font-bold',
    'Silence': 'text-red-400 font-bold',
    'Provoke': 'text-red-400 font-bold',
    'Redirected Provoke': 'text-red-400 font-bold',
    'Unbuffable': 'text-red-400 font-bold',
    'Unable to be buffed': 'text-red-400 font-bold',
    'Unhealable': 'text-red-400 font-bold',
    'Burn': 'text-orange-500 font-bold',
    'Bleeding': 'text-red-600 font-bold',
    'Poison': 'text-purple-400 font-bold',
    'Bomb': 'text-yellow-600 font-bold',
    'Restrict': 'text-gray-400 font-bold',
    'Bind': 'text-gray-400 font-bold',
    'Seal': 'text-gray-400 font-bold',
    'Injury': 'text-orange-700 font-bold',
    'Injuries': 'text-orange-700 font-bold',
    'Extinction': 'text-gray-500 font-bold',
    'Venom': 'text-purple-500 font-bold',
    'Target': 'text-red-400 font-bold',
    'Blind': 'text-gray-400 font-bold',
    'Decrease Hit Chance': 'text-gray-400 font-bold',
    'Stigma': 'text-red-400 font-bold',
    'Vampiric Touch': 'text-red-400 font-bold',
    'Curse': 'text-indigo-400 font-bold',

    // Mechanics (Gold/Special)
    'Combat Readiness': 'text-e7-gold font-bold',
    'CR Push': 'text-e7-gold font-bold',
    'Soulburn': 'text-purple-300 font-bold',
    'Dual Attack': 'text-orange-300 font-bold',
    'Penetrates Defense': 'text-red-300 font-bold',
    'Ignore Effect Resistance': 'text-indigo-300 font-bold',
    'Ignores Effect Resistance': 'text-indigo-300 font-bold',
    'Extra Turn': 'text-yellow-200 font-bold',
    'Critical Hit': 'text-orange-400 font-bold',
    'Crushing Hit': 'text-gray-300 font-bold',
    'Fixed Damage': 'text-orange-300 font-bold',
    'Share Damage': 'text-blue-300 font-bold',
    'Dispel': 'text-blue-200 font-bold',
    'Dispels': 'text-blue-200 font-bold',
    'Cleanse': 'text-green-200 font-bold',
    'Transfer': 'text-purple-300 font-bold',
    'Resets Cooldown': 'text-blue-200 font-bold',
    'Reset Cooldown': 'text-blue-200 font-bold',
    'Fighting Spirit': 'text-red-500 font-bold',
    'Focus': 'text-orange-400 font-bold',
};

// Regex to match any of the terms (case insensitive)
// Escape special characters in terms
const TERM_REGEX = new RegExp(`\\b(${Object.keys(TERMS).map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

export function formatSkillText(text: string | undefined): React.ReactNode {
    if (!text) return null;

    // Split text by terms
    const parts = text.split(TERM_REGEX);

    return (
        <span>
            {parts.map((part, index) => {
                // Check if this part is a term (case insensitive check)
                const lowerPart = part.toLowerCase();
                const matchedTerm = Object.keys(TERMS).find(t => t.toLowerCase() === lowerPart);

                if (matchedTerm) {
                    return (
                        <SkillTermTooltip
                            key={index}
                            term={matchedTerm}
                            highlightClass={TERMS[matchedTerm]}
                        >
                            {part}
                        </SkillTermTooltip>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
}

// Helper to check if text contains mechanics and show badges
export function getSkillMechanics(text: string | undefined): string[] {
    if (!text) return [];

    // Find all terms that exist in the text using regex for exact word matching
    // Filter duplicates via Set at the end
    const foundTerms: string[] = [];

    // Optimize: Instead of checking every term individually with regex,
    // match against the big regex and collect matches.
    const matches = text.match(TERM_REGEX);

    if (matches) {
        matches.forEach(match => {
            const lowerMatch = match.toLowerCase();
            const matchedKey = Object.keys(TERMS).find(k => k.toLowerCase() === lowerMatch);
            if (matchedKey) foundTerms.push(matchedKey);
        });
    }

    return [...new Set(foundTerms)];
}
