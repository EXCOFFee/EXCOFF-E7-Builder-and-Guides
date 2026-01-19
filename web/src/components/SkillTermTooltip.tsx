"use client"

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getBuffIcon } from '@/utils/buffIconMapper';

import { GLOSSARY } from '@/utils/glossary';

interface SkillTermTooltipProps {
    term: string;
    highlightClass?: string;
    children: React.ReactNode;
}

export function SkillTermTooltip({ term, highlightClass, children }: SkillTermTooltipProps) {
    const iconPath = getBuffIcon(term);

    // Case-insensitive lookup
    const glossaryKey = Object.keys(GLOSSARY).find(k => k.toLowerCase() === term.toLowerCase());
    const description = glossaryKey ? GLOSSARY[glossaryKey] : null;

    // If no description and no icon, just render text
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
