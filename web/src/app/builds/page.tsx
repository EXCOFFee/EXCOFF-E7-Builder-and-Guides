'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/hooks/useTranslations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const ELEMENTS = ['fire', 'ice', 'earth', 'light', 'dark'];
const CLASSES = ['knight', 'warrior', 'thief', 'ranger', 'mage', 'soul_weaver'];

const ELEMENT_COLORS: Record<string, string> = {
    fire: 'bg-red-500',
    ice: 'bg-blue-500',
    earth: 'bg-green-500',
    light: 'bg-yellow-400',
    dark: 'bg-purple-600',
};

interface Build {
    id: number;
    title: string;
    description: string;
    min_stats: Record<string, number>;
    primary_set: string;
    secondary_set: string;
    likes: number;
    views: number;
    is_anonymous: boolean;
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
        class: string;
    };
    artifact: {
        id: number;
        name: string;
        icon: string;
    } | null;
    created_at: string;
}

export default function BuildsPage() {
    const { t } = useTranslations();
    const [search, setSearch] = useState('');
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['builds', search, selectedElement, selectedClass],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (selectedElement) params.append('element', selectedElement);
            if (selectedClass) params.append('class', selectedClass);

            const response = await fetch(`${API_URL}/builds?${params}`);
            if (!response.ok) throw new Error('Failed to fetch builds');
            return response.json();
        },
    });

    const builds: Build[] = data?.data || [];

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-e7-gold">
                            {t('builds.title', 'Community Builds')}
                        </h1>
                        <p className="text-gray-400 mt-1">
                            {t('builds.description', 'Explore and share hero builds created by the community')}
                        </p>
                    </div>
                    <Link href="/builds/create">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                            + {t('builds.createBuild', 'Create Build')}
                        </Button>
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <Input
                        placeholder={t('builds.searchPlaceholder', 'Search builds...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-xs bg-e7-void border-e7-gold/30 text-white"
                    />

                    {/* Element Filter */}
                    <div className="flex gap-2">
                        <Button
                            variant={selectedElement === null ? 'default' : 'outline'}
                            onClick={() => setSelectedElement(null)}
                            className={selectedElement === null ? 'bg-e7-gold text-black' : 'border-e7-gold/30'}
                            size="sm"
                        >
                            {t('common.all', 'All')}
                        </Button>
                        {ELEMENTS.map((el) => (
                            <Button
                                key={el}
                                variant={selectedElement === el ? 'default' : 'outline'}
                                onClick={() => setSelectedElement(el)}
                                className={`capitalize ${selectedElement === el ? ELEMENT_COLORS[el] + ' text-white' : 'border-e7-gold/30'}`}
                                size="sm"
                            >
                                {t(`elements.${el}`, el)}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Class Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {CLASSES.map((cls) => (
                        <Button
                            key={cls}
                            variant={selectedClass === cls ? 'default' : 'outline'}
                            onClick={() => setSelectedClass(selectedClass === cls ? null : cls)}
                            className={selectedClass === cls ? 'bg-e7-gold text-black' : 'border-e7-gold/30'}
                            size="sm"
                        >
                            {t(`classes.${cls}`, cls.replace('_', ' '))}
                        </Button>
                    ))}
                </div>

                {/* Builds Grid */}
                {isLoading ? (
                    <div className="text-center py-12 text-gray-400">
                        {t('common.loading', 'Loading...')}
                    </div>
                ) : builds.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        {t('builds.noBuilds', 'No builds available yet.')}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {builds.map((build) => (
                            <Link key={build.id} href={`/builds/${build.id}`}>
                                <div className="bg-e7-panel border border-e7-gold/20 rounded-lg overflow-hidden hover:border-e7-gold/50 transition-colors">
                                    {/* Hero Header */}
                                    <div className="flex items-center gap-3 p-4 border-b border-e7-gold/20">
                                        <div className="relative">
                                            <Image
                                                src={build.hero.portrait}
                                                alt={build.hero.name}
                                                width={60}
                                                height={60}
                                                className="rounded-lg"
                                                unoptimized
                                            />
                                            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${ELEMENT_COLORS[build.hero.element]}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold">{build.hero.name}</h3>
                                            <p className="text-xs text-gray-400 capitalize">{build.hero.class.replace('_', ' ')}</p>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h4 className="text-lg font-medium text-e7-gold mb-2 line-clamp-1">
                                            {build.title}
                                        </h4>

                                        {/* Sets */}
                                        <div className="flex gap-2 mb-3">
                                            {build.primary_set && (
                                                <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded">
                                                    {build.primary_set}
                                                </span>
                                            )}
                                            {build.secondary_set && (
                                                <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">
                                                    {build.secondary_set}
                                                </span>
                                            )}
                                        </div>

                                        {/* Artifact */}
                                        {build.artifact && (
                                            <div className="flex items-center gap-2 mb-3">
                                                <Image
                                                    src={build.artifact.icon}
                                                    alt={build.artifact.name}
                                                    width={24}
                                                    height={24}
                                                    className="rounded"
                                                    unoptimized
                                                />
                                                <span className="text-sm text-gray-400">{build.artifact.name}</span>
                                            </div>
                                        )}

                                        {/* Stats Preview */}
                                        {build.min_stats && Object.keys(build.min_stats).length > 0 && (
                                            <div className="grid grid-cols-3 gap-1 text-xs text-gray-400 mb-3">
                                                {Object.entries(build.min_stats).slice(0, 6).map(([stat, value]) => (
                                                    <span key={stat}>{stat}: {value}</span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-3 border-t border-e7-gold/20">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                {!build.is_anonymous && build.user?.avatar && (
                                                    <Image
                                                        src={build.user.avatar}
                                                        alt={build.user.name}
                                                        width={20}
                                                        height={20}
                                                        className="rounded-full"
                                                        unoptimized
                                                    />
                                                )}
                                                <span>{build.is_anonymous ? 'Anonymous' : build.user?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><Image src="/images/ras-like.gif" alt="likes" width={16} height={16} unoptimized /> {build.likes}</span>
                                                <span>👁️ {build.views}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
