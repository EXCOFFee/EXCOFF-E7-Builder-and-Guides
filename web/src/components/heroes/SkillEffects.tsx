'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslations } from '@/hooks/useTranslations';
import { getSkillMechanics } from '@/utils/skillFormatter';
import { getBuffIcon } from '@/utils/buffIconMapper';

const CECILIA_SKILL_ICONS = 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/skill';

interface EffectInfo {
    name: string;
    description: string;
    type: 'buff' | 'debuff';
    icon: string | null;
}

type HeroEffects = Record<string, Record<string, { buffs: string[]; debuffs: string[] }>>;

interface EffectsData {
    heroes: HeroEffects;
    effects: Record<string, EffectInfo>;
}

let effectsPromise: Promise<EffectsData> | null = null;

/**
 * Carga los datos de efectos (generados por scripts/generate-hero-effects.js) una sola vez,
 * con import dinámico para que no pesen en el bundle del resto de páginas.
 */
function loadEffects(): Promise<EffectsData> {
    effectsPromise ??= Promise.all([
        import('@/data/hero-effects.json'),
        import('@/data/effects.json'),
    ]).then(([heroes, effects]) => ({
        heroes: heroes.default as HeroEffects,
        effects: effects.default as Record<string, EffectInfo>,
    }));
    return effectsPromise;
}

export function useHeroEffects(): EffectsData | null {
    const [data, setData] = useState<EffectsData | null>(null);

    useEffect(() => {
        let active = true;
        loadEffects().then((loaded) => {
            if (active) setData(loaded);
        });
        return () => {
            active = false;
        };
    }, []);

    return data;
}

interface SkillEffectsProps {
    heroName: string;
    skillKey: string;
    /** Texto de la skill: se usa para detectar mecánicas si el héroe no tiene datos estructurados */
    fallbackText: string;
    data: EffectsData | null;
}

/**
 * Íconos de buffs/debuffs de una skill con tooltip (nombre + descripción).
 * Usa los efectos exactos de CeciliaBot; si el héroe no los tiene, detecta mecánicas en el texto.
 */
export function SkillEffects({ heroName, skillKey, fallbackText, data }: SkillEffectsProps) {
    const { t } = useTranslations();
    const skillEffects = data?.heroes[heroName]?.[skillKey];

    if (!data) return null;

    if (!data.heroes[heroName]) {
        const mechanics = getSkillMechanics(fallbackText)
            .map((term) => ({ id: term, name: term, description: t(`glossary.${term}`, ''), icon: getBuffIcon(term), type: null }))
            .filter((effect) => effect.icon);
        return <EffectList effects={mechanics} />;
    }

    if (!skillEffects) return null;

    const effects = [...skillEffects.buffs, ...skillEffects.debuffs]
        .map((id) => ({ id, info: data.effects[id] }))
        .filter(({ info }) => info)
        .map(({ id, info }) => {
            // El glosario está indexado por el nombre en inglés sin aclaraciones como "(Undispellable)"
            const glossaryKey = info.name.replace(/\s*\(.*\)\s*$/, '');
            return {
                id,
                name: info.name,
                description: t(`glossary.${glossaryKey}`, info.description),
                icon: info.icon ? `/images/buff/${info.icon}` : null,
                type: info.type,
            };
        });

    return <EffectList effects={effects} />;
}

interface DisplayEffect {
    id: string;
    name: string;
    description: string;
    icon: string | null;
    type: 'buff' | 'debuff' | null;
}

function EffectList({ effects }: { effects: DisplayEffect[] }) {
    if (effects.length === 0) return null;

    return (
        <TooltipProvider>
            <div className="flex flex-wrap gap-1.5 mb-2 pb-2 border-b border-white/5">
                {effects.map((effect) => (
                    <Tooltip key={effect.id} delayDuration={150}>
                        <TooltipTrigger asChild>
                            <span className="cursor-help inline-flex" tabIndex={0} aria-label={effect.name}>
                                {effect.icon ? (
                                    <Image src={effect.icon} alt={effect.name} width={24} height={24} className="w-6 h-6" unoptimized />
                                ) : (
                                    <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] leading-5 ${
                                            effect.type === 'debuff' ? 'bg-red-900/40 text-red-300' : 'bg-blue-900/40 text-blue-300'
                                        }`}
                                    >
                                        {effect.name}
                                    </span>
                                )}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs bg-black/90 border-white/10 text-white">
                            <p className={`font-semibold ${effect.type === 'debuff' ? 'text-red-300' : 'text-blue-300'}`}>{effect.name}</p>
                            {effect.description && <p className="text-xs text-gray-300 mt-0.5">{effect.description}</p>}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    );
}

interface SkillIconProps {
    heroCode: string;
    skillKey: string;
}

/**
 * Ícono de skill: primero el del API (Hostinger); si no existe, el de CeciliaBot; si tampoco, se oculta.
 */
export function SkillIcon({ heroCode, skillKey }: SkillIconProps) {
    const number = skillKey.replace('S', '');
    const sources = [
        `${(process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '')}/images/skills/sk_${heroCode}_${number}.png`,
        `${CECILIA_SKILL_ICONS}/sk_${heroCode}_${number}.png`,
    ];
    const [index, setIndex] = useState(0);

    if (index >= sources.length) return null;

    return (
        <Image
            src={sources[index]}
            alt={`${skillKey} icon`}
            width={56}
            height={56}
            className="rounded-lg"
            unoptimized
            onError={() => setIndex((current) => current + 1)}
        />
    );
}
