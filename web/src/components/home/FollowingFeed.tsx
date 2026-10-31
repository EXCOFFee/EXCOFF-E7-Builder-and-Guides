'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api';
import { useAuthToken } from '@/hooks/useAuth';
import { useTranslations } from '@/hooks/useTranslations';

interface FeedItem {
    type: 'build' | 'guide';
    id: number;
    title: string;
    slug?: string;
    likes: number;
    created_at: string;
    user: { id: number; name: string } | null;
    hero: { name: string } | null;
}

const SHOWN = 6;

/**
 * Home: lo nuevo de la gente que sigue el usuario. Solo con sesión y si sigue a alguien con
 * algo publicado; si no, no ocupa lugar.
 */
export function FollowingFeed() {
    const { t } = useTranslations();
    const token = useAuthToken();
    const { data: items = [] } = useQuery<FeedItem[]>({
        queryKey: ['feed'],
        queryFn: async () => (await userApi.feed()).data.items,
        enabled: Boolean(token),
        staleTime: 60_000,
    });

    if (!token || items.length === 0) return null;

    return (
        <section className="min-w-0" aria-labelledby="following-feed-title">
            <h2 id="following-feed-title" className="hero-sheet__label mb-4 font-sans">{t('home.followingFeed', 'From people you follow')}</h2>
            <ul className="divide-y divide-night-line/60">
                {items.slice(0, SHOWN).map((item) => (
                    <li key={`${item.type}-${item.id}`}>
                        <Link href={item.type === 'build' ? `/builds/${item.id}` : `/guides/${item.slug}`} className="flex items-center gap-3 py-3 hover:bg-night/40">
                            <span className="shrink-0 rounded-full border border-night-line px-2 py-0.5 text-[11px] text-night-muted">
                                {item.type === 'build' ? t('home.feedBuild', 'Build') : t('home.feedGuide', 'Guide')}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate font-semibold text-slate-50">{item.title}</span>
                                <span className="block truncate text-xs text-night-muted">
                                    {[item.hero?.name, item.user?.name].filter(Boolean).join(' · ')}
                                </span>
                            </span>
                            <span className="shrink-0 font-mono text-xs text-e7-gold">♥ {item.likes || 0}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
