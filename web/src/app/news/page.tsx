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
    published_at: string;
}

interface NewsResponse {
    data: NewsItem[];
    current_page: number;
    last_page: number;
    total: number;
}

export default function NewsPage() {
    const { t } = useTranslations();
    const [sourceFilter, setSourceFilter] = useState<'all' | 'youtube' | 'stove'>('all');
    const [page, setPage] = useState(1);

    const { data: newsData, isLoading, error } = useQuery<NewsResponse>({
        queryKey: ['news', sourceFilter, page],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (sourceFilter !== 'all') params.set('source', sourceFilter);
            params.set('page', page.toString());

            const response = await fetch(`${API_URL}/news?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch news');
            return response.json();
        },
    });

    const news = newsData?.data || [];

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
                            笞・・{t('news.disclaimer', 'All content is sourced from official Smilegate/Super Creative channels. We are not affiliated with the developers.')}
                        </p>
                    </div>
                </div>

                {/* Source Filter */}
                <div className="flex justify-center gap-2 mb-8">
                    {(['all', 'youtube', 'stove'] as const).map((source) => (
                        <button
                            key={source}
                            onClick={() => { setSourceFilter(source); setPage(1); }}
                            className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2 ${sourceFilter === source
                                ? 'bg-e7-gold/20 text-e7-gold ring-1 ring-e7-gold'
                                : 'bg-white/4 text-neutral-400 hover:bg-white/6'
                                }`}
                        >
                            {source === 'youtube' && <span className="text-red-500">笆ｶ</span>}
                            {source === 'stove' && <span className="text-blue-400">堂</span>}
                            {source === 'all' && <span>倹</span>}
                            {source === 'all'
                                ? t('news.allSources', 'All Sources')
                                : source === 'youtube'
                                    ? 'YouTube'
                                    : 'Stove'}
                        </button>
                    ))}
                </div>

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
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-e7-dark to-e7-void">
                                                    <span className="text-4xl">
                                                        {item.source === 'youtube' ? '笆ｶ' : '堂'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Source Badge */}
                                            <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${item.source === 'youtube'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-blue-600 text-white'
                                                }`}>
                                                {item.source === 'youtube' ? '笆ｶ YouTube' : '堂 Stove'}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-e7-gold transition-colors">
                                                {item.title}
                                            </h3>

                                            {item.description && (
                                                <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                                                    {item.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>
                                                    {new Date(item.published_at).toLocaleDateString()}
                                                </span>
                                                <span className="text-e7-gold group-hover:translate-x-1 transition-transform">
                                                    {t('news.readMore', 'Read more 竊・)}
                                                </span>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {newsData && newsData.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/20 text-slate-400 hover:border-e7-gold/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    竊・{t('common.previous', 'Previous')}
                                </button>
                                <span className="px-4 py-2 text-slate-400">
                                    {page} / {newsData.last_page}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(newsData.last_page, p + 1))}
                                    disabled={page === newsData.last_page}
                                    className="px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/20 text-slate-400 hover:border-e7-gold/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('common.next', 'Next')} 竊・
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Back to Home */}
                <div className="text-center mt-12">
                    <Link
                        href="/"
                        className="text-e7-gold hover:text-e7-text-gold text-sm inline-flex items-center gap-2 group transition-colors"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">竊・/span>
                        {t('common.backToHome', 'Back to Home')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
