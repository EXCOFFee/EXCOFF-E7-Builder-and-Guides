'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from '@/hooks/useTranslations';

const ELEMENT_IMAGES: Record<string, string> = {
    fire: '/images/elements/ElementFire.png',
    ice: '/images/elements/ElementWater.png',
    earth: '/images/elements/ElementEarth.png',
    light: '/images/elements/ElementLight.png',
    dark: '/images/elements/ElementDark.png',
};

export interface HeroWithNote {
    id: number;
    name: string;
    slug: string;
    element: string;
    hero_code?: string;
    image_url?: string;
    portrait?: string;
    note?: string;
}

interface SynergyCounterCardProps {
    hero: HeroWithNote;
    type: 'synergy' | 'counter';
}

/**
 * SynergyCounterHeroCard - Card for synergy/counter heroes with expandable notes
 * Supports optional notes with "Show more/less" button for long text
 */
export function SynergyCounterHeroCard({ hero, type }: SynergyCounterCardProps) {
    const { t } = useTranslations();
    const [isExpanded, setIsExpanded] = useState(false);

    const isLong = hero.note && hero.note.length > 100;
    const isSynergy = type === 'synergy';

    const colors = isSynergy
        ? { bg: 'from-green-900/30 to-emerald-900/20', border: 'border-green-500/40', hoverBorder: 'hover:border-green-400/60', ring: 'ring-green-500/60', text: 'text-green-300', hoverText: 'group-hover:text-green-200', shadow: 'hover:shadow-green-500/20', glow: 'from-green-400/20 to-emerald-400/10' }
        : { bg: 'from-red-900/30 to-rose-900/20', border: 'border-red-500/40', hoverBorder: 'hover:border-red-400/60', ring: 'ring-red-500/60', text: 'text-red-300', hoverText: 'group-hover:text-red-200', shadow: 'hover:shadow-red-500/20', glow: 'from-red-400/20 to-rose-400/10' };

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '');
    const imageUrl = hero.hero_code
        ? `${apiUrl}/images/heroes/${hero.hero_code}_l.png`
        : (hero.image_url || hero.portrait || `/images/hero/${hero.slug}_s.png`);

    return (
        <div className={`group flex flex-col items-center p-4 rounded-xl bg-gradient-to-br ${colors.bg} border-2 ${colors.border} ${colors.hoverBorder} transition-all duration-300 backdrop-blur-sm shadow-lg ${colors.shadow} hover:-translate-y-1`}>
            <Link href={`/heroes/${hero.slug}`} className="flex flex-col items-center">
                <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors.glow} rounded-full blur-lg group-hover:blur-xl transition-all duration-300`}></div>
                    <Image
                        src={imageUrl}
                        alt={hero.name}
                        width={96}
                        height={96}
                        className={`w-24 h-24 rounded-full ring-2 ${colors.ring} group-hover:ring-3 object-cover relative z-10 shadow-xl group-hover:scale-105 transition-all duration-300`}
                        unoptimized
                    />
                    {ELEMENT_IMAGES[hero.element] && (
                        <Image
                            src={ELEMENT_IMAGES[hero.element]}
                            alt={hero.element}
                            width={20}
                            height={20}
                            className="absolute -bottom-1 -right-1 ring-2 ring-e7-dark rounded-full bg-e7-dark/90 backdrop-blur-sm z-20 shadow-lg"
                        />
                    )}
                </div>
                <span className={`mt-3 text-base ${colors.text} ${colors.hoverText} text-center font-semibold transition-colors duration-300`}>
                    {hero.name}
                </span>
            </Link>

            {/* Note with expandable text */}
            {hero.note && (
                <div className="mt-3 w-full text-center">
                    <p className="text-sm text-gray-300 leading-relaxed">
                        {isLong && !isExpanded ? (
                            <>
                                {hero.note.slice(0, 100)}...
                                <button
                                    onClick={(e) => { e.preventDefault(); setIsExpanded(true); }}
                                    className="text-e7-gold hover:underline ml-1"
                                >
                                    {t('common.showMore', 'more')}
                                </button>
                            </>
                        ) : (
                            <>
                                {hero.note}
                                {isLong && (
                                    <button
                                        onClick={(e) => { e.preventDefault(); setIsExpanded(false); }}
                                        className="text-e7-gold hover:underline ml-1 block mt-1"
                                    >
                                        {t('common.showLess', 'less')}
                                    </button>
                                )}
                            </>
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}

interface SynergyCounterSectionProps {
    title: string;
    heroes: HeroWithNote[];
    type: 'synergy' | 'counter';
}

/**
 * SynergyCounterSection - Section displaying a list of synergy or counter heroes with notes
 */
export function SynergyCounterSection({ title, heroes, type }: SynergyCounterSectionProps) {
    if (!heroes || heroes.length === 0) return null;

    return (
        <div className="mb-6">
            <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-e7-text-gold to-e7-gold font-bold text-xl mb-4 flex items-center gap-2">
                {title}
                <span className="text-gray-500 text-base font-normal">({heroes.length})</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {heroes.map(hero => (
                    <SynergyCounterHeroCard key={hero.id} hero={hero} type={type} />
                ))}
            </div>
        </div>
    );
}
