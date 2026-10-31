'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { guideApi, heroApi } from '@/lib/api';
import { CONTENT_LANGUAGES, languageLabel } from '@/lib/languages';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTranslations } from '@/hooks/useTranslations';

interface Guide {
    id: number;
    title: string;
    slug: string;
    category: string;
    type: string;
    description: string;
    video_url: string | null;
    video_thumbnail: string | null;
    video_platform: string | null;
    images: string[];
    vote_score: number;
    views: number;
    hero: { name: string; slug: string } | null;
    user: { name: string; avatar?: string } | null;
    created_at: string;
    language?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
    general: 'bg-gray-700',
    pve: 'bg-green-700',
    rta: 'bg-red-700',
    guild_war: 'bg-blue-700',
    arena: 'bg-purple-700',
    tier_list: 'bg-yellow-700',
    character_guide: 'bg-teal-700',
};

export default function GuidesPage() {
    const { t, locale } = useTranslations();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

    // Categoría, héroe y orden en la URL: un link a /guides?hero=straze&category=rta se puede compartir
    const categoryFilter = searchParams.get('category') ?? 'all';
    const heroFilter = searchParams.get('hero') ?? '';
    const sortBy = searchParams.get('sort') ?? 'newest';
    const setParam = (key: string, value: string, empty: string) => {
        const next = new URLSearchParams(searchParams.toString());
        if (value && value !== empty) next.set(key, value);
        else next.delete(key);
        const query = next.toString();
        router.replace(query ? `/guides?${query}` : '/guides', { scroll: false });
    };
    const setCategoryFilter = (value: string) => setParam('category', value, 'all');
    const setSortBy = (value: string) => setParam('sort', value, 'newest');

    // Héroes para el filtro (misma consulta que el formulario de builds)
    const { data: heroesData } = useQuery({
        queryKey: ['heroes-list', locale],
        queryFn: async () => (await heroApi.list({ lang: locale })).data,
    });
    const heroOptions: { name: string; slug: string }[] = heroesData?.data ?? [];
    const heroName = heroOptions.find((h) => h.slug === heroFilter)?.name ?? '';
    const [heroInput, setHeroInput] = useState<string | null>(null);

    const CATEGORIES = [
        { id: 'all', label: t('guides.allCategories', 'All'), emoji: '📚' },
        { id: 'general', label: t('guides.general', 'General'), emoji: '📖' },
        { id: 'pve', label: 'PVE', emoji: '🐉' },
        { id: 'rta', label: 'RTA', emoji: '⚔️' },
        { id: 'guild_war', label: t('guides.guildWar', 'Guild War'), emoji: '🏰' },
        { id: 'arena', label: t('guides.arena', 'Arena'), emoji: '🏆' },
        { id: 'tier_list', label: t('guides.categories.tier_list', 'Tier List'), emoji: '📊' },
        { id: 'character_guide', label: t('guides.categories.character_guide', 'Character Guide'), emoji: '🦸' },
    ];

    const { data, isLoading, error } = useQuery({
        queryKey: ['guides', search, categoryFilter, selectedLanguage, heroFilter, sortBy],
        queryFn: async () => {
            // Orden en el servidor: antes se ordenaba solo la página de 20 ya cargada
            const [sort, order] = sortBy.split('_');
            const params: Record<string, string> = { sort, order: order ?? 'desc' };
            if (categoryFilter && categoryFilter !== 'all') params.category = categoryFilter;
            if (heroFilter) params.hero = heroFilter;
            if (search) params.search = search;
            if (selectedLanguage && selectedLanguage !== 'all') params.language = selectedLanguage;

            const response = await guideApi.list(params);
            return response.data;
        },
    });

    const guides: Guide[] = data?.data || [];

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div className="text-center md:text-left">
                        <h1 className="font-hero font-normal text-4xl md:text-5xl text-slate-50 tracking-normal mb-2">{t('guides.title', 'Game Guides')}</h1>
                        <p className="font-sans text-slate-400">{t('guides.description', 'Learn strategies and tips from the community')}</p>
                    </div>
                    <Link href="/guides/create">
                        <Button className="btn-gold px-4 py-2 rounded-md">
                            + {t('guides.createGuide', 'Create Guide')}
                        </Button>
                    </Link>
                </div>

                {/* Category Tabs */}
                <div className="mb-6 flex flex-wrap gap-2 bg-e7-panel p-3 rounded-lg border border-white/6">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategoryFilter(cat.id)}
                            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${categoryFilter === cat.id
                                ? 'bg-e7-gold/20 text-e7-gold ring-1 ring-e7-gold'
                                : 'bg-white/4 text-neutral-400 hover:text-neutral-200 hover:bg-white/6'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Search and Sort */}
                <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <Input
                        placeholder={t('guides.searchPlaceholder', 'Search guides...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-md bg-white/4 border-white/8 text-neutral-200 placeholder:text-neutral-400 focus:border-e7-gold"
                    />
                    <div className="flex items-center gap-2">
                        <Input
                            list="guide-hero-options"
                            aria-label={t('guides.filterByHero', 'Filter by hero')}
                            placeholder={t('guides.filterByHero', 'Filter by hero')}
                            value={heroInput ?? heroName}
                            onChange={(e) => {
                                const value = e.target.value;
                                setHeroInput(value);
                                const match = heroOptions.find((h) => h.name.toLowerCase() === value.trim().toLowerCase());
                                if (match) setParam('hero', match.slug, '');
                                else if (!value) setParam('hero', '', '');
                            }}
                            className="w-56 bg-white/4 border-white/8 text-neutral-200 placeholder:text-neutral-400 focus:border-e7-gold"
                        />
                        <datalist id="guide-hero-options">
                            {heroOptions.map((h) => <option key={h.slug} value={h.name} />)}
                        </datalist>
                        {heroFilter && (
                            <button
                                type="button"
                                onClick={() => {
                                    setHeroInput(null);
                                    setParam('hero', '', '');
                                }}
                                className="text-xs text-neutral-400 hover:text-e7-gold"
                            >
                                {t('builds.allHeroes', 'All heroes')}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-400">{t('common.sortBy', 'Sort by')}:</span>
                        <select
                            aria-label={t('common.sortBy', 'Sort by')}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-white/4 border border-white/8 text-neutral-200 rounded-md pl-3 pr-10 py-1.5 text-sm focus:border-e7-gold cursor-pointer"
                        >
                            <option value="newest">{t('common.newest', 'Newest')}</option>
                            <option value="views_desc">{t('common.viewsHigh', 'Views (High)')}</option>
                            <option value="views_asc">{t('common.viewsLow', 'Views (Low)')}</option>
                            <option value="likes_desc">{t('common.likesHigh', 'Likes (High)')}</option>
                            <option value="likes_asc">{t('common.likesLow', 'Likes (Low)')}</option>
                        </select>
                        {/* Language Filter */}
                        <select
                            aria-label={t('language.filterByLanguage', 'Filter by Language')}
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="bg-white/4 border border-white/8 text-neutral-200 rounded-md pl-3 pr-10 py-1.5 text-sm focus:border-e7-gold cursor-pointer"
                        >
                            {CONTENT_LANGUAGES.map((lang) => (
                                <option key={lang} value={lang}>{languageLabel(lang, t)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="lg" text={t('guides.loadingGuides', 'Loading guides...')} />
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="text-center text-red-400 py-20">
                        <p>{t('guides.loadError', 'Could not load guides. Please try again later.')}</p>
                    </div>
                )}

                {/* Guides Grid */}
                {!isLoading && !error && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {guides.length === 0 ? (
                            <div className="col-span-full">
                                <Card className="glass-panel border-e7-gold/20 rounded-xl">
                                    <CardContent className="py-12 text-center text-slate-400">
                                        <p className="text-2xl mb-4">📝</p>
                                        <p className="text-xl mb-2">{t('guides.noGuides', 'No guides available yet.')}</p>
                                        <p>{t('guides.beFirstToCreate', 'Be the first to create a guide!')}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            guides.map((guide) => (
                                <Link key={guide.id} href={`/guides/${guide.slug}`}>
                                    <div className="card-fantasy bg-gradient-to-b from-e7-panel to-e7-void rounded-xl overflow-hidden h-full group">
                                        {/* Video or Image Thumbnail */}
                                        {guide.video_thumbnail ? (
                                            <div className="relative aspect-video overflow-hidden rounded-t-lg">
                                                <Image
                                                    src={guide.video_thumbnail}
                                                    alt={guide.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform"
                                                    unoptimized
                                                />
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                    <div className="w-12 h-12 rounded-full bg-e7-gold/90 flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : guide.images?.[0] ? (
                                            <div className="relative aspect-video overflow-hidden rounded-t-lg">
                                                <Image
                                                    src={guide.images[0]}
                                                    alt={guide.title}
                                                    fill
                                                    sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
                                                    className="object-cover group-hover:scale-105 transition-transform"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-video bg-e7-void/50 rounded-t-lg flex items-center justify-center">
                                                <span className="text-4xl opacity-50">📖</span>
                                            </div>
                                        )}

                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium text-white ${CATEGORY_COLORS[guide.category] || 'bg-gray-600'}`}>
                                                    {CATEGORIES.find(c => c.id === guide.category)?.label || guide.category}
                                                </span>
                                                {guide.video_platform === 'youtube' && (
                                                    <span className="text-red-400 text-xs">▶ YouTube</span>
                                                )}
                                                {guide.language && guide.language !== 'en' && (
                                                    <span className="text-xs text-e7-gold bg-e7-gold/10 px-2 py-0.5 rounded">
                                                        {languageLabel(guide.language, t)}
                                                    </span>
                                                )}
                                            </div>

                                            <h2 className="text-slate-100 font-medium group-hover:text-e7-gold transition-colors line-clamp-2">
                                                {guide.title}
                                            </h2>

                                            {guide.hero && (
                                                <p className="text-sm text-slate-400 mt-1">
                                                    {t('guides.for', 'For')}: <span className="text-e7-gold">{guide.hero.name}</span>
                                                </p>
                                            )}

                                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-e7-gold/10 text-xs text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    {guide.user?.avatar ? (
                                                        <Image
                                                            src={guide.user.avatar}
                                                            alt="avatar"
                                                            width={20}
                                                            height={20}
                                                            className="rounded-full ring-1 ring-e7-gold/20"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-e7-gold/20 flex items-center justify-center text-xs text-e7-gold">
                                                            {(guide.user?.name || 'A').charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span>{guide.user?.name || t('common.anonymous', 'Anonymous')}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1"><Image src="/images/ras-like.gif" alt="likes" width={16} height={16} unoptimized /> {guide.vote_score || 0}</span>
                                                    <span>👁 {guide.views || 0}</span>
                                                </div>
                                            </div>
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
