'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { heroApi, buildApi } from '@/lib/api';
import { useTranslations } from '@/hooks/useTranslations';
import type { HeroSkillMessages } from '@/i18n/config';
import { useHeroTranslations } from '@/hooks/useNameTranslations';
import { HeroVerdict, CommunityTags, BuildRecipe, HeroMatchups, type HeroBuildStats } from '@/components/heroes/HeroCommunity';
import { appendImageVersion } from '@/lib/heroImages';
import { formatSkillText } from '@/utils/skillFormatter';
import { SkillEffects, SkillIcon, useHeroEffects } from '@/components/heroes/SkillEffects';
import { StatLedger, type ClassStatRange } from '@/components/heroes/StatLedger';
import { SET_IMAGES, SET_NAMES } from '@/lib/sets';



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

/** Build publicada en la web, tal como la devuelve GET /api/heroes/{slug}/builds (ordenadas por likes) */
interface HeroBuildSummary {
    id: number;
    title: string;
    primary_set?: string | null;
    secondary_set?: string | null;
    views?: number;
    likes?: number;
    is_anonymous?: boolean;
    user?: { name?: string } | null;
    artifact?: { name: string; icon: string | null } | null;
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
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const BEST_BUILDS = 5;

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

    // Lo que dicen las builds publicadas (sets, tags, counters, notas por modo)
    const { data: stats } = useQuery<HeroBuildStats | null>({
        queryKey: ['hero-stats', slug, locale],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/heroes/${slug}/stats?lang=${locale}`);
            return response.ok ? (await response.json()).data : null;
        },
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
        initialData: initialStats ?? undefined,
    });

    // Mejores builds: la API las devuelve ordenadas por likes
    const { data: buildsData } = useQuery({
        queryKey: ['hero-builds', slug],
        queryFn: async () => (await buildApi.getByHero(slug)).data,
        enabled: !!hero?.id,
    });
    const builds = useMemo<HeroBuildSummary[]>(() => buildsData?.data || [], [buildsData]);

    // Get translated hero name for Asian locales
    const translatedHeroName = hero ? translateHeroName(hero.name) : '';

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

    const className = t(`classes.${hero.class}`, hero.class.replace('_', ' '));
    const elementName = t(`elements.${hero.element}`, hero.element);
    const totalBuilds = stats?.total_builds ?? 0;
    const createHref = `/builds/create?hero_id=${hero.id}&hero_name=${encodeURIComponent(hero.name)}`;

    return (
        <div className="hero-sheet min-h-screen pb-12" data-element={hero.element}>
            {/* Cabecera: retrato, nombre y el veredicto de las builds por modo */}
            <section className="hero-sheet__halo border-b border-night-line/60">
                <div className="max-w-6xl mx-auto px-4 pt-6 pb-8">
                    <Link
                        href="/heroes"
                        className="inline-flex items-center gap-2 text-sm text-night-muted transition-colors hover:text-slate-100"
                    >
                        <span aria-hidden>←</span> {t('heroes.backToHeroes', 'Back to Heroes')}
                    </Link>

                    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-center">
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
                                    <Link href={`/builds?hero=${hero.slug}`} className="font-mono text-xs text-night-muted hover:text-slate-100 hover:underline">
                                        {t('heroes.buildsOnSite', '{count} builds on this site').replace('{count}', String(totalBuilds))}
                                    </Link>
                                </p>
                                <Link href={createHref} className="btn-gold mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm">
                                    {t('heroes.createBuild', 'Create Build')}
                                </Link>
                            </div>
                        </div>

                        <HeroVerdict stats={stats ?? null} />
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 pt-8 space-y-8">
                {totalBuilds < 3 && (
                    <p className="hero-sheet__panel flex flex-col gap-3 p-4 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                        <span>
                            {totalBuilds === 0
                                ? t('heroes.noBuildsInvite', 'Nobody has shared a build for this hero yet. Yours would be the first.')
                                : t('heroes.fewBuildsInvite', 'Only {count} builds so far: every new one makes this page more reliable.').replace('{count}', String(totalBuilds))}
                        </span>
                        <Link href={createHref} className="shrink-0 font-semibold text-e7-gold hover:underline">
                            {t('heroes.shareYourBuild', 'Share your build')} →
                        </Link>
                    </p>
                )}

                {stats && totalBuilds > 0 && (
                    <>
                        <CommunityTags stats={stats} heroSlug={hero.slug} />
                        <BuildRecipe stats={stats} />
                        <HeroMatchups stats={stats} />
                    </>
                )}

                {/* Mejores builds */}
                {builds.length > 0 && (
                    <section aria-labelledby="best-builds-title" className="hero-sheet__panel p-4 sm:p-5">
                        <div className="flex items-baseline justify-between gap-3">
                            <h2 id="best-builds-title" className="hero-sheet__label font-sans">{t('heroes.bestBuilds', 'Best builds')}</h2>
                            {builds.length > BEST_BUILDS && (
                                <Link href={`/builds?hero=${hero.slug}`} className="text-sm text-e7-gold hover:underline">
                                    {t('heroes.viewAllBuildsCount', 'See all {count}').replace('{count}', String(totalBuilds || builds.length))} →
                                </Link>
                            )}
                        </div>
                        <ol className="mt-3 divide-y divide-night-line/60">
                            {builds.slice(0, BEST_BUILDS).map((build) => (
                                <li key={build.id}>
                                    <Link href={`/builds/${build.id}`} className="flex items-center gap-4 py-3 hover:bg-night/40">
                                        <span className="flex shrink-0 gap-1">
                                            {[build.primary_set, build.secondary_set].filter(Boolean).map((set) => (
                                                SET_IMAGES[set!.toLowerCase()] ? (
                                                    <Image key={set} src={SET_IMAGES[set!.toLowerCase()]} alt={SET_NAMES[set!.toLowerCase()] ?? set!} width={24} height={24} unoptimized className="h-6 w-6" />
                                                ) : null
                                            ))}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate font-semibold text-slate-50">{build.title}</span>
                                            <span className="block truncate text-xs text-night-muted">
                                                {build.artifact?.name ? `${build.artifact.name} · ` : ''}
                                                {build.is_anonymous || !build.user?.name ? t('common.anonymous', 'Anonymous') : build.user.name}
                                            </span>
                                        </span>
                                        <span className="shrink-0 text-right font-mono text-xs tabular-nums text-night-muted">
                                            <span className="block text-e7-gold">♥ {build.likes || 0}</span>
                                            <span className="block">{t('heroes.viewsCount', '{count} views').replace('{count}', String(build.views || 0))}</span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </section>
                )}

                {/* Ficha del juego: stats base, skills e impronta (CeciliaBot ya lo muestra; acá va plegado) */}
                <details className="group hero-sheet__panel">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
                        <span>
                            <span className="hero-sheet__label font-sans">{t('heroes.gameData', 'Game data')}</span>
                            <span className="mt-1 block text-sm text-night-muted">{t('heroes.gameDataHint', 'Base stats, skills and memory imprint')}</span>
                        </span>
                        <span className="text-night-muted transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden>▾</span>
                    </summary>
                    <div className="space-y-8 border-t border-night-line/60 p-4 sm:p-5">
                        <section>
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
                        </section>

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

                    </div>
                </details>
            </div>
        </div>
    );
}
