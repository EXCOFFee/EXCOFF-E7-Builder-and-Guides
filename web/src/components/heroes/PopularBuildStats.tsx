'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from '@/hooks/useTranslations';
import { SET_IMAGES } from '@/lib/sets';

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

interface HeroBuildStats {
    total_builds: number;
    primary_sets: SetStats[];
    secondary_sets: SetStats[];
    artifacts: ArtifactStats[];
    average_ratings: AverageRatings | null;
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
        return null; // Don't show anything if no builds
    }

    return (
        <div className="space-y-6">
            {/* Popular Sets Section */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-e7-dark-light/80 to-e7-dark/60 border border-e7-gold/30 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-e7-text-gold to-e7-gold mb-4 flex items-center gap-2">
                    📊 {t('heroes.popularSets', 'Popular Set Combinations')}
                    <span className="text-sm font-normal text-gray-400">
                        ({t('heroes.fromBuilds', 'from {count} builds').replace('{count}', stats.total_builds.toString())})
                    </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Primary Sets */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                            {t('builds.primarySet', 'Primary Set')}
                        </h4>
                        <div className="space-y-2">
                            {stats.primary_sets.slice(0, 5).map((setData) => (
                                <div key={setData.set} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-e7-dark/60 flex items-center justify-center border border-e7-gold/20">
                                        {SET_IMAGES[setData.set.toLowerCase()] ? (
                                            <img
                                                src={SET_IMAGES[setData.set.toLowerCase()]}
                                                alt={setData.set}
                                                className="w-6 h-6"
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400">{setData.set.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-200">{setData.set}</span>
                                            <span className="text-sm font-semibold text-e7-gold">{setData.percentage}%</span>
                                        </div>
                                        <div className="h-1.5 bg-e7-dark/60 rounded-full overflow-hidden mt-1">
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
                        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                            {t('builds.secondarySet', 'Secondary Set')}
                        </h4>
                        <div className="space-y-2">
                            {stats.secondary_sets.slice(0, 5).map((setData) => (
                                <div key={setData.set} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-e7-dark/60 flex items-center justify-center border border-e7-gold/20">
                                        {SET_IMAGES[setData.set.toLowerCase()] ? (
                                            <img
                                                src={SET_IMAGES[setData.set.toLowerCase()]}
                                                alt={setData.set}
                                                className="w-6 h-6"
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400">{setData.set.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-200">{setData.set}</span>
                                            <span className="text-sm font-semibold text-cyan-400">{setData.percentage}%</span>
                                        </div>
                                        <div className="h-1.5 bg-e7-dark/60 rounded-full overflow-hidden mt-1">
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

            {/* Tier Ratings Section */}
            {stats.average_ratings && (
                <div className="p-6 rounded-xl bg-gradient-to-br from-e7-dark-light/80 to-e7-dark/60 border border-e7-gold/30 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-e7-text-gold to-e7-gold mb-4">
                        🏆 {t('builds.tierRatings', 'Tier Ratings')}
                    </h3>

                    <div className="flex flex-wrap gap-4 justify-center">
                        {/* General Rating */}
                        {stats.average_ratings.general && (
                            <div className="text-center px-6 py-3 rounded-xl bg-gradient-to-br from-yellow-900/30 to-amber-900/20 border-2 border-yellow-500/50">
                                <div className={`text-3xl font-bold ${getTierColor(stats.average_ratings.general)}`}>
                                    {tierToLetter(stats.average_ratings.general)}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">{t('builds.general', 'General')}</div>
                            </div>
                        )}

                        {/* Individual Ratings */}
                        {stats.average_ratings.pve !== undefined && (
                            <div className="text-center px-4 py-2 rounded-lg bg-e7-dark/40 border border-gray-600/30">
                                <div className={`text-xl font-bold ${getTierColor(stats.average_ratings.pve)}`}>
                                    {tierToLetter(stats.average_ratings.pve)}
                                </div>
                                <div className="text-xs text-gray-400">{t('builds.tier_pve', 'PVE')}</div>
                            </div>
                        )}
                        {stats.average_ratings.arena !== undefined && (
                            <div className="text-center px-4 py-2 rounded-lg bg-e7-dark/40 border border-gray-600/30">
                                <div className={`text-xl font-bold ${getTierColor(stats.average_ratings.arena)}`}>
                                    {tierToLetter(stats.average_ratings.arena)}
                                </div>
                                <div className="text-xs text-gray-400">{t('builds.tier_arena', 'Arena')}</div>
                            </div>
                        )}
                        {stats.average_ratings.gw !== undefined && (
                            <div className="text-center px-4 py-2 rounded-lg bg-e7-dark/40 border border-gray-600/30">
                                <div className={`text-xl font-bold ${getTierColor(stats.average_ratings.gw)}`}>
                                    {tierToLetter(stats.average_ratings.gw)}
                                </div>
                                <div className="text-xs text-gray-400">{t('builds.tier_gw', 'Guild War')}</div>
                            </div>
                        )}
                        {stats.average_ratings.rta !== undefined && (
                            <div className="text-center px-4 py-2 rounded-lg bg-e7-dark/40 border border-gray-600/30">
                                <div className={`text-xl font-bold ${getTierColor(stats.average_ratings.rta)}`}>
                                    {tierToLetter(stats.average_ratings.rta)}
                                </div>
                                <div className="text-xs text-gray-400">{t('builds.tier_rta', 'RTA')}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Popular Artifacts */}
            {stats.artifacts.length > 0 && (
                <div className="p-6 rounded-xl bg-gradient-to-br from-e7-dark-light/80 to-e7-dark/60 border border-e7-gold/30 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-e7-text-gold to-e7-gold mb-4">
                        ⚔️ {t('heroes.popularArtifacts', 'Popular Artifacts')}
                    </h3>

                    <div className="flex flex-wrap gap-4 justify-center">
                        {stats.artifacts.map((artifact) => (
                            <div
                                key={artifact.artifact_id}
                                className="flex items-center gap-3 px-4 py-2 rounded-lg bg-e7-dark/40 border border-purple-500/30 hover:border-purple-400/50 transition-colors"
                            >
                                {artifact.icon && (
                                    <img
                                        src={`https://raw.githubusercontent.com/fribbels/Fribbels-Epic-7-Optimizer/main/data/item/${artifact.icon}`}
                                        alt={artifact.name}
                                        className="w-10 h-10 rounded"
                                    />
                                )}
                                <div>
                                    <div className="text-sm text-gray-200">{artifact.name}</div>
                                    <div className="text-xs text-purple-400 font-semibold">{artifact.percentage}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
