'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/useTranslations';
import { SET_IMAGES, formatSetName } from '@/lib/sets';
import { StarRating } from '@/components/ui/star-rating';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Build {
    id: number;
    title: string;
    description: string;
    min_stats: Record<string, number>;
    primary_set: string;
    secondary_set: string;
    likes: number;
    views: number;
    avg_rating?: number;
    rating_count?: number;
    user: {
        id: number;
        name: string;
        avatar: string | null;
    } | null;
    hero: {
        id: number;
        name: string;
        slug: string;
        portrait: string;
        element: string;
    };
    artifact: {
        id: number;
        name: string;
        icon: string;
        code?: string;
    } | null;
    created_at: string;
}

const STAT_LABELS: Record<string, string> = {
    atk: 'Attack',
    hp: 'HP',
    def: 'Defense',
    spd: 'Speed',
    crit: 'Crit Rate',
    cdmg: 'Crit Damage',
    eff: 'Effectiveness',
    res: 'Effect Resist',
};

export default function ComparePage() {
    const { t } = useTranslations();
    const searchParams = useSearchParams();

    const build1Id = searchParams.get('build1');
    const build2Id = searchParams.get('build2');

    const [selectedBuild1, setSelectedBuild1] = useState<string>(build1Id || '');
    const [selectedBuild2, setSelectedBuild2] = useState<string>(build2Id || '');
    const [heroFilter, setHeroFilter] = useState<string>('');

    // Fetch all builds for selection
    const { data: buildsData } = useQuery({
        queryKey: ['builds-list'],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/builds?per_page=100`);
            if (!response.ok) throw new Error('Failed to fetch builds');
            return response.json();
        },
    });

    const allBuilds: Build[] = buildsData?.data || [];

    // Filter builds by hero name
    const filteredBuilds = heroFilter
        ? allBuilds.filter(b => b.hero.name.toLowerCase().includes(heroFilter.toLowerCase()))
        : allBuilds;

    // Fetch build 1
    const { data: build1 } = useQuery<Build>({
        queryKey: ['build', selectedBuild1],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/builds/${selectedBuild1}`);
            if (!response.ok) throw new Error('Build not found');
            return response.json();
        },
        enabled: !!selectedBuild1,
    });

    // Fetch build 2
    const { data: build2 } = useQuery<Build>({
        queryKey: ['build', selectedBuild2],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/builds/${selectedBuild2}`);
            if (!response.ok) throw new Error('Build not found');
            return response.json();
        },
        enabled: !!selectedBuild2,
    });

    // Compare stats
    const compareStats = (stat: string) => {
        if (!build1?.min_stats || !build2?.min_stats) return { diff: 0, winner: null };
        const val1 = build1.min_stats[stat] || 0;
        const val2 = build2.min_stats[stat] || 0;
        return {
            val1,
            val2,
            diff: val1 - val2,
            winner: val1 > val2 ? 1 : val2 > val1 ? 2 : null,
        };
    };

    const allStats = [...new Set([
        ...Object.keys(build1?.min_stats || {}),
        ...Object.keys(build2?.min_stats || {}),
    ])];

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/builds" className="text-e7-gold hover:text-e7-text-gold text-sm mb-2 inline-flex items-center gap-2 group transition-colors">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> {t('builds.backToBuilds', 'Back to Builds')}
                    </Link>
                    <h1 className="font-display text-4xl text-gold-gradient tracking-wide mb-2">
                        {t('builds.comparator', 'Build Comparator')}
                    </h1>
                    <p className="text-slate-400">
                        {t('builds.comparatorDesc', 'Compare two builds side by side to see the differences')}
                    </p>
                </div>

                {/* Build Selectors */}
                <div className="glass-panel border-e7-gold/20 rounded-xl p-6 mb-8">
                    <div className="mb-4">
                        <label className="block text-sm text-gray-400 mb-2">{t('builds.filterByHero', 'Filter by Hero')}</label>
                        <input
                            type="text"
                            value={heroFilter}
                            onChange={(e) => setHeroFilter(e.target.value)}
                            placeholder={t('builds.searchHero', 'Search hero...')}
                            className="w-full max-w-xs px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Build 1 Selector */}
                        <div>
                            <label className="block text-sm text-e7-gold mb-2">{t('builds.selectBuild1', 'Select Build 1')}</label>
                            <select
                                value={selectedBuild1}
                                onChange={(e) => setSelectedBuild1(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none"
                            >
                                <option value="">{t('builds.chooseBuild', 'Choose a build...')}</option>
                                {filteredBuilds.map((build) => (
                                    <option key={build.id} value={build.id}>
                                        {build.hero.name} - {build.title} (by {build.user?.name || 'Anonymous'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Build 2 Selector */}
                        <div>
                            <label className="block text-sm text-e7-gold mb-2">{t('builds.selectBuild2', 'Select Build 2')}</label>
                            <select
                                value={selectedBuild2}
                                onChange={(e) => setSelectedBuild2(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none"
                            >
                                <option value="">{t('builds.chooseBuild', 'Choose a build...')}</option>
                                {filteredBuilds.map((build) => (
                                    <option key={build.id} value={build.id}>
                                        {build.hero.name} - {build.title} (by {build.user?.name || 'Anonymous'})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Comparison View */}
                {build1 && build2 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Build 1 Card */}
                        <div className="glass-panel border-e7-gold/20 rounded-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/30 p-4 border-b border-e7-gold/20">
                                <div className="flex items-center gap-4">
                                    <Image
                                        src={build1.hero.portrait}
                                        alt={build1.hero.name}
                                        width={64}
                                        height={64}
                                        className="rounded-lg"
                                        unoptimized
                                    />
                                    <div>
                                        <h2 className="text-white font-bold text-lg">{build1.hero.name}</h2>
                                        <p className="text-blue-300 text-sm">{build1.title}</p>
                                        <p className="text-gray-400 text-xs">by {build1.user?.name || 'Anonymous'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                {/* Sets */}
                                <div className="flex items-center gap-2 mb-4">
                                    {build1.primary_set && SET_IMAGES[build1.primary_set] && (
                                        <Image src={SET_IMAGES[build1.primary_set]} alt={build1.primary_set} width={32} height={32} />
                                    )}
                                    {build1.secondary_set && SET_IMAGES[build1.secondary_set] && (
                                        <Image src={SET_IMAGES[build1.secondary_set]} alt={build1.secondary_set} width={32} height={32} />
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="space-y-2">
                                    {allStats.map((stat) => {
                                        const comparison = compareStats(stat);
                                        return (
                                            <div key={stat} className={`flex justify-between items-center p-2 rounded ${comparison.winner === 1 ? 'bg-green-900/30 border border-green-500/30' : 'bg-e7-void/50'}`}>
                                                <span className="text-gray-400 text-sm">{STAT_LABELS[stat] || stat}</span>
                                                <span className={`font-bold ${comparison.winner === 1 ? 'text-green-400' : 'text-white'}`}>
                                                    {comparison.val1}
                                                    {comparison.winner === 1 && <span className="text-green-400 ml-1">笆ｲ</span>}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Rating & Stats */}
                                <div className="mt-4 pt-4 border-t border-e7-gold/20 flex justify-between text-sm">
                                    <span className="text-gray-400">�早 {build1.views} 窶｢ 笶､・・{build1.likes}</span>
                                    <StarRating rating={build1.avg_rating || 0} totalRatings={build1.rating_count || 0} size="sm" />
                                </div>

                                <Link href={`/builds/${build1.id}`}>
                                    <Button className="w-full mt-4 btn-gold">{t('builds.viewBuild', 'View Build')}</Button>
                                </Link>
                            </div>
                        </div>

                        {/* Build 2 Card */}
                        <div className="glass-panel border-e7-gold/20 rounded-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/30 p-4 border-b border-e7-gold/20">
                                <div className="flex items-center gap-4">
                                    <Image
                                        src={build2.hero.portrait}
                                        alt={build2.hero.name}
                                        width={64}
                                        height={64}
                                        className="rounded-lg"
                                        unoptimized
                                    />
                                    <div>
                                        <h2 className="text-white font-bold text-lg">{build2.hero.name}</h2>
                                        <p className="text-purple-300 text-sm">{build2.title}</p>
                                        <p className="text-gray-400 text-xs">by {build2.user?.name || 'Anonymous'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                {/* Sets */}
                                <div className="flex items-center gap-2 mb-4">
                                    {build2.primary_set && SET_IMAGES[build2.primary_set] && (
                                        <Image src={SET_IMAGES[build2.primary_set]} alt={build2.primary_set} width={32} height={32} />
                                    )}
                                    {build2.secondary_set && SET_IMAGES[build2.secondary_set] && (
                                        <Image src={SET_IMAGES[build2.secondary_set]} alt={build2.secondary_set} width={32} height={32} />
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="space-y-2">
                                    {allStats.map((stat) => {
                                        const comparison = compareStats(stat);
                                        return (
                                            <div key={stat} className={`flex justify-between items-center p-2 rounded ${comparison.winner === 2 ? 'bg-green-900/30 border border-green-500/30' : 'bg-e7-void/50'}`}>
                                                <span className="text-gray-400 text-sm">{STAT_LABELS[stat] || stat}</span>
                                                <span className={`font-bold ${comparison.winner === 2 ? 'text-green-400' : 'text-white'}`}>
                                                    {comparison.val2}
                                                    {comparison.winner === 2 && <span className="text-green-400 ml-1">笆ｲ</span>}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Rating & Stats */}
                                <div className="mt-4 pt-4 border-t border-e7-gold/20 flex justify-between text-sm">
                                    <span className="text-gray-400">�早 {build2.views} 窶｢ 笶､・・{build2.likes}</span>
                                    <StarRating rating={build2.avg_rating || 0} totalRatings={build2.rating_count || 0} size="sm" />
                                </div>

                                <Link href={`/builds/${build2.id}`}>
                                    <Button className="w-full mt-4 btn-gold">{t('builds.viewBuild', 'View Build')}</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glass-panel border-e7-gold/20 rounded-xl p-12 text-center">
                        <p className="text-slate-400 text-lg">
                            {t('builds.selectBothBuilds', 'Select two builds above to compare them side by side')}
                        </p>
                    </div>
                )}

                {/* Summary Comparison */}
                {build1 && build2 && (
                    <div className="glass-panel border-e7-gold/20 rounded-xl p-6 mt-8">
                        <h3 className="text-xl font-bold text-e7-gold mb-4">{t('builds.statsSummary', 'Stats Summary')}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-e7-gold/20">
                                        <th className="text-left py-2 text-gray-400">Stat</th>
                                        <th className="text-center py-2 text-blue-400">{build1.hero.name}</th>
                                        <th className="text-center py-2 text-gray-400">Diff</th>
                                        <th className="text-center py-2 text-purple-400">{build2.hero.name}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allStats.map((stat) => {
                                        const comparison = compareStats(stat);
                                        return (
                                            <tr key={stat} className="border-b border-e7-gold/10">
                                                <td className="py-2 text-gray-300">{STAT_LABELS[stat] || stat}</td>
                                                <td className={`text-center font-bold ${comparison.winner === 1 ? 'text-green-400' : 'text-white'}`}>
                                                    {comparison.val1}
                                                </td>
                                                <td className={`text-center ${comparison.diff > 0 ? 'text-green-400' : comparison.diff < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                                    {comparison.diff > 0 ? '+' : ''}{comparison.diff}
                                                </td>
                                                <td className={`text-center font-bold ${comparison.winner === 2 ? 'text-green-400' : 'text-white'}`}>
                                                    {comparison.val2}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
