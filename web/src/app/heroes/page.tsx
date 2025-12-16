'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { heroApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTranslations } from '@/hooks/useTranslations';

interface Hero {
    id: number;
    code: string;
    name: string;
    slug: string;
    element: string;
    class: string;
    rarity: number;
    image_url: string;
}

// Element to image mapping
const ELEMENT_IMAGES: Record<string, string> = {
    fire: '/images/elements/ElementFire.png',
    ice: '/images/elements/ElementWater.png',
    earth: '/images/elements/ElementEarth.png',
    light: '/images/elements/ElementLight.png',
    dark: '/images/elements/ElementDark.png',
};

const ELEMENT_NAMES: Record<string, string> = {
    fire: 'Fire',
    ice: 'Ice',
    earth: 'Earth',
    light: 'Light',
    dark: 'Dark',
};

// Class to image mapping
const CLASS_IMAGES: Record<string, string> = {
    knight: '/images/classes/ClassKnight.png',
    warrior: '/images/classes/ClassWarrior.png',
    thief: '/images/classes/ClassThief.png',
    ranger: '/images/classes/ClassRanger.png',
    mage: '/images/classes/ClassMage.png',
    soul_weaver: '/images/classes/ClassSoul_Waver.png',
};

const CLASS_NAMES: Record<string, string> = {
    knight: 'Knight',
    warrior: 'Warrior',
    thief: 'Thief',
    ranger: 'Ranger',
    mage: 'Mage',
    soul_weaver: 'Soul Weaver',
};

// Hero portraits that need custom positioning (faces cut off with center)
// Values: CSS object-position (higher % = shows more of the right side)
const HERO_POSITION_OVERRIDE: Record<string, string> = {
    'apocalypse-ravi': '85% center',
    'assassin-cidd': '85% center',
    'bask': '85% center',
    'chaos-sect-axe': '85% center',
    'chaos-inquisitor': '85% center',
};

export default function HeroesPage() {
    const { t } = useTranslations();
    const [search, setSearch] = useState('');
    const [elementFilter, setElementFilter] = useState('');
    const [classFilter, setClassFilter] = useState('');

    const { data, isLoading, error } = useQuery({
        queryKey: ['heroes', search, elementFilter, classFilter],
        queryFn: async () => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (elementFilter) params.element = elementFilter;
            if (classFilter) params.class = classFilter;

            const response = await heroApi.list(params);
            return response.data;
        },
    });

    const heroes: Hero[] = data?.data || [];

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-display text-4xl text-e7-text-gold mb-2">{t('heroes.title', 'Hero Database')}</h1>
                    <p className="text-gray-400">{t('heroes.description', 'Explore all Epic Seven heroes, their stats and builds')}</p>
                </div>

                {/* Filters */}
                <div className="mb-8 space-y-4">
                    <Input
                        placeholder={t('heroes.searchPlaceholder', 'Search heroes...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-xs bg-e7-panel border-e7-gold/30 text-white placeholder:text-gray-500"
                    />

                    {/* Element Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-400 text-sm mr-2">{t('heroes.filterElement', 'Element')}:</span>
                        {Object.entries(ELEMENT_IMAGES).map(([el, img]) => (
                            <button
                                key={el}
                                onClick={() => setElementFilter(elementFilter === el ? '' : el)}
                                className={`relative w-10 h-10 rounded-lg transition-all ${elementFilter === el
                                    ? 'ring-2 ring-e7-gold bg-e7-gold/20 scale-110'
                                    : 'hover:bg-e7-panel hover:scale-105 opacity-70 hover:opacity-100'
                                    }`}
                                title={ELEMENT_NAMES[el]}
                            >
                                <Image
                                    src={img}
                                    alt={ELEMENT_NAMES[el]}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-contain"
                                />
                            </button>
                        ))}
                    </div>

                    {/* Class Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-400 text-sm mr-2">{t('heroes.filterClass', 'Class')}:</span>
                        {Object.entries(CLASS_IMAGES).map(([cls, img]) => (
                            <button
                                key={cls}
                                onClick={() => setClassFilter(classFilter === cls ? '' : cls)}
                                className={`relative w-10 h-10 rounded-lg transition-all ${classFilter === cls
                                    ? 'ring-2 ring-e7-gold bg-e7-gold/20 scale-110'
                                    : 'hover:bg-e7-panel hover:scale-105 opacity-70 hover:opacity-100'
                                    }`}
                                title={CLASS_NAMES[cls]}
                            >
                                <Image
                                    src={img}
                                    alt={CLASS_NAMES[cls]}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-contain"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="lg" text={t('heroes.loadingHeroes', 'Loading heroes...')} />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center text-red-400 py-20">
                        <p>{t('heroes.loadError', 'Error loading heroes. Make sure the API is running.')}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            API URL: {process.env.NEXT_PUBLIC_API_URL || t('common.notConfigured', 'Not configured')}
                        </p>
                    </div>
                )}

                {/* Heroes Grid */}
                {!isLoading && !error && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {heroes.length === 0 ? (
                            <p className="text-gray-400 col-span-full text-center py-10">
                                {t('heroes.noResults', 'No heroes found.')}
                            </p>
                        ) : (
                            heroes.map((hero) => (
                                <Link key={hero.id} href={`/heroes/${hero.slug}`}>
                                    <Card className="bg-e7-panel border-e7-gold/20 hover:border-e7-gold transition-all hover:scale-105 cursor-pointer h-full group">
                                        <CardHeader className="pb-2">
                                            <div className="aspect-square bg-e7-void/50 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                                                {hero.image_url ? (
                                                    <Image
                                                        src={hero.image_url}
                                                        alt={hero.name}
                                                        width={200}
                                                        height={200}
                                                        className="w-full h-full object-cover"
                                                        style={HERO_POSITION_OVERRIDE[hero.slug] ? { objectPosition: HERO_POSITION_OVERRIDE[hero.slug] } : undefined}
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <Image
                                                        src={CLASS_IMAGES[hero.class] || '/images/classes/ClassWarrior.png'}
                                                        alt={hero.class}
                                                        width={80}
                                                        height={80}
                                                        className="opacity-50"
                                                    />
                                                )}
                                            </div>
                                            <CardTitle className="text-white text-sm font-semibold truncate group-hover:text-e7-gold transition-colors">
                                                {hero.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="flex gap-2 items-center">
                                                {/* Element Icon */}
                                                <div className="relative group/tooltip">
                                                    <Image
                                                        src={ELEMENT_IMAGES[hero.element] || '/images/elements/ElementFire.png'}
                                                        alt={ELEMENT_NAMES[hero.element] || hero.element}
                                                        width={24}
                                                        height={24}
                                                        className="w-6 h-6"
                                                    />
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-e7-void border border-e7-gold/30 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                        {ELEMENT_NAMES[hero.element]}
                                                    </span>
                                                </div>

                                                {/* Class Icon */}
                                                <div className="relative group/tooltip">
                                                    <Image
                                                        src={CLASS_IMAGES[hero.class] || '/images/classes/ClassWarrior.png'}
                                                        alt={CLASS_NAMES[hero.class] || hero.class}
                                                        width={24}
                                                        height={24}
                                                        className="w-6 h-6"
                                                    />
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-e7-void border border-e7-gold/30 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                        {CLASS_NAMES[hero.class]}
                                                    </span>
                                                </div>

                                                {/* Stars */}
                                                <span className="text-e7-text-gold text-xs ml-auto">
                                                    {'★'.repeat(hero.rarity)}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
