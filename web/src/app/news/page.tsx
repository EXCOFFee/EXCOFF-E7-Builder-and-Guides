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

    // Category configuration with translations
    const getCategoryLabel = (cat: string) => {
        const labels: Record<string, string> = {
            news: t('news.categories.news', 'News'),
            events: t('news.categories.events', 'Events'),
            patch_notes: t('news.categories.patchNotes', 'Patch Notes'),
            dev_notes: t('news.categories.devNotes', 'Dev Notes'),
        };
        return labels[cat] || cat;
    };

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="font-display text-4xl md:text-5xl text-gold-gradient tracking-wide mb-2">
                        {t('news.title', 'Epic Seven News')}
                    </h1>
                    <p className="text-slate-400 max-w-xl mx-auto">
                        {t('news.subtitle', 'Latest updates, announcements and videos from the official Epic Seven channels')}
                    </p>

                    {/* Disclaimer */}
                    <div className="mt-4 p-3 bg-amber-900/10 border border-amber-500/20 rounded-md inline-block">
                        <p className="text-amber-400/80 text-sm flex items-center gap-2">
                            <span className="text-lg">⚠</span>
                            {t('news.disclaimer', 'All content is sourced from official Smilegate/Super Creative channels. We are not affiliated with the developers.')}
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
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
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
                <div className="flex justify-center gap-3 mb-4">
                    {/* All Sources */}
                    <button
                        onClick={() => { setSourceFilter('all'); setCategoryFilter('all'); setPage(1); }}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${sourceFilter === 'all'
                            ? 'bg-e7-gold/20 text-e7-gold ring-1 ring-e7-gold'
                            : 'bg-white/4 text-neutral-400 hover:bg-white/6'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        {t('news.allSources', 'All Sources')}
                    </button>

                    {/* YouTube */}
                    <button
                        onClick={() => { setSourceFilter('youtube'); setCategoryFilter('all'); setPage(1); }}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${sourceFilter === 'youtube'
                            ? 'bg-red-600/20 text-red-400 ring-1 ring-red-500'
                            : 'bg-white/4 text-neutral-400 hover:bg-white/6'
                            }`}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        YouTube
                    </button>

                    {/* Stove */}
                    <button
                        onClick={() => { setSourceFilter('stove'); setCategoryFilter('all'); setPage(1); }}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${sourceFilter === 'stove'
                            ? 'bg-orange-600/20 text-orange-400 ring-1 ring-orange-500'
                            : 'bg-white/4 text-neutral-400 hover:bg-white/6'
                            }`}
                    >
                        <Image
                            src="/images/stove.jpg"
                            alt="Stove"
                            width={20}
                            height={20}
                            className="rounded"
                            unoptimized
                        />
                        Stove
                    </button>
                </div>

                {/* Category Filter (only show for stove or when categories exist) */}
                {(sourceFilter === 'stove' || (sourceFilter === 'all' && categories.length > 0)) && categories.length > 0 && (
                    <div className="flex justify-center flex-wrap gap-2 mb-8">
                        <button
                            onClick={() => { setCategoryFilter('all'); setPage(1); }}
                            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${categoryFilter === 'all'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/4 text-neutral-400 hover:bg-white/6 border border-white/10'
                                }`}
                        >
                            {t('news.allCategories', 'All Categories')}
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => { setCategoryFilter(cat); setPage(1); }}
                                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${categoryFilter === cat
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/4 text-neutral-400 hover:bg-white/6 border border-white/10'
                                    }`}
                            >
                                {getCategoryLabel(cat)}
                            </button>
                        ))}
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
                                        <div className="relative aspect-video bg-e7-dark">
                                            {item.thumbnail ? (
                                                <Image
                                                    src={item.thumbnail}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-e7-dark">
                                                    {item.source === 'youtube' ? (
                                                        <svg className="w-16 h-16 text-red-600/50" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                        </svg>
                                                    ) : (
                                                        <Image
                                                            src="/images/stove.jpg"
                                                            alt="Stove"
                                                            width={64}
                                                            height={64}
                                                            className="rounded opacity-50"
                                                            unoptimized
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {/* Source Badge */}
                                            <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1.5 ${item.source === 'youtube'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-orange-600 text-white'
                                                }`}>
                                                {item.source === 'youtube' ? (
                                                    <>
                                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                        </svg>
                                                        YouTube
                                                    </>
                                                ) : (
                                                    <>
                                                        <Image
                                                            src="/images/stove.jpg"
                                                            alt="Stove"
                                                            width={12}
                                                            height={12}
                                                            className="rounded-sm"
                                                            unoptimized
                                                        />
                                                        Stove
                                                    </>
                                                )}
                                            </div>

                                            {/* Category Badge */}
                                            {item.category && (
                                                <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold bg-purple-600/90 text-white">
                                                    {getCategoryLabel(item.category)}
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
                                                <span className="text-e7-gold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                                    {t('news.readMore', 'Read more')}
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
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
                                    className="px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/20 text-slate-400 hover:border-e7-gold/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    {t('common.previous', 'Previous')}
                                </button>
                                <span className="px-4 py-2 text-slate-400">
                                    {page} / {newsData.last_page}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(newsData.last_page, p + 1))}
                                    disabled={page === newsData.last_page}
                                    className="px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/20 text-slate-400 hover:border-e7-gold/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {t('common.next', 'Next')}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
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
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {t('common.backToHome', 'Back to Home')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
