'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { heroApi, buildApi } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTranslations } from '@/hooks/useTranslations';
import type { HeroSkillMessages } from '@/i18n/config';
import { useHeroTranslations } from '@/hooks/useNameTranslations';
import { PopularBuildStats, type HeroBuildStats } from '@/components/heroes/PopularBuildStats';
import { appendImageVersion } from '@/lib/heroImages';
import { formatDate, formatNumber } from '@/lib/utils';
import { formatSkillText } from '@/utils/skillFormatter';
import { SkillEffects, SkillIcon, useHeroEffects } from '@/components/heroes/SkillEffects';
import { StatLedger, type ClassStatRange } from '@/components/heroes/StatLedger';



interface HeroStats {
    atk: number;
    def: number;
    hp: number;
    spd: number;
    crit_chance: number;
    crit_dmg: number;
    eff: number;
    res: number;
}

interface PopularSet {
    sets: string[];
    set_codes: string[];
    count: number;
    percentage: number;
}

interface PopularArtifact {
    code: string;
    count: number;
    percentage: number;
}

interface SelfDevotion {
    type: string;
    grades: {
        B?: number;
        A?: number;
        S?: number;
        SS?: number;
        SSS?: number;
    };
}

/** Build publicada en la web, tal como la devuelve GET /api/heroes/{slug}/builds */
interface HeroBuildSummary {
    id: number;
    title: string;
    description?: string | null;
    primary_set?: string | null;
    secondary_set?: string | null;
    views?: number;
    likes?: number;
    created_at?: string;
    user?: { name?: string } | null;
}

export interface Hero {
    id: number;
    code: string;
    hero_code?: string; // Numeric code for skill icons (e.g., 'c1144')
    name: string;
    slug: string;
    element: string;
    class: string;
    rarity: number;
    base_stats: HeroStats;
    skills: Record<string, unknown>;
    self_devotion?: SelfDevotion;
    image_url: string;
    popular_sets: PopularSet[];
    popular_artifacts: PopularArtifact[];
    avg_stats: HeroStats | null;
    guides_count: number;
    stats_updated_at: string | null;
}

// Element to image mapping
const ELEMENT_IMAGES: Record<string, string> = {
    fire: '/images/elements/ElementFire.png',
    ice: '/images/elements/ElementWater.png',
    earth: '/images/elements/ElementEarth.png',
    light: '/images/elements/ElementLight.png',
    dark: '/images/elements/ElementDark.png',
};

const CLASS_ICONS: Record<string, string> = {
    knight: '🛡️',
    warrior: '⚔️',
    thief: '🗡️',
    ranger: '🏹',
    mage: '🔮',
    soul_weaver: '💚',
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

// Set code to local image URL mapping (for Fribbels data)
import { SET_IMAGES as SET_IMAGES_LOWERCASE } from '@/lib/sets';



// Memory Imprint type names mapping
const IMPRINT_TYPES: Record<string, { name: string; color: string }> = {
    att: { name: 'Attack', color: 'text-red-400' },
    att_rate: { name: 'Attack%', color: 'text-red-400' },
    def: { name: 'Defense', color: 'text-blue-400' },
    def_rate: { name: 'Defense%', color: 'text-blue-400' },
    max_hp: { name: 'Health', color: 'text-green-400' },
    max_hp_rate: { name: 'Health%', color: 'text-green-400' },
    speed: { name: 'Speed', color: 'text-yellow-400' },
    cri: { name: 'Crit Chance', color: 'text-orange-400' },
    cri_damage: { name: 'Crit Damage', color: 'text-purple-400' },
    acc: { name: 'Effectiveness', color: 'text-cyan-400' },
    res: { name: 'Effect Resistance', color: 'text-pink-400' },
};

const IMPRINT_GRADES = ['B', 'A', 'S', 'SS', 'SSS'] as const;

/** Stats promedio de Fribbels: clave, etiqueta y sufijo */
const AVG_STATS: [keyof HeroStats, string, string][] = [
    ['atk', 'ATK', ''],
    ['hp', 'HP', ''],
    ['def', 'DEF', ''],
    ['spd', 'SPD', ''],
    ['crit_chance', 'CRIT', '%'],
    ['crit_dmg', 'C.DMG', '%'],
    ['eff', 'EFF', '%'],
    ['res', 'RES', '%'],
];

export function HeroDetailClient({
    initialHero,
    initialStats,
    skillMessages,
    classRange,
}: {
    initialHero: Hero | null;
    initialStats: HeroBuildStats | null;
    skillMessages: HeroSkillMessages | null;
    classRange: ClassStatRange | null;
}) {
    const params = useParams();
    const slug = params.slug as string;
    const { t, locale } = useTranslations();
    const { translateHeroName } = useHeroTranslations();
    const effectsData = useHeroEffects();

    const { data, isLoading, error } = useQuery({
        queryKey: ['hero', slug, locale],
        queryFn: async () => {
            const response = await heroApi.get(slug, locale);
            return response.data;
        },
        enabled: !!slug,
        // Renderizado en el servidor con el mismo idioma: sin pantalla de carga ni salto de layout
        initialData: initialHero ? { data: initialHero } : undefined,
    });

    const hero: Hero | null = data?.data || data;

    // Get translated hero name for Asian locales
    const translatedHeroName = hero ? translateHeroName(hero.name) : '';

    // Fetch builds for this hero
    const { data: buildsData } = useQuery({
        queryKey: ['hero-builds', slug],
        queryFn: async () => {
            const response = await buildApi.getByHero(slug);
            return response.data;
        },
        enabled: !!hero?.id,
    });

    const builds = useMemo<HeroBuildSummary[]>(() => buildsData?.data || [], [buildsData]);

    // Builds filter states
    const [buildSearch, setBuildSearch] = useState('');
    const [buildSetFilter, setBuildSetFilter] = useState('');
    const [buildSortBy, setBuildSortBy] = useState<'newest' | 'views_desc' | 'views_asc' | 'likes_desc' | 'likes_asc'>('newest');

    // Get unique sets from builds
    const availableSets = useMemo(() => {
        const sets = new Set<string>();
        builds.forEach((build) => {
            if (build.primary_set) sets.add(build.primary_set);
            if (build.secondary_set) sets.add(build.secondary_set);
        });
        return Array.from(sets).sort();
    }, [builds]);

    // Filter and sort builds
    const filteredBuilds = useMemo(() => {
        let result = [...builds];

        // Search filter
        if (buildSearch.trim()) {
            const search = buildSearch.toLowerCase();
            result = result.filter((build) =>
                build.title?.toLowerCase().includes(search) ||
                build.description?.toLowerCase().includes(search) ||
                build.user?.name?.toLowerCase().includes(search)
            );
        }

        // Set filter
        if (buildSetFilter) {
            result = result.filter((build) =>
                build.primary_set === buildSetFilter || build.secondary_set === buildSetFilter
            );
        }

        // Sort
        switch (buildSortBy) {
            case 'views_desc':
                result.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            case 'views_asc':
                result.sort((a, b) => (a.views || 0) - (b.views || 0));
                break;
            case 'likes_desc':
                result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
                break;
            case 'likes_asc':
                result.sort((a, b) => (a.likes || 0) - (b.likes || 0));
                break;
            case 'newest':
            default:
                result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
                break;
        }

        return result;
    }, [builds, buildSearch, buildSetFilter, buildSortBy]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-e7-void flex items-center justify-center">
                <div className="text-center">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-32 h-32 mx-auto"
                    >
                        <source src="/videos/RasRun.mp4" type="video/mp4" />
                    </video>
                    <p className="text-gray-400 mt-2">{t('heroes.loadingHero', 'Loading hero data...')}</p>
                </div>
            </div>
        );
    }

    if (error || !hero) {
        return (
            <div className="min-h-screen bg-e7-void flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-xl mb-4">{t('heroes.notFound', 'Hero not found')}</p>
                    <Link href="/heroes" className="text-e7-gold hover:underline">
                        ← {t('heroes.backToHeroes', 'Back to Heroes')}
                    </Link>
                </div>
            </div>
        );
    }

    const hasUsageStats = hero.guides_count > 0;

    const className = t(`classes.${hero.class}`, hero.class.replace('_', ' '));
    const elementName = t(`elements.${hero.element}`, hero.element);

    return (
        <div className="hero-sheet min-h-screen pb-12" data-element={hero.element}>
            {/* Cabecera: retrato, nombre y stats base contra su clase */}
            <section className="hero-sheet__halo border-b border-night-line/60">
                <div className="max-w-6xl mx-auto px-4 pt-6 pb-8">
                    <Link
                        href="/heroes"
                        className="inline-flex items-center gap-2 text-sm text-night-muted transition-colors hover:text-slate-100"
                    >
                        <span aria-hidden>←</span> {t('heroes.backToHeroes', 'Back to Heroes')}
                    </Link>

                    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center">
                        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                            <div className="relative w-44 shrink-0 sm:w-52">
                                <div className="aspect-square overflow-hidden rounded-2xl border border-el/40 bg-night-panel shadow-[0_0_60px_-12px_var(--el)]">
                                    {hero.image_url ? (
                                        <Image
                                            src={appendImageVersion(hero.image_url)}
                                            alt={hero.name}
                                            width={208}
                                            height={208}
                                            className="h-full w-full object-cover"
                                            priority
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <span className="text-7xl opacity-50">{CLASS_ICONS[hero.class] || '⚔️'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="min-w-0 text-center sm:text-left">
                                <p className="text-lg tracking-[0.3em] text-e7-gold" aria-label={`${hero.rarity}★`}>
                                    {'★'.repeat(hero.rarity)}
                                </p>
                                <h1 className="mt-1 font-hero text-4xl font-normal leading-tight tracking-normal text-slate-50 sm:text-5xl lg:text-6xl">
                                    {translatedHeroName}
                                </h1>
                                <p className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-slate-300 sm:justify-start">
                                    <span className="inline-flex items-center gap-1.5">
                                        {ELEMENT_IMAGES[hero.element] && (
                                            <Image src={ELEMENT_IMAGES[hero.element]} alt="" width={20} height={20} className="h-5 w-5" />
                                        )}
                                        <span className="text-el-ink font-medium">{elementName}</span>
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        {CLASS_IMAGES[hero.class] && (
                                            <Image src={CLASS_IMAGES[hero.class]} alt="" width={20} height={20} className="h-5 w-5" />
                                        )}
                                        {className}
                                    </span>
                                    {hasUsageStats && (
                                        // Muestra de Fribbels, no las builds publicadas en la web
                                        <span className="font-mono text-xs text-night-muted" title={t('heroes.analyzedBuildsHint', 'Community data from Fribbels Epic 7 Optimizer')}>
                                            {t('heroes.analyzedBuilds', '{count} builds analyzed').replace('{count}', formatNumber(hero.guides_count))}
                                        </span>
                                    )}
                                </p>
                                <Link
                                    href={`/builds/create?hero_id=${hero.id}&hero_name=${encodeURIComponent(hero.name)}`}
                                    className="btn-gold mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm"
                                >
                                    {t('heroes.createBuild', 'Create Build')}
                                </Link>
                            </div>
                        </div>

                        <div className="hero-sheet__panel p-4 sm:p-5">
                            <h2 className="hero-sheet__label font-sans">{t('heroes.baseStats', 'Base Stats (Lv.60 Fully Awakened)')}</h2>
                            <StatLedger stats={hero.base_stats} range={classRange} className={className} t={t} />
                            {classRange && (
                                <p className="mt-3 flex items-center gap-2 text-xs text-night-muted">
                                    <span className="inline-block h-3 w-0.5 rounded bg-slate-100/80" aria-hidden />
                                    {t('heroes.classRangeHint', 'Mark: median of {class} {rarity}★ ({count} heroes). Bar: from the lowest to the highest in that group.')
                                        .replace('{count}', String(classRange.atk?.count ?? ''))
                                        .replace('{rarity}', String(hero.rarity))
                                        .replace('{class}', className)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 pt-8 space-y-8">
                {/* Skills */}
                {hero.skills && Object.keys(hero.skills).length > 0 && (
                    <section>
                        <h2 className="hero-sheet__label font-sans mb-4">{t('heroes.skills', 'Skills & Damage Scaling')}</h2>
                        <ol className="space-y-3">
                            {Object.entries(hero.skills).map(([skillKey, skill]) => {
                                const s = skill as {
                                    name?: string;
                                    description?: string;
                                    rate?: number;
                                    pow?: number;
                                    targets?: number;
                                    cooldown?: number;
                                    soulburn?: boolean;
                                    soulburn_effect?: string;
                                    soulburn_souls?: number;
                                    penetration?: number;
                                };

                                // Traducción enviada por el servidor; si falta, texto de la API
                                const translated = skillMessages?.[skillKey];
                                const skillName = translated?.name || s.name || `Skill ${skillKey}`;
                                const skillDesc = translated?.description || s.description || '';
                                const skillSoulburn = s.soulburn ? translated?.soulburn_effect || s.soulburn_effect || '' : null;

                                return (
                                    <li key={skillKey} className="hero-sheet__panel p-4 sm:p-5">
                                        <div className="flex gap-4">
                                            <div className="shrink-0">
                                                {hero.hero_code ? (
                                                    <SkillIcon heroCode={hero.hero_code} skillKey={skillKey} />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-lg bg-night-line" aria-hidden />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                                    <span className="font-mono text-xs font-semibold text-el-ink">{skillKey}</span>
                                                    <h3 className="font-sans text-base font-semibold text-slate-50">{skillName}</h3>
                                                    <span className="flex flex-wrap gap-2 font-mono text-[11px] text-night-muted">
                                                        {s.targets && (
                                                            <span>
                                                                {s.targets === 1
                                                                    ? t('heroes.singleTarget', 'Single Target')
                                                                    : t('heroes.targets', '{count} Targets').replace('{count}', String(s.targets))}
                                                            </span>
                                                        )}
                                                        {s.cooldown && (
                                                            <span className="rounded bg-night-line/70 px-1.5 py-0.5 text-slate-200">
                                                                {t('heroes.turns', '{count} Turns').replace('{count}', String(s.cooldown))}
                                                            </span>
                                                        )}
                                                        {s.rate !== undefined && s.rate > 0 && (
                                                            <span>
                                                                {t('heroes.atkRate', 'ATK Rate')} {(s.rate * 100).toFixed(0)}%
                                                            </span>
                                                        )}
                                                        {s.penetration !== undefined && s.penetration > 0 && (
                                                            <span>
                                                                {t('heroes.penetration', 'Penetration')} {(s.penetration * 100).toFixed(0)}%
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Íconos de buffs/debuffs de la skill */}
                                                <div className="mt-2">
                                                    <SkillEffects
                                                        heroName={hero.name}
                                                        skillKey={skillKey}
                                                        fallbackText={`${skillDesc || ''} ${skillSoulburn || ''}`}
                                                        data={effectsData}
                                                    />
                                                </div>

                                                {skillDesc ? (
                                                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-300">
                                                        {formatSkillText(skillDesc)}
                                                    </p>
                                                ) : (
                                                    <p className="mt-2 text-sm italic text-night-muted">
                                                        {t('heroes.passiveSkill', 'Passive or support skill')}
                                                    </p>
                                                )}

                                                {s.soulburn && skillSoulburn && (
                                                    <p className="mt-3 border-l-2 border-violet-400/60 pl-3 text-sm text-violet-100/90">
                                                        <span className="mr-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-violet-300">
                                                            {t('heroes.soulburn', 'Soulburn')} ·{' '}
                                                            {t('heroes.souls', '{count} Souls').replace('{count}', String(s.soulburn_souls || 10))}
                                                        </span>
                                                        {formatSkillText(skillSoulburn)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </section>
                )}

                {/* Impronta de memoria */}
                {hero.self_devotion && (
                    <section className="hero-sheet__panel p-4 sm:p-5">
                        <h2 className="hero-sheet__label font-sans">
                            {t('heroes.memoryImprint', 'Memory Imprint')}
                            <span className={`normal-case tracking-normal font-semibold ${IMPRINT_TYPES[hero.self_devotion.type]?.color || 'text-slate-200'}`}>
                                {IMPRINT_TYPES[hero.self_devotion.type]?.name || hero.self_devotion.type}
                            </span>
                        </h2>
                        <ol className="mt-4 grid grid-cols-5 gap-2 sm:gap-3">
                            {IMPRINT_GRADES.map((grade) => {
                                const value = hero.self_devotion?.grades?.[grade];
                                const isPercentage =
                                    hero.self_devotion?.type?.includes('rate') ||
                                    ['cri', 'cri_damage', 'acc', 'res'].includes(hero.self_devotion?.type || '');

                                return (
                                    <li key={grade} className="flex flex-col items-center gap-2 rounded-lg bg-night/60 py-3">
                                        <Image
                                            src={`${(process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '')}/images/imprints/hero_dedi_a_${grade.toLowerCase()}.png`}
                                            alt={grade}
                                            width={32}
                                            height={32}
                                            className="h-8 w-8 object-contain"
                                            unoptimized
                                        />
                                        <span className="font-mono text-sm font-semibold tabular-nums text-slate-100">
                                            {value !== undefined
                                                ? isPercentage
                                                    ? `${(value * 100).toFixed(1)}%`
                                                    : `+${Math.round(value)}`
                                                : '-'}
                                        </span>
                                    </li>
                                );
                            })}
                        </ol>
                    </section>
                )}

                {/* Sets y artefactos más usados */}
                <PopularBuildStats heroSlug={slug} initialStats={initialStats} />

                {/* Stats promedio de las builds analizadas */}
                {hasUsageStats && hero.avg_stats && (
                    <section className="hero-sheet__panel p-4 sm:p-5">
                        <h2 className="hero-sheet__label font-sans">
                            {t('heroes.averageStats', 'Average Build Stats')}
                            <span className="normal-case tracking-normal font-normal">
                                {t('heroes.fromBuilds', 'from {count} builds').replace('{count}', formatNumber(hero.guides_count))}
                            </span>
                        </h2>
                        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 lg:grid-cols-8">
                            {AVG_STATS.map(([key, label, suffix]) => (
                                <div key={key} className="border-l-2 border-el/50 pl-3">
                                    <dt className="font-mono text-[11px] font-semibold tracking-wider text-night-muted">{label}</dt>
                                    <dd className="font-mono text-lg font-semibold tabular-nums text-slate-100">
                                        {formatNumber(hero.avg_stats?.[key])}
                                        {suffix}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                )}

                {hero.stats_updated_at && (
                    <p className="text-center font-mono text-xs text-night-muted">
                        {t('heroes.statsUpdated', 'Stats last updated: {date}').replace('{date}', formatDate(hero.stats_updated_at, locale))}
                    </p>
                )}

                {/* Community Builds Section */}
                <Card className="hero-sheet__panel overflow-hidden">
                    <CardHeader className="border-b border-night-line/60">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                            <h2 className="hero-sheet__label font-sans flex-1 w-full">
                                <span>{t('heroes.communityBuilds', 'Community Builds')}</span>
                                {builds.length > 0 && (
                                    <span className="font-mono normal-case tracking-normal font-normal">{builds.length}</span>
                                )}
                            </h2>
                            <Link
                                href={`/builds/create?hero_id=${hero.id}&hero_name=${encodeURIComponent(hero.name)}`}
                                className="btn-gold shrink-0 px-4 py-1.5 text-sm"
                            >
                                + {t('heroes.createBuild', 'Create Build')}
                            </Link>
                        </div>

                        {/* Filters Row */}
                        {builds.length > 0 && (
                            <div className="mt-4 flex flex-col sm:flex-row gap-3 items-center">
                                {/* Search */}
                                <div className="relative flex-1 min-w-0 w-full sm:w-auto">
                                    <input
                                        type="text"
                                        value={buildSearch}
                                        onChange={(e) => setBuildSearch(e.target.value)}
                                        placeholder={t('heroes.searchBuilds', 'Search builds...')}
                                        className="w-full px-3 py-2 pl-9 text-sm rounded-lg bg-night border border-night-line text-white placeholder-neutral-400 focus:border-e7-gold focus:outline-none"
                                    />
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                {/* Set Filter */}
                                {availableSets.length > 0 && (
                                    <select
                                        aria-label={t('heroes.filterBySet', 'Filter by set')}
                                        value={buildSetFilter}
                                        onChange={(e) => setBuildSetFilter(e.target.value)}
                                        className="px-3 py-2 text-sm rounded-lg bg-night border border-night-line text-slate-200 focus:border-e7-gold focus:outline-none cursor-pointer min-w-[140px]"
                                    >
                                        <option value="">{t('heroes.allSets', 'All Sets')}</option>
                                        {availableSets.map(set => (
                                            <option key={set} value={set}>{set}</option>
                                        ))}
                                    </select>
                                )}

                                {/* Sort */}
                                <select
                                    aria-label={t('common.sortBy', 'Sort by')}
                                    value={buildSortBy}
                                    onChange={(e) => setBuildSortBy(e.target.value as typeof buildSortBy)}
                                    className="px-3 py-2 text-sm rounded-lg bg-night border border-night-line text-slate-200 focus:border-e7-gold focus:outline-none cursor-pointer min-w-[160px]"
                                >
                                    <option value="newest">{t('common.newest', 'Newest')}</option>
                                    <option value="views_desc">{t('common.viewsHigh', 'Views (High)')}</option>
                                    <option value="views_asc">{t('common.viewsLow', 'Views (Low)')}</option>
                                    <option value="likes_desc">{t('common.likesHigh', 'Likes (High)')}</option>
                                    <option value="likes_asc">{t('common.likesLow', 'Likes (Low)')}</option>
                                </select>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="pt-4">
                        {builds.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <p className="text-lg mb-2">{t('heroes.noBuildsYet', 'No builds for this hero yet')}</p>
                                <p className="text-sm">{t('heroes.beFirst', 'Be the first to share your build!')}</p>
                            </div>
                        ) : filteredBuilds.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <p className="text-lg mb-2">{t('heroes.noBuildsMatch', 'No builds match your filters')}</p>
                                <button
                                    onClick={() => { setBuildSearch(''); setBuildSetFilter(''); }}
                                    className="text-e7-gold hover:text-e7-text-gold text-sm"
                                >
                                    {t('common.clearFilters', 'Clear filters')}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredBuilds.slice(0, 5).map((build) => (
                                    <Link key={build.id} href={`/builds/${build.id}`}>
                                        <div className="bg-night/60 rounded-lg p-4 border border-night-line hover:border-el/60 transition-all cursor-pointer">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-sans text-base font-semibold text-slate-50">{build.title}</h3>
                                                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{build.description}</p>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {build.primary_set && (
                                                            <span className="px-2 py-0.5 rounded bg-e7-panel text-xs text-gray-300 flex items-center gap-1">
                                                                {SET_IMAGES_LOWERCASE[build.primary_set] && (
                                                                    <Image
                                                                        src={SET_IMAGES_LOWERCASE[build.primary_set]}
                                                                        alt={build.primary_set}
                                                                        width={14}
                                                                        height={14}
                                                                        unoptimized
                                                                    />
                                                                )}
                                                                {build.primary_set}
                                                            </span>
                                                        )}
                                                        {build.secondary_set && (
                                                            <span className="px-2 py-0.5 rounded bg-e7-panel text-xs text-gray-300 flex items-center gap-1">
                                                                {SET_IMAGES_LOWERCASE[build.secondary_set] && (
                                                                    <Image
                                                                        src={SET_IMAGES_LOWERCASE[build.secondary_set]}
                                                                        alt={build.secondary_set}
                                                                        width={14}
                                                                        height={14}
                                                                        unoptimized
                                                                    />
                                                                )}
                                                                {build.secondary_set}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-e7-gold font-bold flex items-center gap-1 justify-end">
                                                        <Image src="/images/ras-like.gif" alt="like" width={18} height={18} unoptimized />
                                                        {build.likes || 0}
                                                    </div>
                                                    <div className="text-neutral-400 text-xs flex items-center gap-1 justify-end">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        {build.views || 0}
                                                    </div>
                                                    <div className="text-gray-400 text-xs">{build.user?.name || t('common.anonymous', 'Anonymous')}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {filteredBuilds.length > 5 && (
                                    <Link href={`/builds?hero=${hero.slug}`} className="block text-center text-e7-gold hover:text-e7-text-gold text-sm">
                                        {t('heroes.viewAllBuilds', `View all ${filteredBuilds.length} builds`)} →
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

