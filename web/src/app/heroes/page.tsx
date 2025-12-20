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
    'commander-lorina': '85% center',
    'falconer-kluri': '85% center',
    'furious': '85% center',
    'kayron': '85% center',
    'kikirat-v2': '85% center',
    'luna': '85% center',
    'maid-chloe': '85% center',
    'mascot-hazel': '85% center',
    'righteous-thief-roozid': '85% center',
    'roaming-warrior-leo': '85% center',
    'seaside-bellona': '85% center',
    'specimen-sez': '85% center',
    'violet': '85% center',
    'vivian': '85% center',
    'watcher-schuri': '85% center',
    'zeno': '85% center',
};

export default function HeroesPage() {
    const { t } = useTranslations();
    const [search, setSearch] = useState('');
    const [elementFilter, setElementFilter] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [rarityFilter, setRarityFilter] = useState<number | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['heroes', search, elementFilter, classFilter, rarityFilter],
        queryFn: async () => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (elementFilter) params.element = elementFilter;
            if (classFilter) params.class = classFilter;
            if (rarityFilter) params.rarity = rarityFilter.toString();

            const response = await heroApi.list(params);
            return response.data;
        },
    });

    const heroes: Hero[] = data?.data || [];

    return (
        <div className="min-h-screen bg-void-glow py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="font-display text-4xl md:text-5xl text-gold-gradient mb-3 tracking-wide">{t('heroes.title', 'Hero Database')}</h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">{t('heroes.description', 'Explore all Epic Seven heroes, their stats and builds')}</p>
                </div>

                {/* Filters */}
                <div className="mb-8 space-y-4 glass-panel p-4 rounded-xl">
                    <Input
                        placeholder={t('heroes.searchPlaceholder', 'Search heroes...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-md bg-e7-void/50 border-e7-gold/20 text-slate-200 placeholder:text-slate-500 focus:border-e7-gold focus:ring-e7-gold/30 transition-all"
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

                    {/* Rarity Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-400 text-sm mr-2">{t('heroes.filterRarity', 'Rarity')}:</span>
                        {[5, 4, 3].map((rarity) => (
                            <button
                                key={rarity}
                                onClick={() => setRarityFilter(rarityFilter === rarity ? null : rarity)}
                                className={`px-3 py-2 rounded-lg transition-all font-semibold text-sm ${rarityFilter === rarity
                                    ? 'ring-2 ring-e7-gold bg-e7-gold/20 scale-110'
                                    : 'hover:bg-e7-panel hover:scale-105 opacity-70 hover:opacity-100 bg-e7-void/50'
                                    } ${rarity === 5 ? 'text-e7-gold' : rarity === 4 ? 'text-purple-400' : 'text-blue-400'}`}
                                title={`${rarity} ${t('common.stars', 'Stars')}`}
                            >
                                {'★'.repeat(rarity)}
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {heroes.length === 0 ? (
                            <p className="text-slate-400 col-span-full text-center py-10">
                                {t('heroes.noResults', 'No heroes found.')}
                            </p>
                        ) : (
                            heroes.map((hero) => (
                                <Link key={hero.id} href={`/heroes/${hero.slug}`}>
                                    <div className="card-fantasy bg-gradient-to-b from-e7-panel to-e7-void rounded-xl overflow-hidden cursor-pointer h-full group relative">
                                        {/* Rarity glow overlay */}
                                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${hero.rarity === 5 ? 'bg-gradient-to-t from-e7-gold/20 via-transparent to-transparent' :
                                            hero.rarity === 4 ? 'bg-gradient-to-t from-purple-500/20 via-transparent to-transparent' :
                                                'bg-gradient-to-t from-blue-500/10 via-transparent to-transparent'
                                            }`} />

                                        {/* Hero Image Container */}
                                        <div className="aspect-square bg-gradient-to-br from-e7-void to-e7-dark relative overflow-hidden">
                                            {hero.image_url ? (
                                                <Image
                                                    src={hero.image_url}
                                                    alt={hero.name}
                                                    width={200}
                                                    height={200}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    style={HERO_POSITION_OVERRIDE[hero.slug] ? { objectPosition: HERO_POSITION_OVERRIDE[hero.slug] } : undefined}
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Image
                                                        src={CLASS_IMAGES[hero.class] || '/images/classes/ClassWarrior.png'}
                                                        alt={hero.class}
                                                        width={80}
                                                        height={80}
                                                        className="opacity-30"
                                                    />
                                                </div>
                                            )}

                                            {/* Element & Class floating badges */}
                                            <div className="absolute top-2 left-2 flex gap-1">
                                                <div className="w-7 h-7 rounded-lg glass-panel flex items-center justify-center">
                                                    <Image
                                                        src={ELEMENT_IMAGES[hero.element] || '/images/elements/ElementFire.png'}
                                                        alt={ELEMENT_NAMES[hero.element] || hero.element}
                                                        width={20}
                                                        height={20}
                                                        className="w-5 h-5"
                                                    />
                                                </div>
                                                <div className="w-7 h-7 rounded-lg glass-panel flex items-center justify-center">
                                                    <Image
                                                        src={CLASS_IMAGES[hero.class] || '/images/classes/ClassWarrior.png'}
                                                        alt={CLASS_NAMES[hero.class] || hero.class}
                                                        width={20}
                                                        height={20}
                                                        className="w-5 h-5"
                                                    />
                                                </div>
                                            </div>

                                            {/* Rarity stars badge */}
                                            <div className="absolute top-2 right-2 px-2 py-1 rounded-lg glass-panel">
                                                <span className={`text-xs font-bold ${hero.rarity === 5 ? 'text-e7-gold' :
                                                    hero.rarity === 4 ? 'text-purple-400' :
                                                        'text-blue-400'
                                                    }`}>
                                                    {'★'.repeat(hero.rarity)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Hero Name Footer */}
                                        <div className="p-3 bg-gradient-to-t from-e7-dark/80 to-transparent -mt-8 relative z-10 pt-10">
                                            <h3 className="text-slate-100 text-sm font-semibold truncate group-hover:text-e7-gold transition-colors duration-300 text-center">
                                                {hero.name}
                                            </h3>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
