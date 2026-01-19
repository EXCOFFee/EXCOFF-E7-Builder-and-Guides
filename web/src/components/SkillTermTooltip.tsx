"use client"

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getBuffIcon } from '@/utils/buffIconMapper';
import { useTranslations } from '@/hooks/useTranslations';

interface SkillTermTooltipProps {
    term: string;
    highlightClass?: string;
    children: React.ReactNode;
}

export function SkillTermTooltip({ term, highlightClass, children }: SkillTermTooltipProps) {
    const { t } = useTranslations();
    const iconPath = getBuffIcon(term);

    // Look up term in glossary translations
    // Ensure case-insensitive lookup if direct key fails (best effort)
    // Note: t() usually requires exact key. Dynamic lookup can be tricky.
    // For now, assume key matches exactly or try to match common casing.
    const description = t(`glossary.${term}`, '');

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
                            <img
                                src={iconPath}
                                alt={term}
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
                            {iconPath && <img src={iconPath} className="w-6 h-6" alt="" />}
                            <span className="capitalize">{term}</span>
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
