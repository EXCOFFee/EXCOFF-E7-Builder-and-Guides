'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from '@/hooks/useTranslations';
import { useHeroTranslations } from '@/hooks/useNameTranslations';
import { SET_IMAGES, SET_NAMES } from '@/lib/sets';
import { getTagById, getTagLabel } from '@/lib/pros-cons-tags';
import { tagHref } from '@/components/ui/pro-cons-selector';
import { TIER_CATEGORIES, TIER_COLORS, averageToLetter, type TierCategory } from '@/components/ui/tier-rating-selector';
import { STAT_LABELS, PERCENT_STATS } from '@/components/heroes/StatLedger';
import { appendImageVersion } from '@/lib/heroImages';

/** GET /api/heroes/{slug}/stats: lo que dicen las builds publicadas de un héroe */
export interface HeroBuildStats {
    total_builds: number;
    primary_sets: { set: string; count: number }[];
    secondary_sets: { set: string; count: number }[];
    artifacts: { artifact_id: number; name: string; icon: string | null; count: number }[];
    /** Nota promedio que les ponen los autores a sus builds */
    average_ratings: Partial<Record<TierCategory | 'general', number>> | null;
    /** Nota que vota la comunidad, sumando todas las builds del héroe */
    community_ratings?: Partial<Record<TierCategory, { avg: number; count: number } | null>>;
    synergy_heroes?: MatchupHero[];
    counter_heroes?: MatchupHero[];
    priority_stats?: PriorityStat[];
    pro_tags?: { tag: string; count: number }[];
    con_tags?: { tag: string; count: number }[];
}

interface MatchupHero {
    hero_id: number;
    name: string;
    slug: string;
    image_url: string | null;
    element: string;
    count: number;
}

interface PriorityStat {
    stat: string;
    count: number;
    average_value: number;
    /** median/min/max: API de la etapa 3; una API anterior solo manda el promedio */
    median?: number;
    min?: number;
    max?: number;
}

type T = (key: string, fallback: string) => string;

/** Como los nombra la comunidad; el nombre completo va en el <abbr> */
const MODE_SHORT: Record<TierCategory, string> = { pve: 'PvE', arena: 'Arena', gw: 'GW', rta: 'RTA' };


function formatStat(stat: string, value: number): string {
    return PERCENT_STATS.has(stat) ? `${Math.round(value)}%` : Math.round(value).toLocaleString('en-US');
}

/** "3 de 5 builds" en el idioma de la página */
function ofBuilds(t: T, count: number, total: number): string {
    return t('heroes.xOfNBuilds', '{count} of {total} builds').replace('{count}', String(count)).replace('{total}', String(total));
}

/**
 * Conteo honesto: un cuadrito por build (hasta 20). Con pocas builds un "100%" engaña;
 * "1 de 1" a la vista no. Con más de 20 builds pasa a una barra.
 */
export function Tally({ count, total, label }: { count: number; total: number; label: string }) {
    if (total <= 0) return null;
    return (
        <span className="inline-flex items-center gap-2" role="img" aria-label={label}>
            {total <= 20 ? (
                <span className="flex flex-wrap gap-[3px]" aria-hidden>
                    {Array.from({ length: total }, (_, i) => (
                        <span key={i} className={`h-2.5 w-2.5 rounded-[3px] ${i < count ? 'bg-e7-gold' : 'bg-night-line'}`} />
                    ))}
                </span>
            ) : (
                <span className="h-2.5 w-24 overflow-hidden rounded-full bg-night-line" aria-hidden>
                    <span className="block h-full bg-e7-gold" style={{ width: `${(count / total) * 100}%` }} />
                </span>
            )}
            <span className="font-mono text-xs tabular-nums text-night-muted" aria-hidden>{count}/{total}</span>
        </span>
    );
}

/**
 * Veredicto por modo: la letra grande es la de la comunidad si hay votos; si no, la que
 * les ponen los autores a sus builds. Abajo, de dónde sale.
 */
export function HeroVerdict({ stats }: { stats: HeroBuildStats | null }) {
    const { t } = useTranslations();
    const total = stats?.total_builds ?? 0;

    return (
        <section aria-labelledby="hero-verdict-title" className="hero-sheet__panel p-4 sm:p-5">
            <h2 id="hero-verdict-title" className="hero-sheet__label font-sans">{t('heroes.verdict', 'Verdict by mode')}</h2>
            <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {TIER_CATEGORIES.map((mode) => {
                    const community = stats?.community_ratings?.[mode] ?? null;
                    const author = stats?.average_ratings?.[mode];
                    const value = community?.avg ?? author ?? null;
                    const letter = averageToLetter(value);

                    return (
                        <div key={mode} className="rounded-xl bg-night/60 px-3 py-3 text-center">
                            <dt className="font-mono text-[11px] font-semibold uppercase tracking-wider text-night-muted">
                                <abbr title={t(`builds.tier_${mode}`, mode.toUpperCase())} className="no-underline">{MODE_SHORT[mode]}</abbr>
                            </dt>
                            <dd>
                                <span className={`block font-hero text-5xl leading-tight ${letter ? TIER_COLORS[letter].text : 'text-night-line'}`}>
                                    {letter ?? '–'}
                                </span>
                                <span className="block min-h-4 text-[11px] text-night-muted">
                                    {community ? t('builds.votesCount', '{count} votes').replace('{count}', String(community.count)) : ''}
                                </span>
                            </dd>
                        </div>
                    );
                })}
            </dl>
            <p className="mt-3 text-xs text-night-muted">
                {total > 0
                    ? `${t('heroes.basedOnBuilds', 'Based on {count} builds on this site.').replace('{count}', String(total))} ${t('heroes.verdictSource', 'With votes, the letter is the community’s; without them, the average the authors give.')}`
                    : t('heroes.noBuildsVerdict', 'No builds yet, so there is no verdict.')}
            </p>
        </section>
    );
}

/** Pros y contras más marcados, con cuántas builds los marcan; llevan a esas builds */
export function CommunityTags({ stats, heroSlug }: { stats: HeroBuildStats; heroSlug: string }) {
    const { t, locale } = useTranslations();
    const total = stats.total_builds;
    const sides = [
        { key: 'pro', title: t('heroes.whatTheyPraise', 'What builds praise'), items: stats.pro_tags ?? [], tone: 'text-emerald-300' },
        { key: 'con', title: t('heroes.whatTheyCriticize', 'What builds criticize'), items: stats.con_tags ?? [], tone: 'text-rose-300' },
    ].map((side) => ({ ...side, items: side.items.filter((item) => getTagById(item.tag)).slice(0, 3) }));

    if (sides.every((side) => side.items.length === 0)) return null;

    return (
        <section className="grid gap-4 md:grid-cols-2">
            {sides.map(({ key, title, items, tone }) => (
                <div key={key} className="hero-sheet__panel p-4 sm:p-5">
                    <h2 className="hero-sheet__label font-sans">{title}</h2>
                    {items.length > 0 ? (
                        <ul className="mt-3 space-y-3">
                            {items.map((item) => {
                                const label = getTagLabel(getTagById(item.tag)!, locale);
                                return (
                                    <li key={item.tag} className="flex items-center justify-between gap-3">
                                        <Link href={tagHref(item.tag, heroSlug)} className={`min-w-0 truncate font-medium hover:underline ${tone}`}>
                                            {label}
                                        </Link>
                                        <Tally count={item.count} total={total} label={`${label}: ${ofBuilds(t, item.count, total)}`} />
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="mt-3 text-sm text-night-muted">{t('heroes.nothingMarkedYet', 'No build marks one yet.')}</p>
                    )}
                </div>
            ))}
        </section>
    );
}

function ArtifactThumb({ src, alt }: { src: string | null; alt: string }) {
    const [failed, setFailed] = useState(false);
    if (!src || failed) return <span className="flex h-full w-full items-center justify-center text-night-muted">?</span>;
    return <Image src={src} alt={alt} width={48} height={64} className="h-full w-full object-contain" onError={() => setFailed(true)} />;
}

/** Cómo se arma: sets, artefactos y los stats que piden las builds (mediana y rango) */
export function BuildRecipe({ stats }: { stats: HeroBuildStats }) {
    const { t } = useTranslations();
    const total = stats.total_builds;
    const setGroups = [
        { title: t('builds.primarySet', 'Primary Set'), items: stats.primary_sets.slice(0, 3) },
        { title: t('builds.secondarySet', 'Secondary Set'), items: stats.secondary_sets.slice(0, 3) },
    ].filter((group) => group.items.length > 0);
    const statRows = (stats.priority_stats ?? []).filter((row) => row.count > 0);

    return (
        <section aria-labelledby="build-recipe-title" className="hero-sheet__panel p-4 sm:p-5">
            <h2 id="build-recipe-title" className="hero-sheet__label font-sans">{t('heroes.howItsBuilt', 'How it’s built')}</h2>
            <div className="mt-4 grid gap-6 lg:grid-cols-3">
                <div className="space-y-4">
                    {setGroups.map((group) => (
                        <div key={group.title}>
                            <h3 className="mb-2 text-xs uppercase tracking-wider text-night-muted">{group.title}</h3>
                            <ul className="space-y-2">
                                {group.items.map((item) => {
                                    const name = SET_NAMES[item.set.toLowerCase()] ?? item.set;
                                    return (
                                        <li key={item.set} className="flex items-center gap-3">
                                            {SET_IMAGES[item.set.toLowerCase()] && (
                                                <Image src={SET_IMAGES[item.set.toLowerCase()]} alt="" width={28} height={28} unoptimized className="h-7 w-7" />
                                            )}
                                            <span className="flex-1 truncate text-sm text-slate-100">{name}</span>
                                            <Tally count={item.count} total={total} label={`${name}: ${ofBuilds(t, item.count, total)}`} />
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                    {setGroups.length === 0 && <p className="text-sm text-night-muted">{t('heroes.noSetsYet', 'No sets yet.')}</p>}
                </div>

                <div>
                    <h3 className="mb-2 text-xs uppercase tracking-wider text-night-muted">{t('heroes.artifacts', 'Artifacts')}</h3>
                    {stats.artifacts.length > 0 ? (
                        <ul className="space-y-2">
                            {stats.artifacts.slice(0, 3).map((item) => {
                                // La API ya lo manda traducido (?lang=)
                                const name = item.name;
                                return (
                                    <li key={item.artifact_id} className="flex items-center gap-3">
                                        <span className="h-12 w-9 shrink-0 overflow-hidden rounded bg-night">
                                            <ArtifactThumb src={item.icon} alt="" />
                                        </span>
                                        <span className="flex-1 truncate text-sm text-slate-100">{name}</span>
                                        <Tally count={item.count} total={total} label={`${name}: ${ofBuilds(t, item.count, total)}`} />
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-sm text-night-muted">{t('heroes.noArtifactsYet', 'No artifacts yet.')}</p>
                    )}
                </div>

                <div>
                    <h3 className="mb-2 text-xs uppercase tracking-wider text-night-muted">{t('heroes.typicalStats', 'Stats builds aim for')}</h3>
                    {statRows.length > 0 ? (
                        <dl className="space-y-1.5">
                            {statRows.map((row) => (
                                <div key={row.stat} className="flex items-baseline justify-between gap-3 border-b border-night-line/50 pb-1.5">
                                    <dt className="font-mono text-xs text-night-muted">{STAT_LABELS[row.stat as keyof typeof STAT_LABELS] ?? row.stat}</dt>
                                    <dd className="text-right">
                                        <span className="font-mono text-sm font-semibold tabular-nums text-slate-100">{formatStat(row.stat, row.median ?? row.average_value)}</span>
                                        {row.count > 1 && row.min != null && row.max != null && (
                                            <span className="ml-2 font-mono text-[11px] tabular-nums text-night-muted">
                                                {formatStat(row.stat, row.min)}–{formatStat(row.stat, row.max)}
                                            </span>
                                        )}
                                        <span className="ml-2 text-[11px] text-night-muted">· {ofBuilds(t, row.count, total)}</span>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    ) : (
                        <p className="text-sm text-night-muted">{t('heroes.noStatsYet', 'No build lists minimum stats yet.')}</p>
                    )}
                    {statRows.length > 0 && (
                        <p className="mt-2 text-[11px] text-night-muted">{t('heroes.typicalStatsHint', 'Median of the minimum stats each build lists, and the range.')}</p>
                    )}
                </div>
            </div>
        </section>
    );
}

/** Contra quién le cuesta y con quién rinde, según las builds */
export function HeroMatchups({ stats }: { stats: HeroBuildStats }) {
    const { t } = useTranslations();
    const { translateHeroName } = useHeroTranslations();
    const total = stats.total_builds;
    const groups = [
        { key: 'counters', title: t('heroes.counteredBy', 'Countered by'), items: stats.counter_heroes ?? [] },
        { key: 'synergies', title: t('heroes.worksWith', 'Works well with'), items: stats.synergy_heroes ?? [] },
    ];
    if (groups.every((group) => group.items.length === 0)) return null;

    return (
        <section className="grid gap-4 md:grid-cols-2">
            {groups.map(({ key, title, items }) => (
                <div key={key} className="hero-sheet__panel p-4 sm:p-5">
                    <h2 className="hero-sheet__label font-sans">{title}</h2>
                    {items.length > 0 ? (
                        <ul className="mt-3 grid grid-cols-2 gap-3">
                            {items.map((hero) => {
                                const name = translateHeroName(hero.name);
                                return (
                                    <li key={hero.hero_id}>
                                        <Link href={`/heroes/${hero.slug}`} className="group flex items-center gap-2 rounded-lg p-1.5 hover:bg-night/60">
                                            {hero.image_url && (
                                                <Image src={appendImageVersion(hero.image_url)} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                                            )}
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm text-slate-100 group-hover:underline">{name}</span>
                                                <span className="block font-mono text-[11px] tabular-nums text-night-muted">{hero.count}/{total}</span>
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="mt-3 text-sm text-night-muted">{t('heroes.nothingMarkedYet', 'No build marks one yet.')}</p>
                    )}
                </div>
            ))}
        </section>
    );
}
