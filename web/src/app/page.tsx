import Link from 'next/link';
import Image from 'next/image';
import { getLocale, getMessages } from '@/i18n/server';
import type { Messages } from '@/i18n/config';
import { HeroFinder, NewestHeroes, type HeroListItem } from '@/components/home/HeroFinder';
import { FollowingFeed } from '@/components/home/FollowingFeed';
import { SET_IMAGES } from '@/lib/sets';
import { appendImageVersion } from '@/lib/heroImages';
import { formatDate, formatNumber } from '@/lib/utils';
import { isSiteNews, newsText } from '@/lib/news';

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

interface GuideItem {
    id: number;
    title: string;
    slug: string;
    likes?: number;
    is_anonymous?: boolean;
    hero?: { name: string } | null;
    user?: { name?: string } | null;
}

type T = (key: string, fallback: string) => string;

/** Título de sección con "ver todo" */
function HomeSection({ title, href, t, children }: { title: string; href: string; t: T; children: React.ReactNode }) {
    return (
        <section className="min-w-0">
            <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2 className="hero-sheet__label flex-1 font-sans">{title}</h2>
                <Link href={href} className="text-sm text-e7-gold hover:text-e7-text-gold">
                    {t('home.viewAll', 'View all')} →
                </Link>
            </div>
            {children}
        </section>
    );
}

/** Lista compacta de builds (retrato del héroe, título, sets, autor y likes) */
function BuildRows({ builds, t }: { builds: RecentBuild[]; t: T }) {
    return (
        <ul className="divide-y divide-night-line/60 rounded-xl border border-night-line bg-night-panel">
            {builds.map((build) => (
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
                                <span>{build.is_anonymous || !build.user?.name ? t('common.anonymous', 'Anonymous') : build.user.name}</span>
                            </p>
                        </div>
                        <span className="shrink-0 font-mono text-sm text-slate-300" title={t('home.likes', 'Likes')}>
                            ♥ {formatNumber(build.likes ?? 0)}
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

interface NewsItem {
    id: number;
    title: string;
    description?: string | null;
    source?: string;
    category?: string | null;
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
    const [messages, heroes, trending, builds, news, guides] = await Promise.all([
        getMessages(locale),
        getHeroes(),
        getJson<{ data: RecentBuild[] }>('/builds?sort=trending', 300),
        getJson<{ data: RecentBuild[]; total?: number }>('/builds', 300),
        getJson<{ data: NewsItem[] }>('/news?per_page=3', 1800),
        getJson<{ data: GuideItem[] }>('/guides?sort=likes', 1800),
    ]);
    const t = translator(messages);

    const newest = [...heroes].sort((a, b) => b.id - a.id).slice(0, 6);
    const counts = Object.fromEntries(ELEMENTS.map(([el]) => [el, heroes.filter((h) => h.element === el).length]));
    const recentBuilds = (builds?.data ?? []).slice(0, 4);
    // En tendencia: sin repetir las que ya están en "nuevas"
    const trendingBuilds = (trending?.data ?? []).filter((b) => !recentBuilds.some((r) => r.id === b.id)).slice(0, 4);
    const totalBuilds = builds?.total ?? 0;
    const latestNews = (news?.data ?? []).slice(0, 3);
    const topGuides = (guides?.data ?? []).slice(0, 3);

    return (
        <div className="min-h-screen bg-night">
            {/* Buscador y barra de elementos */}
            <section className="border-b border-night-line/60 bg-[radial-gradient(70%_90%_at_50%_0%,rgba(212,168,83,0.10),transparent_70%)]">
                <div className="mx-auto max-w-6xl px-4 pt-14 pb-12 sm:pt-20">
                    <p className="font-mono text-xs tracking-[0.25em] text-e7-gold">EXCOFF E7 HUB</p>
                    <h1 className="mt-3 max-w-3xl font-hero text-4xl font-normal leading-tight tracking-normal text-slate-50 sm:text-5xl lg:text-6xl">
                        {t('home.headlineBuilds', 'How the community builds every Epic Seven hero')}
                    </h1>
                    {totalBuilds > 0 && (
                        <p className="mt-3 max-w-2xl text-slate-300">
                            {t('home.sublineBuilds', '{count} builds with sets, artifacts, counters, pros and cons, and ratings by mode.').replace('{count}', formatNumber(totalBuilds))}
                        </p>
                    )}
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
                <FollowingFeed />
                <div className="grid gap-12 lg:grid-cols-2">
                    <HomeSection title={t('home.trendingBuilds', 'Trending builds')} href="/builds" t={t}>
                        {trendingBuilds.length ? (
                            <BuildRows builds={trendingBuilds} t={t} />
                        ) : (
                            <p className="text-sm text-night-muted">{t('home.noTrending', 'Nothing trending in the last two weeks.')}</p>
                        )}
                    </HomeSection>
                    <HomeSection title={t('home.recentBuilds', 'Recent builds')} href="/builds" t={t}>
                        {recentBuilds.length ? (
                            <BuildRows builds={recentBuilds} t={t} />
                        ) : (
                            <p className="text-sm text-night-muted">{t('heroes.noBuildsYet', 'No builds yet')}</p>
                        )}
                    </HomeSection>
                </div>

                <div className="grid gap-12 lg:grid-cols-2">
                    <HomeSection title={t('home.latestNews', 'Latest news')} href="/news" t={t}>
                        {latestNews.length ? (
                            <ul className="space-y-3">
                                {latestNews.map((item) => (
                                    <li key={item.id}>
                                        <a
                                            href={item.url || '/news'}
                                            target={item.url && !isSiteNews(item) ? '_blank' : undefined}
                                            rel={item.url && !isSiteNews(item) ? 'noopener noreferrer' : undefined}
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
                                                <p className="line-clamp-2 text-sm font-medium text-slate-100">{newsText(item, t).title}</p>
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
                    </HomeSection>
                    <HomeSection title={t('home.topGuides', 'Featured guides')} href="/guides" t={t}>
                        {topGuides.length ? (
                            <ul className="divide-y divide-night-line/60 rounded-xl border border-night-line bg-night-panel">
                                {topGuides.map((guide) => (
                                    <li key={guide.id}>
                                        <Link href={`/guides/${guide.slug}`} className="flex items-center gap-3 p-4 hover:bg-night-line/30">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-semibold text-slate-50">{guide.title}</p>
                                                <p className="mt-0.5 truncate text-xs text-night-muted">
                                                    {[guide.hero?.name, guide.is_anonymous || !guide.user?.name ? t('common.anonymous', 'Anonymous') : guide.user.name]
                                                        .filter(Boolean)
                                                        .join(' · ')}
                                                </p>
                                            </div>
                                            <span className="shrink-0 font-mono text-sm text-slate-300" title={t('home.likes', 'Likes')}>
                                                ♥ {formatNumber(guide.likes ?? 0)}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-night-muted">{t('guides.noGuides', 'No guides yet')}</p>
                        )}
                    </HomeSection>
                </div>

                {newest.length > 0 && (
                    <HomeSection title={t('home.newHeroes', 'Newest heroes')} href="/heroes" t={t}>
                        <NewestHeroes heroes={newest} />
                    </HomeSection>
                )}
            </div>
        </div>
    );
}
