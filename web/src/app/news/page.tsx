'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from '@/hooks/useTranslations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface NewsItem {
    id: number;
    title: string;
    description: string | null;
    thumbnail: string | null;
    url: string;
    source: 'youtube' | 'stove';
    category: string | null;
    published_at: string;
}

interface NewsResponse {
    data: NewsItem[];
    current_page: number;
    last_page: number;
    total: number;
    categories: string[];
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
    news: { label: 'News', emoji: '📰' },
    events: { label: 'Events', emoji: '🎉' },
    patch_notes: { label: 'Patch Notes', emoji: '🔧' },
    dev_notes: { label: 'Dev Notes', emoji: '📝' },
};

export default function NewsPage() {
    const { t } = useTranslations();
    const [sourceFilter, setSourceFilter] = useState<'all' | 'youtube' | 'stove'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);

    const { data: newsData, isLoading, error } = useQuery<NewsResponse>({
        queryKey: ['news', sourceFilter, categoryFilter, searchQuery, page],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (sourceFilter !== 'all') params.set('source', sourceFilter);
            if (categoryFilter !== 'all') params.set('category', categoryFilter);
            if (searchQuery) params.set('search', searchQuery);
            params.set('page', page.toString());

            const response = await fetch(`${API_URL}/news?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch news');
            return response.json();
        },
    });

    const news = newsData?.data || [];
    const categories = newsData?.categories || [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchQuery(searchInput);
        setPage(1);
    };

    const clearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-semibold text-e7-gold tracking-tight mb-4">
                        {t('news.title', 'Epic Seven News')}
                    </h1>
                    <p className="text-neutral-500 max-w-xl mx-auto">
                        {t('news.subtitle', 'Latest updates, announcements and videos from the official Epic Seven channels')}
                    </p>

                    {/* Disclaimer */}
                    <div className="mt-4 p-3 bg-amber-900/10 border border-amber-500/20 rounded-md inline-block">
                        <p className="text-amber-400/80 text-sm">
                            ⚠️ {t('news.disclaimer', 'All content is sourced from official Smilegate/Super Creative channels. We are not affiliated with the developers.')}
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-6">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder={t('news.searchPlaceholder', 'Search news...')}
                                className="w-full px-4 py-2 pl-10 rounded-lg bg-e7-void border border-e7-gold/30 text-white placeholder-neutral-500 focus:border-e7-gold focus:outline-none"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">🔍</span>
                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-e7-gold/20 text-e7-gold hover:bg-e7-gold/30 transition-colors"
                        >
                            {t('common.search', 'Search')}
                        </button>
                    </div>
                </form>

                {/* Source Filter */}
                <div className="flex justify-center gap-2 mb-4">
                    {(['all', 'youtube', 'stove'] as const).map((source) => (
                        <button
                            key={source}
                            onClick={() => { setSourceFilter(source); setCategoryFilter('all'); setPage(1); }}
                            className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2 ${sourceFilter === source
                                ? 'bg-e7-gold/20 text-e7-gold ring-1 ring-e7-gold'
                                : 'bg-white/4 text-neutral-400 hover:bg-white/6'
                                }`}
                        >
                            {source === 'youtube' && <span className="text-red-500">▶</span>}
                            {source === 'stove' && <span className="text-blue-400">🔥</span>}
                            {source === 'all' && <span>📋</span>}
                            {source === 'all'
                                ? t('news.allSources', 'All Sources')
                                : source === 'youtube'
                                    ? 'YouTube'
                                    : 'Stove'}
                        </button>
                    ))}
                </div>

                {/* Category Filter (only show if stove selected or categories exist) */}
                {(sourceFilter === 'stove' || sourceFilter === 'all') && categories.length > 0 && (
                    <div className="flex justify-center flex-wrap gap-2 mb-8">
                        <button
                            onClick={() => { setCategoryFilter('all'); setPage(1); }}
                            className={`px-3 py-1 rounded-full text-xs transition-colors ${categoryFilter === 'all'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/4 text-neutral-400 hover:bg-white/6'
                                }`}
                        >
                            {t('news.allCategories', 'All Categories')}
                        </button>
                        {categories.map((cat) => {
                            const catInfo = CATEGORY_LABELS[cat] || { label: cat, emoji: '📄' };
                            return (
                                <button
                                    key={cat}
                                    onClick={() => { setCategoryFilter(cat); setPage(1); }}
                                    className={`px-3 py-1 rounded-full text-xs transition-colors flex items-center gap-1 ${categoryFilter === cat
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-white/4 text-neutral-400 hover:bg-white/6'
                                        }`}
                                >
                                    <span>{catInfo.emoji}</span>
                                    <span>{t(`news.category.${cat}`, catInfo.label)}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Search Results Info */}
                {searchQuery && (
                    <div className="text-center mb-4">
                        <p className="text-neutral-400 text-sm">
                            {t('news.searchResults', 'Showing results for')}: <span className="text-e7-gold">&quot;{searchQuery}&quot;</span>
                            <button onClick={clearSearch} className="ml-2 text-red-400 hover:text-red-300">
                                ({t('common.clear', 'clear')})
                            </button>
                        </p>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-e7-gold"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-20">
                        <p className="text-red-400">{t('news.error', 'Failed to load news. Please try again later.')}</p>
                    </div>
                )}

                {/* News Grid */}
                {!isLoading && !error && (
                    <>
                        {news.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-slate-400">{t('news.noNews', 'No news available at the moment.')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {news.map((item) => (
                                    <a
                                        key={item.id}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group block glass-panel border border-e7-gold/20 rounded-xl overflow-hidden hover:border-e7-gold/50 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-e7-gold/10"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative aspect-video bg-e7-void">
                                            {item.thumbnail ? (
                                                <Image
                                                    src={item.thumbnail}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-4xl opacity-30">
                                                        {item.source === 'youtube' ? '▶️' : '📰'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Source Badge */}
                                            <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${item.source === 'youtube'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-blue-600 text-white'
                                                }`}>
                                                {item.source === 'youtube' ? '▶ YouTube' : '🔥 Stove'}
                                            </div>

                                            {/* Category Badge */}
                                            {item.category && (
                                                <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold bg-purple-600 text-white">
                                                    {CATEGORY_LABELS[item.category]?.emoji || '📄'} {CATEGORY_LABELS[item.category]?.label || item.category}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="font-medium text-white group-hover:text-e7-gold transition-colors line-clamp-2 mb-2">
                                                {item.title}
                                            </h3>
                                            {item.description && (
                                                <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                                                    {item.description}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>
                                                    {new Date(item.published_at).toLocaleDateString()}
                                                </span>
                                                <span className="text-e7-gold group-hover:translate-x-1 transition-transform">
                                                    {t('news.readMore', 'Read more →')}
                                                </span>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {newsData && newsData.last_page > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/20 text-slate-400 hover:border-e7-gold/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← {t('common.previous', 'Previous')}
                                </button>
                                <span className="px-4 py-2 text-slate-400">
                                    {page} / {newsData.last_page}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(newsData.last_page, p + 1))}
                                    disabled={page === newsData.last_page}
                                    className="px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/20 text-slate-400 hover:border-e7-gold/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('common.next', 'Next')} →
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Back to Home */}
                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="text-e7-gold hover:text-e7-text-gold text-sm inline-flex items-center gap-2 group transition-colors"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        {t('common.backToHome', 'Back to Home')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
