'use client';

import { useState, useEffect } from 'react';

interface SkillData {
    name: string;
    description: string;
}

interface HeroSkills {
    S1?: SkillData;
    S2?: SkillData;
    S3?: SkillData;
}

type SkillsData = Record<string, HeroSkills>;

// Cache for loaded skill translations
const skillsCache: Record<string, SkillsData> = {};

/**
 * Hook to get skill translations for a hero based on their slug
 */
export function useSkillTranslations(heroSlug: string, locale: string = 'en') {
    const [skills, setSkills] = useState<HeroSkills | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSkills = async () => {
            setLoading(true);

            // Check cache first
            if (skillsCache[locale]) {
                setSkills(skillsCache[locale][heroSlug] || null);
                setLoading(false);
                return;
            }

            try {
                // Dynamic import of skill translations
                const skillsModule = await import(`../../messages/skills/${locale}.json`);
                skillsCache[locale] = skillsModule.default;
                setSkills((skillsModule.default as SkillsData)[heroSlug] || null);
            } catch {
                // Fallback to English
                try {
                    const fallbackModule = await import('../../messages/skills/en.json');
                    skillsCache['en'] = fallbackModule.default;
                    setSkills((fallbackModule.default as SkillsData)[heroSlug] || null);
                } catch {
                    setSkills(null);
                }
            }

            setLoading(false);
        };

        loadSkills();
    }, [heroSlug, locale]);

    /**
     * Get a specific skill translation
     */
    const getSkill = (skillKey: 'S1' | 'S2' | 'S3'): SkillData | null => {
        return skills?.[skillKey] || null;
    };

    /**
     * Get skill name with fallback
     */
    const getSkillName = (skillKey: 'S1' | 'S2' | 'S3', fallback: string): string => {
        return skills?.[skillKey]?.name || fallback;
    };

    /**
     * Get skill description with fallback
     */
    const getSkillDescription = (skillKey: 'S1' | 'S2' | 'S3', fallback: string): string => {
        return skills?.[skillKey]?.description || fallback;
    };

    return {
        skills,
        loading,
        getSkill,
        getSkillName,
        getSkillDescription,
    };
}
