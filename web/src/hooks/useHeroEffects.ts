'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

export interface EffectInfo {
    name: string;
    description: string;
    type: 'buff' | 'debuff';
    icon: string | null;
}

type HeroEffects = Record<string, Record<string, { buffs: string[]; debuffs: string[] }>>;

/** Nombre y descripción de un efecto en el idioma del usuario (messages/effects/{locale}.json) */
export interface EffectText {
    name: string;
    description: string;
}

export interface EffectsData {
    heroes: HeroEffects;
    effects: Record<string, EffectInfo>;
    /** Traducciones por id; vacío en inglés (el texto de CeciliaBot ya está en inglés) */
    translations: Record<string, EffectText>;
    /** Nombre en inglés en minúsculas (con y sin aclaración entre paréntesis) → id */
    idByName: Record<string, string>;
}

let effectsPromise: Promise<Omit<EffectsData, 'translations'>> | null = null;
const translationPromises: Record<string, Promise<Record<string, EffectText>>> = {};

/**
 * Carga los datos de efectos (generados por scripts/generate-hero-effects.mjs) una sola vez,
 * con import dinámico para que no pesen en el bundle del resto de páginas.
 */
function loadEffects(): Promise<Omit<EffectsData, 'translations'>> {
    effectsPromise ??= Promise.all([
        import('@/data/hero-effects.json'),
        import('@/data/effects.json'),
    ]).then(([heroes, effects]) => {
        const byId = effects.default as Record<string, EffectInfo>;
        const idByName: Record<string, string> = {};
        for (const [id, info] of Object.entries(byId)) {
            const full = info.name.toLowerCase();
            idByName[full] ??= id;
            idByName[full.replace(/\s*\(.*\)\s*$/, '')] ??= id;
        }
        return { heroes: heroes.default as HeroEffects, effects: byId, idByName };
    });
    return effectsPromise;
}

function loadEffectTranslations(locale: string): Promise<Record<string, EffectText>> {
    if (locale === 'en') return Promise.resolve({});
    translationPromises[locale] ??= import(`../../messages/effects/${locale}.json`)
        .then((module) => module.default as Record<string, EffectText>)
        .catch(() => ({}));
    return translationPromises[locale];
}

/** Datos de buffs/debuffs de CeciliaBot más sus traducciones al idioma actual */
export function useHeroEffects(): EffectsData | null {
    const { locale } = useTranslations();
    const [data, setData] = useState<EffectsData | null>(null);

    useEffect(() => {
        let active = true;
        Promise.all([loadEffects(), loadEffectTranslations(locale)]).then(([loaded, translations]) => {
            if (active) setData({ ...loaded, translations });
        });
        return () => {
            active = false;
        };
    }, [locale]);

    return data;
}

/**
 * Texto de un efecto por su nombre en inglés: la traducción del efecto de CeciliaBot si existe,
 * si no el texto de CeciliaBot en inglés; null si no es un efecto de CeciliaBot (usar el glosario).
 */
export function effectTextByName(data: EffectsData | null, englishName: string): EffectText | null {
    const id = data?.idByName[englishName.toLowerCase()];
    if (!data || !id) return null;
    return data.translations[id] ?? { name: data.effects[id].name, description: data.effects[id].description };
}
