import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SkillTermTooltip } from '@/components/SkillTermTooltip';

// Dictionary of terms to highlight
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
    'Blanco': 'text-red-400 font-bold', // Spanish Target
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

// Map localized terms to their canonical English keys for Glossary lookup & Color mapping
const TERM_ALIASES: Record<string, string> = {
    // Spanish
    'Aumento de Ataque': 'Increase Attack',
    'Aumento de Defensa': 'Increase Defense',
    'Inmunidad': 'Immunity',
    'Invencibilidad': 'Invincibility',
    'Barrera': 'Barrier',
    'Curación Continua': 'Continuous Healing',
    'Vigor': 'Vigor',
    'Evasión': 'Evasion',
    'Revivir': 'Revive',
    'Aumento de Velocidad': 'Speed Up',
    'Resistencia a Golpes Críticos': 'Critical Hit Resistance',
    'Reflejo': 'Reflect',

    'Romper Defensa': 'Defense Break',
    'Disminución de Ataque': 'Attack Down',
    'Disminución de Velocidad': 'Speed Down',
    'Aturdimiento': 'Stun',
    'Sueño': 'Sleep',
    'Silencio': 'Silence',
    'Provocación': 'Provoke',
    'Bloqueo de Mejoras': 'Unbuffable',
    'No se puede recibir mejoras': 'Unbuffable',
    'Anti-Curación': 'Unhealable',
    'Quemadura': 'Burn',
    'Sangrado': 'Bleeding',
    'Veneno': 'Poison', // Check consistency
    'Bomba': 'Bomb',
    'Restricción': 'Restrict',
    'Sellar': 'Seal',
    'Lesión': 'Injury',
    'Extinción': 'Extinction',
    'Ceguera': 'Blind',
    // 'Blanco' is already in TERMS, but better to map it to Target for glossary
    'Blanco': 'Target',

    'Preparación de Combate': 'Combat Readiness',
    'Quema de Alma': 'Soulburn',
    'Ataque Dual': 'Dual Attack',
    'Penetrar Defensa': 'Penetrates Defense',
    'Ignora Resistencia a Efectos': 'Ignore Effect Resistance',
    'Turno Extra': 'Extra Turn',
    'Golpe Crítico': 'Critical Hit',
    'Daño Fijo': 'Fixed Damage',
    'Disipar': 'Dispel',
    'Limpiar': 'Cleanse',
    'Transferir': 'Transfer',
    'Restablece Reactivación': 'Resets Cooldown',
    'Espíritu de Lucha': 'Fighting Spirit',
    'Foco': 'Focus',
};

// Combine TERMS keys and ALIAS keys
const ALL_KEYS = [...Object.keys(TERMS), ...Object.keys(TERM_ALIASES)];
// Regex to match any of the terms (case insensitive)
// Escape special characters in terms
const TERM_REGEX = new RegExp(`\\b(${ALL_KEYS.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

export function formatSkillText(text: string | undefined): React.ReactNode {
    if (!text) return null;

    // Split text by terms
    const parts = text.split(TERM_REGEX);

    return (
        <span>
            {parts.map((part, index) => {
                const lowerPart = part.toLowerCase();

                // Try to find in TERMS (Direct match)
                let matchedTerm = Object.keys(TERMS).find(t => t.toLowerCase() === lowerPart);

                // If not found, try ALIASES
                if (!matchedTerm) {
                    const aliasKey = Object.keys(TERM_ALIASES).find(t => t.toLowerCase() === lowerPart);
                    if (aliasKey) {
                        // Found an alias, resolve to canonical
                        matchedTerm = TERM_ALIASES[aliasKey];
                    }
                }

                if (matchedTerm) {
                    // Special handling for "Target": Only highlight if it matches exact case ("Target")
                    // or if it is the Spanish "Blanco" (which is safe).
                    if (matchedTerm === 'Target' && part === 'target') {
                        // "target" (lowercase noun) -> Skip
                        return <span key={index}>{part}</span>;
                    }

                    // Resolve color using canonical term
                    const highlightClass = TERMS[matchedTerm];

                    // If it was an alias (e.g. Blanco), we want the tooltip to look up 'Target' in glossary
                    // but maybe show the original text 'Blanco'? 
                    // SkillTermTooltip uses `term` for lookup. 
                    // We should pass the *Canonical* term for lookup, but render the *original* part text.

                    return (
                        <SkillTermTooltip
                            key={index}
                            term={matchedTerm} // Canonical term for glossary lookup
                            highlightClass={highlightClass}
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

    const foundTerms: string[] = [];
    const matches = text.match(TERM_REGEX);

    if (matches) {
        matches.forEach(match => {
            const lowerMatch = match.toLowerCase();

            // Resolve Alias/Direct match to canonical key
            let canonicalKey = Object.keys(TERMS).find(k => k.toLowerCase() === lowerMatch);

            if (!canonicalKey) {
                const aliasKey = Object.keys(TERM_ALIASES).find(t => t.toLowerCase() === lowerMatch);
                if (aliasKey) canonicalKey = TERM_ALIASES[aliasKey];
            }

            if (canonicalKey) {
                // Strict check for Target
                if (canonicalKey === 'Target' && match === 'target') {
                    return; // Skip generic 'target'
                }
                foundTerms.push(canonicalKey);
            }
        });
    }

    return [...new Set(foundTerms)];
}
