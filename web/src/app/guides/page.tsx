'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { guideApi } from '@/lib/api';
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
    user: { name: string } | null;
    created_at: string;
}

const CATEGORY_COLORS: Record<string, string> = {
    general: 'bg-gray-600',
    pve: 'bg-green-600',
    rta: 'bg-red-600',
    guild_war: 'bg-blue-600',
    arena: 'bg-purple-600',
    tier_list: 'bg-yellow-600',
    character_guide: 'bg-teal-600',
};

export default function GuidesPage() {
    const { t } = useTranslations();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const CATEGORIES = [
        { id: 'all', label: t('guides.allCategories', 'All'), emoji: '📚' },
        { id: 'general', label: t('guides.general', 'General'), emoji: '📖' },
        { id: 'pve', label: 'PVE', emoji: '🐉' },
        { id: 'rta', label: 'RTA', emoji: '⚔️' },
        { id: 'guild_war', label: t('guides.guildWar', 'Guild War'), emoji: '🏰' },
        { id: 'arena', label: t('guides.arena', 'Arena'), emoji: '🏆' },
        { id: 'tier_list', label: t('guides.categories.tier_list', 'Tier List'), emoji: '📊' },
        { id: 'character_guide', label: t('guides.categories.character_guide', 'Character Guide'), emoji: '🧙' },
    ];

    const { data, isLoading, error } = useQuery({
        queryKey: ['guides', search, categoryFilter],
        queryFn: async () => {
            const params: Record<string, string> = {};
            if (categoryFilter && categoryFilter !== 'all') params.category = categoryFilter;
            if (search) params.search = search;

            const response = await guideApi.list(params);
            return response.data;
        },
    });

    const guides: Guide[] = data?.data || [];

    return (
        <div className="min-h-screen bg-void-glow py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div className="text-center md:text-left">
                        <h1 className="font-display text-4xl md:text-5xl text-gold-gradient tracking-wide mb-2">{t('guides.title', 'Game Guides')}</h1>
                        <p className="text-slate-400">{t('guides.description', 'Learn strategies and tips from the community')}</p>
                    </div>
                    <Link href="/guides/create">
                        <Button className="btn-gold px-6 py-2.5 rounded-lg shadow-lg shadow-e7-gold/20 hover:shadow-e7-gold/40 transition-all">
                            + {t('guides.createGuide', 'Create Guide')}
                        </Button>
                    </Link>
                </div>

                {/* Category Tabs */}
                <div className="mb-6 flex flex-wrap gap-2 glass-panel p-3 rounded-xl">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategoryFilter(cat.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${categoryFilter === cat.id
                                ? 'bg-e7-gold/20 text-e7-gold border border-e7-gold shadow-lg shadow-e7-gold/10'
                                : 'bg-e7-void/50 text-slate-400 border border-white/10 hover:border-e7-gold/40 hover:text-e7-gold'
                                }`}
                        >
                            <span className="mr-2">{cat.emoji}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="mb-8">
                    <Input
                        placeholder={t('guides.searchPlaceholder', 'Search guides...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-md bg-e7-void/50 border-e7-gold/20 text-slate-200 placeholder:text-slate-500 focus:border-e7-gold focus:ring-e7-gold/30 transition-all"
                    />
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
                        <p>{t('guides.loadError', 'Error loading guides. Make sure the API is running.')}</p>
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
                                                    className="object-cover group-hover:scale-105 transition-transform"
                                                    unoptimized
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
                                                    <span className="text-red-500 text-xs">▶ YouTube</span>
                                                )}
                                            </div>

                                            <h3 className="text-slate-100 font-medium group-hover:text-e7-gold transition-colors line-clamp-2">
                                                {guide.title}
                                            </h3>

                                            {guide.hero && (
                                                <p className="text-sm text-slate-400 mt-1">
                                                    {t('guides.for', 'For')}: <span className="text-e7-gold">{guide.hero.name}</span>
                                                </p>
                                            )}

                                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-e7-gold/10 text-xs text-slate-500">
                                                <span>{guide.user?.name || t('common.anonymous', 'Anonymous')}</span>
                                                <span>👁 {guide.views || 0}</span>
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
