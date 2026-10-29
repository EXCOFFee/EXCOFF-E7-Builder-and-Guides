"use client"

import React from 'react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getBuffIcon } from '@/utils/buffIconMapper';
import { useTranslations } from '@/hooks/useTranslations';
import { effectTextByName, useHeroEffects } from '@/hooks/useHeroEffects';

interface SkillTermTooltipProps {
    term: string;
    highlightClass?: string;
    children: React.ReactNode;
}

export function SkillTermTooltip({ term, highlightClass, children }: SkillTermTooltipProps) {
    const { t } = useTranslations();
    const iconPath = getBuffIcon(term);

    // Si el término es un efecto de CeciliaBot, su texto (traducido por id); si no, el glosario
    // de mecánicas generales (messages/glossary), indexado por el término canónico en inglés.
    const effectText = effectTextByName(useHeroEffects(), term);
    const description = effectText?.description ?? t(`glossary.${term}`, '');
    const title = effectText?.name ?? term;

    // If no description (fallback matched empty string) and no icon, just render text
    if (!description && !iconPath) {
        return <span className={highlightClass}>{children}</span>;
    }

    return (
        <TooltipProvider>
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                    <span className="inline-flex items-center align-baseline gap-0.5 mx-0.5 cursor-help border-b border-dotted border-white/20">
                        <span className={highlightClass}>{children}</span>
                        {iconPath && (
                            // Ícono local chico: unoptimized para no gastar cuota de Vercel. alt vacío
                            // porque el término va escrito al lado.
                            <Image
                                src={iconPath}
                                alt=""
                                width={16}
                                height={16}
                                unoptimized
                                className="w-4 h-4 inline-block select-none pointer-events-none"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        )}
                    </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-slate-900 border-slate-700 text-slate-100">
                    <div className="flex flex-col gap-2 p-1">
                        <div className="font-bold flex items-center gap-2 text-base border-b border-slate-700 pb-1">
                            {iconPath && <Image src={iconPath} width={24} height={24} unoptimized className="w-6 h-6" alt="" />}
                            <span className="capitalize">{title}</span>
                        </div>
                        {description && (
                            <p className="text-sm leading-relaxed text-slate-300">
                                {description}
                            </p>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
