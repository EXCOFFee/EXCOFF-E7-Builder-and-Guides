'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/hooks/useTranslations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const ELEMENTS = ['fire', 'ice', 'earth', 'light', 'dark'];
const CLASSES = ['knight', 'warrior', 'thief', 'ranger', 'mage', 'soul_weaver'];

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

// Element colors for indicator dots
const ELEMENT_COLORS: Record<string, string> = {
    fire: 'bg-red-500',
    ice: 'bg-blue-500',
    earth: 'bg-green-500',
    light: 'bg-yellow-400',
    dark: 'bg-purple-600',
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

import { SET_IMAGES, formatSetName } from '@/lib/sets';

const CLASS_NAMES: Record<string, string> = {
    knight: 'Knight',
    warrior: 'Warrior',
    thief: 'Thief',
    ranger: 'Ranger',
    mage: 'Mage',
    soul_weaver: 'Soul Weaver',
};


interface Build {
    id: number;
    title: string;
    description: string;
    min_stats: Record<string, number>;
    primary_set: string;
    secondary_set: string;
    likes: number;
    views: number;
    is_anonymous: boolean;
    user: {
        id: number;
        name: string;
        avatar: string | null;
    } | null;
    hero: {
        id: number;
        name: string;
        slug: string;
        portrait: string;
        element: string;
        class: string;
    };
    artifact: {
        id: number;
        name: string;
        icon: string;
    } | null;
    created_at: string;
}

export default function BuildsPage() {
    const { t } = useTranslations();
    const [search, setSearch] = useState('');
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedRarity, setSelectedRarity] = useState<number | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['builds', search, selectedElement, selectedClass, selectedRarity],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (selectedElement) params.append('element', selectedElement);
            if (selectedClass) params.append('class', selectedClass);
            if (selectedRarity) params.append('rarity', selectedRarity.toString());

            const response = await fetch(`${API_URL}/builds?${params}`);
            if (!response.ok) throw new Error('Failed to fetch builds');
            return response.json();
        },
    });

    const builds: Build[] = data?.data || [];

    return (
        <div className="min-h-screen bg-void-glow py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div className="text-center md:text-left">
                        <h1 className="font-display text-4xl md:text-5xl text-gold-gradient tracking-wide mb-2">
                            {t('builds.title', 'Community Builds')}
                        </h1>
                        <p className="text-slate-400">
                            {t('builds.description', 'Explore and share hero builds created by the community')}
                        </p>
                    </div>
                    <Link href="/builds/create">
                        <Button className="btn-gold px-6 py-2.5 rounded-lg shadow-lg shadow-e7-gold/20 hover:shadow-e7-gold/40 transition-all">
                            + {t('builds.createBuild', 'Create Build')}
                        </Button>
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="mb-8 space-y-4 glass-panel p-4 rounded-xl">
                    <Input
                        placeholder={t('builds.searchPlaceholder', 'Search builds...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-md bg-e7-void/50 border-e7-gold/20 text-slate-200 placeholder:text-slate-500 focus:border-e7-gold focus:ring-e7-gold/30 transition-all"
                    />

                    {/* Element Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-400 text-sm mr-2">{t('heroes.filterElement', 'Element')}:</span>
                        {Object.entries(ELEMENT_IMAGES).map(([el, img]) => (
                            <button
                                key={el}
                                onClick={() => setSelectedElement(selectedElement === el ? null : el)}
                                className={`relative w-10 h-10 rounded-lg transition-all ${selectedElement === el
                                    ? 'ring-2 ring-e7-gold bg-e7-gold/20 scale-110'
                                    : 'hover:bg-e7-panel/50 hover:scale-105 opacity-70 hover:opacity-100'
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
                        <span className="text-slate-400 text-sm mr-2">{t('heroes.filterClass', 'Class')}:</span>
                        {Object.entries(CLASS_IMAGES).map(([cls, img]) => (
                            <button
                                key={cls}
                                onClick={() => setSelectedClass(selectedClass === cls ? null : cls)}
                                className={`relative w-10 h-10 rounded-lg transition-all ${selectedClass === cls
                                    ? 'ring-2 ring-e7-gold bg-e7-gold/20 scale-110'
                                    : 'hover:bg-e7-panel/50 hover:scale-105 opacity-70 hover:opacity-100'
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
                        <span className="text-slate-400 text-sm mr-2">{t('heroes.filterRarity', 'Rarity')}:</span>
                        {[5, 4, 3].map((rarity) => (
                            <button
                                key={rarity}
                                onClick={() => setSelectedRarity(selectedRarity === rarity ? null : rarity)}
                                className={`px-3 py-2 rounded-lg transition-all font-semibold text-sm ${selectedRarity === rarity
                                    ? 'ring-2 ring-e7-gold bg-e7-gold/20 scale-110'
                                    : 'hover:bg-e7-panel/50 hover:scale-105 opacity-70 hover:opacity-100 bg-e7-void/50'
                                    } ${rarity === 5 ? 'text-e7-gold' : rarity === 4 ? 'text-purple-400' : 'text-blue-400'}`}
                                title={`${rarity} ${t('common.stars', 'Stars')}`}
                            >
                                {'★'.repeat(rarity)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Builds Grid */}
                {isLoading ? (
                    <div className="text-center py-12 text-slate-400">
                        {t('common.loading', 'Loading...')}
                    </div>
                ) : builds.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        {t('builds.noBuilds', 'No builds available yet.')}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {builds.map((build) => (
                            <Link key={build.id} href={`/builds/${build.id}`}>
                                <div className="card-fantasy bg-gradient-to-b from-e7-panel to-e7-void rounded-xl overflow-hidden h-full group">
                                    {/* Hero Header */}
                                    <div className="flex items-center gap-3 p-4 border-b border-e7-gold/10 bg-e7-dark/30">
                                        <div className="relative">
                                            <Image
                                                src={build.hero.portrait}
                                                alt={build.hero.name}
                                                width={60}
                                                height={60}
                                                className="rounded-lg ring-2 ring-e7-gold/20 group-hover:ring-e7-gold/50 transition-all"
                                                unoptimized
                                            />
                                            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-e7-dark ${ELEMENT_COLORS[build.hero.element]}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-slate-100 font-semibold group-hover:text-e7-gold transition-colors">{build.hero.name}</h3>
                                            <p className="text-xs text-slate-500">{CLASS_NAMES[build.hero.class] || build.hero.class}</p>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h4 className="text-lg font-medium text-e7-gold mb-3 line-clamp-1">
                                            {build.title}
                                        </h4>

                                        {/* Sets */}
                                        <div className="flex gap-2 mb-3 flex-wrap">
                                            {build.primary_set && (
                                                <span className="px-3 py-1.5 text-sm glass-panel text-purple-300 rounded-lg flex items-center gap-2 border border-purple-500/30">
                                                    {SET_IMAGES[build.primary_set] && (
                                                        <Image
                                                            src={SET_IMAGES[build.primary_set]}
                                                            alt={build.primary_set}
                                                            width={32}
                                                            height={32}
                                                            unoptimized
                                                        />
                                                    )}
                                                    {formatSetName(build.primary_set)}
                                                </span>
                                            )}
                                            {build.secondary_set && (
                                                <span className="px-3 py-1.5 text-sm glass-panel text-blue-300 rounded-lg flex items-center gap-2 border border-blue-500/30">
                                                    {SET_IMAGES[build.secondary_set] && (
                                                        <Image
                                                            src={SET_IMAGES[build.secondary_set]}
                                                            alt={build.secondary_set}
                                                            width={32}
                                                            height={32}
                                                            unoptimized
                                                        />
                                                    )}
                                                    {formatSetName(build.secondary_set)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Artifact */}
                                        {build.artifact && (
                                            <div className="flex items-center gap-3 mb-3">
                                                <Image
                                                    src={build.artifact.icon}
                                                    alt={build.artifact.name}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-lg ring-2 ring-e7-gold/30"
                                                    unoptimized
                                                />
                                                <span className="text-base text-slate-300 font-medium">{build.artifact.name}</span>
                                            </div>
                                        )}

                                        {/* Stats Preview */}
                                        {build.min_stats && Object.keys(build.min_stats).length > 0 && (
                                            <div className="grid grid-cols-3 gap-1 text-xs text-slate-500 mb-3">
                                                {Object.entries(build.min_stats).slice(0, 6).map(([stat, value]) => (
                                                    <span key={stat}>{stat}: {value}</span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-3 border-t border-e7-gold/10">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                {!build.is_anonymous && build.user?.avatar && (
                                                    <Image
                                                        src={build.user.avatar}
                                                        alt={build.user.name}
                                                        width={20}
                                                        height={20}
                                                        className="rounded-full ring-1 ring-e7-gold/20"
                                                        unoptimized
                                                    />
                                                )}
                                                <span>{build.is_anonymous ? 'Anonymous' : build.user?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span className="flex items-center gap-1"><Image src="/images/ras-like.gif" alt="likes" width={16} height={16} unoptimized /> {build.likes}</span>
                                                <span>👁️ {build.views}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
