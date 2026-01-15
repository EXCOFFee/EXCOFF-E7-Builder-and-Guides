'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/hooks/useTranslations';
import { useHeroTranslations } from '@/hooks/useNameTranslations';
import { appendImageVersion } from '@/lib/heroImages';

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

const LANGUAGES = ['all', 'en', 'es', 'ko', 'ja', 'zh', 'pt'];
const LANGUAGE_LABELS: Record<string, string> = {
    all: 'All Languages',
    en: 'English',
    es: 'Español',
    ko: '한국어',
    ja: '日本語',
    zh: '中文',
    pt: 'Português',
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
    avg_rating: number;
    rating_count: number;
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
    language?: string;
}

export default function BuildsPage() {
    const { t, locale } = useTranslations();
    const { translateHeroName } = useHeroTranslations();
    const [search, setSearch] = useState('');
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedRarity, setSelectedRarity] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<'newest' | 'views_desc' | 'views_asc' | 'likes_desc' | 'likes_asc'>('newest');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

    // Advanced filters
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [primarySet, setPrimarySet] = useState<string | null>(null);
    const [minSpeed, setMinSpeed] = useState<string>('');

    const { data, isLoading } = useQuery({
        queryKey: ['builds', search, selectedElement, selectedClass, selectedRarity, primarySet, minSpeed, selectedLanguage, sortBy, locale],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (selectedElement) params.append('element', selectedElement);
            if (selectedClass) params.append('class', selectedClass);
            if (selectedRarity) params.append('rarity', selectedRarity.toString());
            if (primarySet) params.append('primary_set', primarySet);
            if (minSpeed && parseInt(minSpeed) > 0) params.append('min_speed', minSpeed);
            if (selectedLanguage && selectedLanguage !== 'all') params.append('language', selectedLanguage);

            // Server-side sorting - map frontend values to backend params
            const sortMap: Record<string, { sort: string; order: string }> = {
                'newest': { sort: 'newest', order: 'desc' },
                'views_desc': { sort: 'views', order: 'desc' },
                'views_asc': { sort: 'views', order: 'asc' },
                'likes_desc': { sort: 'likes', order: 'desc' },
                'likes_asc': { sort: 'likes', order: 'asc' },
            };
            const sortConfig = sortMap[sortBy] || sortMap['newest'];
            params.append('sort', sortConfig.sort);
            params.append('order', sortConfig.order);

            // Add user's interface locale for artifact translation
            params.append('lang', locale);

            const response = await fetch(`${API_URL}/builds?${params}`);
            if (!response.ok) throw new Error('Failed to fetch builds');
            return response.json();
        },
    });

    // Use builds directly from API (already sorted server-side)
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
                        <p className="font-display text-slate-400">
                            {t('builds.description', 'Explore and share hero builds created by the community')}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/builds/compare">
                            <Button variant="outline" className="border-e7-gold/30 text-e7-gold hover:bg-e7-gold/10 px-6 py-2.5 rounded-lg">
                                {t('builds.compare', 'Compare')}
                            </Button>
                        </Link>
                        <Link href="/builds/create">
                            <Button className="btn-gold px-6 py-2.5 rounded-lg shadow-lg shadow-e7-gold/20 hover:shadow-e7-gold/40 transition-all">
                                + {t('builds.createBuild', 'Create Build')}
                            </Button>
                        </Link>
                    </div>
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

                    {/* Sort Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-400 text-sm mr-2">{t('common.sortBy', 'Sort by')}:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                            className="bg-e7-void/50 border border-e7-gold/20 text-slate-200 rounded-lg pl-3 pr-10 py-2 text-sm focus:border-e7-gold focus:ring-e7-gold/30 cursor-pointer"
                        >
                            <option value="newest">{t('common.newest', 'Newest')}</option>
                            <option value="views_desc">{t('common.viewsHigh', 'Views (High)')}</option>
                            <option value="views_asc">{t('common.viewsLow', 'Views (Low)')}</option>
                            <option value="likes_desc">{t('common.likesHigh', 'Likes (High)')}</option>
                            <option value="likes_asc">{t('common.likesLow', 'Likes (Low)')}</option>
                        </select>

                        {/* Language Filter */}
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="bg-e7-void/50 border border-e7-gold/20 text-slate-200 rounded-lg pl-3 pr-10 py-2 text-sm focus:border-e7-gold focus:ring-e7-gold/30 cursor-pointer"
                        >
                            {LANGUAGES.map((lang) => (
                                <option key={lang} value={lang}>{LANGUAGE_LABELS[lang]}</option>
                            ))}
                        </select>

                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className={`ml-4 px-3 py-2 rounded-lg text-sm transition-all ${showAdvancedFilters ? 'bg-e7-gold/20 text-e7-gold' : 'bg-e7-void/50 text-slate-400 hover:text-slate-200'}`}
                        >
                            {t('builds.advancedFilters', 'Advanced Filters')}
                        </button>
                    </div>

                    {/* Advanced Filters Panel */}
                    {showAdvancedFilters && (
                        <div className="mt-4 p-4 bg-e7-void/50 rounded-lg border border-e7-gold/20 space-y-4">
                            {/* Set Filter */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-slate-400 text-sm mr-2">{t('builds.filterSet', 'Set')}:</span>
                                {Object.entries(SET_IMAGES).map(([set, img]) => (
                                    <button
                                        key={set}
                                        onClick={() => setPrimarySet(primarySet === set ? null : set)}
                                        className={`relative w-10 h-10 rounded-lg transition-all ${primarySet === set
                                            ? 'ring-2 ring-e7-gold bg-e7-gold/20 scale-110'
                                            : 'hover:bg-e7-panel/50 hover:scale-105 opacity-70 hover:opacity-100'
                                            }`}
                                        title={formatSetName(set)}
                                    >
                                        <Image
                                            src={img}
                                            alt={formatSetName(set)}
                                            width={40}
                                            height={40}
                                            className="w-full h-full object-contain"
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Min Speed Filter */}
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400 text-sm">{t('builds.minSpeed', 'Min Speed')}:</span>
                                <Input
                                    type="number"
                                    placeholder="200"
                                    value={minSpeed}
                                    onChange={(e) => setMinSpeed(e.target.value)}
                                    className="w-24 bg-e7-void border-e7-gold/30 text-white"
                                />

                                {/* Clear filters */}
                                <button
                                    onClick={() => {
                                        setPrimarySet(null);
                                        setMinSpeed('');
                                    }}
                                    className="ml-4 text-sm text-gray-500 hover:text-e7-gold"
                                >
                                    {t('common.clearFilters', 'Clear filters')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Builds Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="card-fantasy bg-gradient-to-b from-e7-panel to-e7-void rounded-xl overflow-hidden h-full animate-pulse">
                                {/* Skeleton Hero Header */}
                                <div className="flex items-center gap-4 p-4 border-b border-e7-gold/10 bg-e7-dark/30">
                                    <div className="w-[100px] h-[100px] bg-slate-700 rounded-lg" />
                                    <div className="flex-1">
                                        <div className="h-5 bg-slate-700 rounded w-3/4 mb-2" />
                                        <div className="h-4 bg-slate-800 rounded w-1/2" />
                                    </div>
                                </div>
                                {/* Skeleton Body */}
                                <div className="p-4">
                                    <div className="h-5 bg-slate-700 rounded w-2/3 mb-3" />
                                    <div className="flex gap-2 mb-3">
                                        <div className="h-8 bg-slate-700 rounded-lg w-24" />
                                        <div className="h-8 bg-slate-700 rounded-lg w-20" />
                                    </div>
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-16 h-16 bg-slate-700 rounded-xl" />
                                        <div className="h-5 bg-slate-700 rounded w-1/2" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[...Array(6)].map((_, j) => (
                                            <div key={j} className="h-12 bg-slate-800 rounded-lg" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                    <div className="flex items-center gap-4 p-4 border-b border-e7-gold/10 bg-e7-dark/30">
                                        <div className="relative w-[80px] h-[80px] flex-shrink-0">
                                            <div className="w-full h-full rounded-lg overflow-hidden ring-2 ring-e7-gold/20 group-hover:ring-e7-gold/50 transition-all">
                                                <Image
                                                    src={appendImageVersion(build.hero.portrait)}
                                                    alt={build.hero.name}
                                                    width={80}
                                                    height={80}
                                                    className="w-full h-full object-cover object-top"
                                                    unoptimized
                                                />
                                            </div>
                                            <Image
                                                src={ELEMENT_IMAGES[build.hero.element] || '/images/elements/ElementFire.png'}
                                                alt={build.hero.element}
                                                width={24}
                                                height={24}
                                                className="absolute -bottom-1 -right-1 w-6 h-6 ring-2 ring-e7-dark rounded-full bg-e7-dark"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-lg text-slate-100 font-semibold group-hover:text-e7-gold transition-colors">{translateHeroName(build.hero.name)}</h3>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm text-slate-500">{CLASS_NAMES[build.hero.class] || build.hero.class}</p>
                                                {build.language && build.language !== 'en' && (
                                                    <span className="text-xs text-e7-gold/70 bg-e7-gold/10 px-2 py-0.5 rounded">
                                                        {LANGUAGE_LABELS[build.language] || build.language}
                                                    </span>
                                                )}
                                            </div>
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
                                                        />
                                                    )}
                                                    {formatSetName(build.secondary_set)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Artifact */}
                                        {build.artifact && (
                                            <div className="flex items-center gap-4 mb-3">
                                                <Image
                                                    src={build.artifact.icon}
                                                    alt={build.artifact.name}
                                                    width={72}
                                                    height={72}
                                                    className="rounded-xl ring-2 ring-e7-gold/30"
                                                    unoptimized
                                                />
                                                <span className="text-lg text-slate-300 font-medium">{build.artifact.name}</span>
                                            </div>
                                        )}

                                        {/* Stats Preview */}
                                        {build.min_stats && Object.keys(build.min_stats).length > 0 && (
                                            <div className="grid grid-cols-3 gap-2 mb-3">
                                                {Object.entries(build.min_stats).slice(0, 6).map(([stat, value]) => {
                                                    const statConfig: Record<string, { label: string; color: string }> = {
                                                        atk: { label: 'ATK', color: 'text-red-400' },
                                                        def: { label: 'DEF', color: 'text-blue-400' },
                                                        hp: { label: 'HP', color: 'text-green-400' },
                                                        spd: { label: 'SPD', color: 'text-yellow-400' },
                                                        crit_chance: { label: 'CRIT', color: 'text-orange-400' },
                                                        crit_dmg: { label: 'C.DMG', color: 'text-purple-400' },
                                                        eff: { label: 'EFF', color: 'text-cyan-400' },
                                                        res: { label: 'RES', color: 'text-pink-400' },
                                                    };
                                                    const config = statConfig[stat] || { label: stat.toUpperCase(), color: 'text-slate-400' };
                                                    const isPercent = ['crit_chance', 'crit_dmg', 'eff', 'res'].includes(stat);
                                                    return (
                                                        <div key={stat} className="bg-e7-void/60 rounded-lg p-2 text-center border border-e7-gold/10">
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-wide">{config.label}</p>
                                                            <p className={`text-sm font-bold ${config.color}`}>
                                                                {typeof value === 'number' ? value.toLocaleString() : value}{isPercent ? '%' : ''}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
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
