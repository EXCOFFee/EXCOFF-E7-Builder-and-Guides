'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from '@/hooks/useTranslations';
import { SET_IMAGES } from '@/lib/sets';
import Image from 'next/image';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface SetStats {
    set: string;
    count: number;
    percentage: number;
}

interface ArtifactStats {
    artifact_id: number;
    name: string;
    icon: string | null;
    count: number;
    percentage: number;
}

interface AverageRatings {
    pve?: number;
    arena?: number;
    gw?: number;
    rta?: number;
    general?: number;
}

interface SynergyHeroStats {
    hero_id: number;
    name: string;
    slug: string;
    image_url: string | null;
    element: string;
    count: number;
    percentage: number;
}

interface PriorityStatStats {
    stat: string;
    label: string;
    count: number;
    average_value: number;
    formatted_value: string;
}

interface HeroBuildStats {
    total_builds: number;
    primary_sets: SetStats[];
    secondary_sets: SetStats[];
    artifacts: ArtifactStats[];
    average_ratings: AverageRatings | null;
    synergy_heroes: SynergyHeroStats[];
    counter_heroes: SynergyHeroStats[];
    priority_stats: PriorityStatStats[];
}

interface PopularBuildStatsProps {
    heroSlug: string;
}

/**
 * Converts tier number (1-5) to letter grade (D-S)
 */
function tierToLetter(tier: number): string {
    const tiers = ['D', 'C', 'B', 'A', 'S'];
    return tiers[Math.round(tier) - 1] || '-';
}

/**
 * Get tier color based on value
 */
function getTierColor(tier: number): string {
    if (tier >= 4.5) return 'text-yellow-400 border-yellow-500';
    if (tier >= 3.5) return 'text-purple-400 border-purple-500';
    if (tier >= 2.5) return 'text-blue-400 border-blue-500';
    if (tier >= 1.5) return 'text-green-400 border-green-500';
    return 'text-gray-400 border-gray-500';
}

/**
 * PopularBuildStats - Displays set frequencies, artifact popularity, and tier ratings
 * Used on hero detail pages to show aggregated build data.
 */
export function PopularBuildStats({ heroSlug }: PopularBuildStatsProps) {
    const { t } = useTranslations();

    const { data: stats, isLoading, error } = useQuery<HeroBuildStats>({
        queryKey: ['hero-stats', heroSlug],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/heroes/${heroSlug}/stats`);
            if (!res.ok) throw new Error('Failed to fetch stats');
            const data = await res.json();
            return data.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minute cache
    });

    if (isLoading) {
        return (
            <div className="p-6 rounded-xl bg-e7-dark-light/50 border border-e7-gold/20 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-20 bg-gray-700 rounded"></div>
            </div>
        );
    }

    if (error || !stats || stats.total_builds === 0) {
        return (
            <div className="p-6 rounded-xl bg-gradient-to-br from-e7-dark-light/50 to-e7-dark/30 border border-e7-gold/20">
                <div className="text-center py-4">
                    <h3 className="text-lg font-display font-semibold text-gray-300 mb-2">
                        {t('heroes.noBuildsYet', 'No builds for this hero yet')}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {t('heroes.beFirst', 'Be the first to share your build!')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Popular Sets Section */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-e7-dark-light/80 to-e7-dark/60 border border-e7-gold/30 backdrop-blur-sm">
                <h3 className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-e7-text-gold to-e7-gold mb-4 flex items-center gap-2">
                    {t('heroes.popularSets', 'Popular Set Combinations')}
                    <span className="text-sm font-normal text-gray-400">
                        ({t('heroes.fromBuilds', 'from {count} builds').replace('{count}', stats.total_builds.toString())})
                    </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Primary Sets */}
                    <div>
                        <h4 className="text-sm font-display font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                            {t('builds.primarySet', 'Primary Set')}
                        </h4>
                        <div className="space-y-3">
                            {stats.primary_sets.slice(0, 5).map((setData) => (
                                <div key={setData.set} className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-e7-dark/60 flex items-center justify-center border border-e7-gold/20">
                                        {SET_IMAGES[setData.set.toLowerCase()] ? (
                                            <img
                                                src={SET_IMAGES[setData.set.toLowerCase()]}
                                                alt={setData.set}
                                                className="w-8 h-8"
                                            />
                                        ) : (
                                            <span className="text-sm text-gray-400">{setData.set.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-base text-gray-200">{setData.set}</span>
                                            <span className="text-base font-semibold text-e7-gold">{setData.percentage}%</span>
                                        </div>
                                        <div className="h-2 bg-e7-dark/60 rounded-full overflow-hidden mt-1">
                                            <div
                                                className="h-full bg-gradient-to-r from-e7-gold to-yellow-400 rounded-full transition-all"
                                                style={{ width: `${setData.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Secondary Sets */}
                    <div>
                        <h4 className="text-sm font-display font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                            {t('builds.secondarySet', 'Secondary Set')}
                        </h4>
                        <div className="space-y-3">
                            {stats.secondary_sets.slice(0, 5).map((setData) => (
                                <div key={setData.set} className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-e7-dark/60 flex items-center justify-center border border-e7-gold/20">
                                        {SET_IMAGES[setData.set.toLowerCase()] ? (
                                            <img
                                                src={SET_IMAGES[setData.set.toLowerCase()]}
                                                alt={setData.set}
                                                className="w-8 h-8"
                                            />
                                        ) : (
                                            <span className="text-sm text-gray-400">{setData.set.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-base text-gray-200">{setData.set}</span>
                                            <span className="text-base font-semibold text-cyan-400">{setData.percentage}%</span>
                                        </div>
                                        <div className="h-2 bg-e7-dark/60 rounded-full overflow-hidden mt-1">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all"
                                                style={{ width: `${setData.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Priority Stats Section */}
            {stats.priority_stats && stats.priority_stats.length > 0 && (
                <div className="p-6 rounded-xl bg-gradient-to-br from-e7-dark-light/80 to-e7-dark/60 border border-cyan-500/30 backdrop-blur-sm">
                    <h3 className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-400 mb-5">
                        {t('heroes.priorityStats', 'Priority Stats')}
                    </h3>

                    <div className="flex flex-wrap gap-5 justify-center">
                        {stats.priority_stats.map((stat, index) => (
                            <div
                                key={stat.stat}
                                className={`flex flex-col items-center px-8 py-5 rounded-xl bg-gradient-to-br from-cyan-900/30 to-sky-800/20 border ${index === 0 ? 'border-2 border-cyan-400/60' : 'border-cyan-500/40'} hover:border-cyan-400/60 hover:scale-105 transition-all shadow-lg hover:shadow-cyan-500/20 min-w-[140px]`}
                            >
                                <div className={`text-3xl font-display font-bold ${index === 0 ? 'text-cyan-300' : 'text-cyan-400'}`}>
                                    {stat.formatted_value}
                                </div>
                                <div className="text-base font-display text-gray-200 mt-2">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tier Ratings Section */}
            {stats.average_ratings && (
                <div className="p-6 rounded-xl bg-gradient-to-br from-e7-dark-light/80 to-e7-dark/60 border border-e7-gold/30 backdrop-blur-sm">
                    <h3 className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-e7-text-gold to-e7-gold mb-5">
                        {t('builds.tierRatings', 'Tier Ratings')}
                    </h3>

                    <div className="flex flex-wrap gap-6 justify-center">
                        {/* General Rating */}
                        {stats.average_ratings.general && (
                            <div className="text-center px-10 py-6 rounded-xl bg-gradient-to-br from-yellow-900/40 to-amber-900/30 border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/10">
                                <div className={`text-5xl font-display font-bold ${getTierColor(stats.average_ratings.general)}`}>
                                    {tierToLetter(stats.average_ratings.general)}
                                </div>
                                <div className="text-base font-display text-gray-300 mt-3">{t('builds.general', 'General')}</div>
                            </div>
                        )}

                        {/* Individual Ratings */}
                        {stats.average_ratings.pve !== undefined && (
                            <div className="text-center px-8 py-5 rounded-xl bg-gradient-to-br from-e7-dark/60 to-e7-panel/40 border border-gray-600/40 hover:border-gray-500/50 transition-colors">
                                <div className={`text-4xl font-display font-bold ${getTierColor(stats.average_ratings.pve)}`}>
                                    {tierToLetter(stats.average_ratings.pve)}
                                </div>
                                <div className="text-base font-display text-gray-400 mt-2">{t('builds.tier_pve', 'PVE')}</div>
                            </div>
                        )}
                        {stats.average_ratings.arena !== undefined && (
                            <div className="text-center px-8 py-5 rounded-xl bg-gradient-to-br from-e7-dark/60 to-e7-panel/40 border border-gray-600/40 hover:border-gray-500/50 transition-colors">
                                <div className={`text-4xl font-display font-bold ${getTierColor(stats.average_ratings.arena)}`}>
                                    {tierToLetter(stats.average_ratings.arena)}
                                </div>
                                <div className="text-base font-display text-gray-400 mt-2">{t('builds.tier_arena', 'Arena')}</div>
                            </div>
                        )}
                        {stats.average_ratings.gw !== undefined && (
                            <div className="text-center px-8 py-5 rounded-xl bg-gradient-to-br from-e7-dark/60 to-e7-panel/40 border border-gray-600/40 hover:border-gray-500/50 transition-colors">
                                <div className={`text-4xl font-display font-bold ${getTierColor(stats.average_ratings.gw)}`}>
                                    {tierToLetter(stats.average_ratings.gw)}
                                </div>
                                <div className="text-base font-display text-gray-400 mt-2">{t('builds.tier_gw', 'Guild War')}</div>
                            </div>
                        )}
                        {stats.average_ratings.rta !== undefined && (
                            <div className="text-center px-8 py-5 rounded-xl bg-gradient-to-br from-e7-dark/60 to-e7-panel/40 border border-gray-600/40 hover:border-gray-500/50 transition-colors">
                                <div className={`text-4xl font-display font-bold ${getTierColor(stats.average_ratings.rta)}`}>
                                    {tierToLetter(stats.average_ratings.rta)}
                                </div>
                                <div className="text-base font-display text-gray-400 mt-2">{t('builds.tier_rta', 'RTA')}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Popular Artifacts */}
            {stats.artifacts.length > 0 && (
                <div className="p-6 rounded-xl bg-gradient-to-br from-e7-dark-light/80 to-e7-dark/60 border border-e7-gold/30 backdrop-blur-sm">
                    <h3 className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-e7-text-gold to-e7-gold mb-5">
                        {t('heroes.popularArtifacts', 'Popular Artifacts')}
                    </h3>

                    <div className="flex flex-wrap gap-6 justify-center">
                        {stats.artifacts.map((artifact) => (
                            <div
                                key={artifact.artifact_id}
                                className="flex items-center gap-5 px-8 py-5 rounded-xl bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/40 hover:border-purple-400/60 hover:scale-105 transition-all shadow-lg hover:shadow-purple-500/20 min-w-[280px]"
                            >
                                <div className="relative w-20 h-20 rounded-lg ring-2 ring-purple-500/40 overflow-hidden bg-purple-900/50 flex-shrink-0">
                                    {artifact.icon ? (
                                        <img
                                            src={artifact.icon}
                                            alt={artifact.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const parent = target.parentElement;
                                                if (parent) {
                                                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-purple-400 text-3xl">?</div>';
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-purple-400 text-3xl">?</div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-xl font-display text-gray-200">{artifact.name}</div>
                                    <div className="text-lg text-purple-400 font-semibold">{artifact.percentage}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Popular Synergy Heroes */}
            {stats.synergy_heroes && stats.synergy_heroes.length > 0 && (
                <div className="p-8 rounded-xl bg-gradient-to-br from-e7-dark-light/80 to-e7-dark/60 border border-green-500/30 backdrop-blur-sm">
                    <h3 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400 mb-6">
                        {t('heroes.popularSynergies', 'Popular Synergy Heroes')}
                    </h3>

                    <div className="flex flex-wrap gap-5 justify-center">
                        {stats.synergy_heroes.map((hero) => (
                            <Link
                                key={hero.hero_id}
                                href={`/heroes/${hero.slug}`}
                                className="flex items-center gap-4 px-6 py-4 rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-800/20 border border-green-500/40 hover:border-green-400/60 hover:scale-105 transition-all shadow-lg hover:shadow-green-500/20"
                            >
                                <Image
                                    src={hero.image_url || `/images/hero/${hero.slug}_s.png`}
                                    alt={hero.name}
                                    width={80}
                                    height={80}
                                    className="rounded-xl ring-2 ring-green-500/40"
                                    unoptimized
                                />
                                <div>
                                    <div className="text-lg font-display text-gray-200">{hero.name}</div>
                                    <div className="text-base text-green-400 font-semibold">{hero.percentage}%</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Popular Counter Heroes */}
            {stats.counter_heroes && stats.counter_heroes.length > 0 && (
                <div className="p-8 rounded-xl bg-gradient-to-br from-e7-dark-light/80 to-e7-dark/60 border border-red-500/30 backdrop-blur-sm">
                    <h3 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-rose-400 mb-6">
                        {t('heroes.popularCounters', 'Popular Counter Heroes')}
                    </h3>

                    <div className="flex flex-wrap gap-5 justify-center">
                        {stats.counter_heroes.map((hero) => (
                            <Link
                                key={hero.hero_id}
                                href={`/heroes/${hero.slug}`}
                                className="flex items-center gap-4 px-6 py-4 rounded-xl bg-gradient-to-br from-red-900/30 to-rose-800/20 border border-red-500/40 hover:border-red-400/60 hover:scale-105 transition-all shadow-lg hover:shadow-red-500/20"
                            >
                                <Image
                                    src={hero.image_url || `/images/hero/${hero.slug}_s.png`}
                                    alt={hero.name}
                                    width={80}
                                    height={80}
                                    className="rounded-xl ring-2 ring-red-500/40"
                                    unoptimized
                                />
                                <div>
                                    <div className="text-lg font-display text-gray-200">{hero.name}</div>
                                    <div className="text-base text-red-400 font-semibold">{hero.percentage}%</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
