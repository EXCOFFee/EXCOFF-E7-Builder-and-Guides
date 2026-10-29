import Link from 'next/link';
import Image from 'next/image';
import { getLocale, getMessages } from '@/i18n/server';
import type { Messages } from '@/i18n/config';
import { HeroFinder, NewestHeroes, type HeroListItem } from '@/components/home/HeroFinder';
import { SET_IMAGES } from '@/lib/sets';
import { appendImageVersion } from '@/lib/heroImages';
import { formatDate, formatNumber } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/** Orden y color de los segmentos de la barra de elementos (mismos colores que la ficha de héroe) */
const ELEMENTS = [
    ['fire', '#e5533d', '/images/elements/ElementFire.png'],
    ['ice', '#4fa3e8', '/images/elements/ElementWater.png'],
    ['earth', '#5dbb63', '/images/elements/ElementEarth.png'],
    ['light', '#e8c35a', '/images/elements/ElementLight.png'],
    ['dark', '#9a6be0', '/images/elements/ElementDark.png'],
] as const;

interface RecentBuild {
    id: number;
    title: string;
    primary_set?: string | null;
    secondary_set?: string | null;
    likes?: number;
    is_anonymous?: boolean;
    created_at?: string;
    user?: { name?: string } | null;
    hero?: { name: string; slug: string; element: string; image_url?: string | null } | null;
}

interface NewsItem {
    id: number;
    title: string;
    thumbnail?: string | null;
    url?: string | null;
    published_at?: string | null;
}

async function getJson<T>(path: string, revalidate: number): Promise<T | null> {
    try {
        const response = await fetch(`${API_URL}${path}`, { next: { revalidate } });
        return response.ok ? ((await response.json()) as T) : null;
    } catch {
        return null; // API caída: la home se muestra igual, sin esa sección
    }
}

/** Solo los campos que usa la home: la lista completa pesa ~860 KB y no debe llegar al navegador */
async function getHeroes(): Promise<HeroListItem[]> {
    const data = await getJson<{ data: HeroListItem[] }>('/heroes', 3600);
    return (data?.data ?? []).map(({ id, name, slug, element, rarity, image_url }) => ({
        id,
        name,
        slug,
        element,
        rarity,
        image_url,
    }));
}

function translator(messages: Messages) {
    return (key: string, fallback: string): string => {
        const value = key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], messages);
        return typeof value === 'string' ? value : fallback;
    };
}

export default async function Home() {
    const locale = await getLocale();
    const [messages, heroes, builds, news] = await Promise.all([
        getMessages(locale),
        getHeroes(),
        getJson<{ data: RecentBuild[] }>('/builds', 300),
        getJson<{ data: NewsItem[] }>('/news?per_page=3', 1800),
    ]);
    const t = translator(messages);

    const newest = [...heroes].sort((a, b) => b.id - a.id).slice(0, 6);
    const counts = Object.fromEntries(ELEMENTS.map(([el]) => [el, heroes.filter((h) => h.element === el).length]));
    const recentBuilds = (builds?.data ?? []).slice(0, 4);
    const latestNews = (news?.data ?? []).slice(0, 3);

    return (
        <div className="min-h-screen bg-night">
            {/* Buscador y barra de elementos */}
            <section className="border-b border-night-line/60 bg-[radial-gradient(70%_90%_at_50%_0%,rgba(212,168,83,0.10),transparent_70%)]">
                <div className="mx-auto max-w-6xl px-4 pt-14 pb-12 sm:pt-20">
                    <p className="font-mono text-xs tracking-[0.25em] text-e7-gold">EXCOFF E7 HUB</p>
                    <h1 className="mt-3 max-w-3xl font-hero text-4xl font-normal leading-tight tracking-normal text-slate-50 sm:text-5xl lg:text-6xl">
                        {heroes.length
                            ? t('home.headline', 'Builds, skills and stats for all {count} Epic Seven heroes').replace(
                                  '{count}',
                                  String(heroes.length)
                              )
                            : t('home.tagline', 'E7 Builds, Guides & Hero Wiki')}
                    </h1>
                    <div className="mt-8">
                        <HeroFinder heroes={heroes} />
                    </div>

                    {heroes.length > 0 && (
                        <nav aria-label={t('home.heroesByElement', 'Heroes by element')} className="mt-10 max-w-3xl">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-night-muted">
                                {t('home.heroesByElement', 'Heroes by element')}
                            </p>
                            <ul className="flex h-2.5 overflow-hidden rounded-full" aria-hidden>
                                {ELEMENTS.map(([el, color]) => (
                                    <li key={el} style={{ flexGrow: counts[el], background: color }} />
                                ))}
                            </ul>
                            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                                {ELEMENTS.map(([el, color, icon]) => (
                                    <li key={el}>
                                        <Link
                                            href={`/heroes?element=${el}`}
                                            className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-slate-50"
                                        >
                                            <Image src={icon} alt="" width={18} height={18} className="h-[18px] w-[18px]" />
                                            {t(`elements.${el}`, el)}
                                            <span className="font-mono text-xs" style={{ color }}>
                                                {counts[el]}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}
                </div>
            </section>

            <div className="mx-auto max-w-6xl space-y-12 px-4 py-12">
                {newest.length > 0 && (
                    <section>
                        <div className="mb-4 flex items-baseline justify-between gap-4">
                            <h2 className="hero-sheet__label flex-1 font-sans">{t('home.newHeroes', 'Newest heroes')}</h2>
                            <Link href="/heroes" className="text-sm text-e7-gold hover:text-e7-text-gold">
                                {t('home.viewAll', 'View all')} →
                            </Link>
                        </div>
                        <NewestHeroes heroes={newest} />
                    </section>
                )}

                <div className="grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    <section className="min-w-0">
                        <div className="mb-4 flex items-baseline justify-between gap-4">
                            <h2 className="hero-sheet__label flex-1 font-sans">{t('home.recentBuilds', 'Recent builds')}</h2>
                            <Link href="/builds" className="text-sm text-e7-gold hover:text-e7-text-gold">
                                {t('home.viewAll', 'View all')} →
                            </Link>
                        </div>
                        {recentBuilds.length ? (
                            <ul className="divide-y divide-night-line/60 rounded-xl border border-night-line bg-night-panel">
                                {recentBuilds.map((build) => (
                                    <li key={build.id}>
                                        <Link href={`/builds/${build.id}`} className="flex items-center gap-4 p-4 hover:bg-night-line/30">
                                            {build.hero?.image_url ? (
                                                <Image
                                                    src={appendImageVersion(build.hero.image_url)}
                                                    alt=""
                                                    width={48}
                                                    height={48}
                                                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <span className="h-12 w-12 shrink-0 rounded-lg bg-night-line" aria-hidden />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-semibold text-slate-50">{build.title}</p>
                                                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-night-muted">
                                                    {build.hero && <span className="text-slate-300">{build.hero.name}</span>}
                                                    {[build.primary_set, build.secondary_set].filter(Boolean).map((set) => (
                                                        <span key={set} className="inline-flex items-center gap-1">
                                                            {SET_IMAGES[set as string] && (
                                                                <Image src={SET_IMAGES[set as string]} alt="" width={14} height={14} unoptimized />
                                                            )}
                                                            {set}
                                                        </span>
                                                    ))}
                                                    <span>
                                                        {build.is_anonymous || !build.user?.name
                                                            ? t('common.anonymous', 'Anonymous')
                                                            : build.user.name}
                                                    </span>
                                                </p>
                                            </div>
                                            <span className="shrink-0 font-mono text-sm text-slate-300" title={t('home.likes', 'Likes')}>
                                                ♥ {formatNumber(build.likes ?? 0)}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-night-muted">{t('heroes.noBuildsYet', 'No builds yet')}</p>
                        )}
                    </section>

                    <section className="min-w-0">
                        <div className="mb-4 flex items-baseline justify-between gap-4">
                            <h2 className="hero-sheet__label flex-1 font-sans">{t('home.latestNews', 'Latest news')}</h2>
                            <Link href="/news" className="text-sm text-e7-gold hover:text-e7-text-gold">
                                {t('home.viewAll', 'View all')} →
                            </Link>
                        </div>
                        {latestNews.length ? (
                            <ul className="space-y-3">
                                {latestNews.map((item) => (
                                    <li key={item.id}>
                                        <a
                                            href={item.url || '/news'}
                                            target={item.url ? '_blank' : undefined}
                                            rel={item.url ? 'noopener noreferrer' : undefined}
                                            className="flex gap-3 rounded-xl border border-night-line bg-night-panel p-3 hover:border-e7-gold/40"
                                        >
                                            {item.thumbnail && (
                                                <Image
                                                    src={item.thumbnail}
                                                    alt=""
                                                    width={112}
                                                    height={63}
                                                    className="aspect-video w-28 shrink-0 rounded-md object-cover"
                                                    unoptimized
                                                />
                                            )}
                                            <div className="min-w-0">
                                                <p className="line-clamp-2 text-sm font-medium text-slate-100">{item.title}</p>
                                                {item.published_at && (
                                                    <p className="mt-1 font-mono text-xs text-night-muted">{formatDate(item.published_at, locale)}</p>
                                                )}
                                            </div>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-night-muted">{t('news.noNews', 'No news yet')}</p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
