import React from 'react';
import { Badge } from '@/components/ui/badge';

// Dictionary of terms to highlight
const TERMS: Record<string, string> = {
    // Buffs (Blue/Green theme)
    'Increase Attack': 'text-blue-300 font-bold',
    'Increased Attack': 'text-blue-300 font-bold',
    'Defense Buff': 'text-blue-300 font-bold',
    'Increased Defense': 'text-blue-300 font-bold',
    'Immunity': 'text-blue-300 font-bold',
    'Invincibility': 'text-blue-300 font-bold',
    'Skill Nullifier': 'text-blue-300 font-bold',
    'Barrier': 'text-blue-300 font-bold',
    'Continuous Healing': 'text-green-300 font-bold',
    'Vigor': 'text-yellow-300 font-bold',
    'Evasion': 'text-blue-300 font-bold',
    'Counterattack': 'text-blue-300 font-bold',
    'Stealth': 'text-gray-300 font-bold',
    'Revive': 'text-green-400 font-bold',

    // Debuffs (Red theme)
    'Defense Break': 'text-red-400 font-bold',
    'Decreased Defense': 'text-red-400 font-bold',
    'Attack Down': 'text-red-400 font-bold',
    'Decreased Attack': 'text-red-400 font-bold',
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

    // Mechanics (Gold/Special)
    'Combat Readiness': 'text-e7-gold font-bold',
    'CR Push': 'text-e7-gold font-bold',
    'Soulburn': 'text-purple-300 font-bold',
    'Dual Attack': 'text-orange-300 font-bold',
    'Penetrates Defense': 'text-red-300 font-bold',
    'Ignore Effect Resistance': 'text-indigo-300 font-bold',
    'Extra Turn': 'text-yellow-200 font-bold',
    'Critical Hit': 'text-orange-400 font-bold',
    'Crushing Hit': 'text-gray-300 font-bold',
};

// Regex to match any of the terms (case insensitive)
const TERM_REGEX = new RegExp(`\\b(${Object.keys(TERMS).join('|')})\\b`, 'gi');

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
                        <span key={index} className={TERMS[matchedTerm]}>
                            {part}
                        </span>
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

    const mechanics: string[] = [];
    if (text.toLowerCase().includes('stun')) mechanics.push('Stun');
    if (text.toLowerCase().includes('fense break') || text.toLowerCase().includes('creased defense')) mechanics.push('Def Break');
    if (text.toLowerCase().includes('strip') || text.toLowerCase().includes('dispels')) mechanics.push('Strip');
    if (text.toLowerCase().includes('cleanse')) mechanics.push('Cleanse');
    if (text.toLowerCase().includes('push')) mechanics.push('Push');
    if (text.toLowerCase().includes('cr') || text.toLowerCase().includes('combat readiness')) mechanics.push('CR');

    return [...new Set(mechanics)]; // Unique
}
