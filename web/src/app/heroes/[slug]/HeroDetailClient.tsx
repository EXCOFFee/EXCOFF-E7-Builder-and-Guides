'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { heroApi, buildApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/hooks/useTranslations';
import { useHeroTranslations } from '@/hooks/useNameTranslations';
import { PopularBuildStats } from '@/components/heroes/PopularBuildStats';
import { appendImageVersion } from '@/lib/heroImages';
import { formatSkillText, getSkillMechanics } from '@/utils/skillFormatter';
import { getBuffIcon } from '@/utils/buffIconMapper';



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

interface Hero {
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

const ELEMENT_COLORS: Record<string, string> = {
    fire: 'bg-gradient-to-r from-red-700 to-red-500 text-white',
    ice: 'bg-gradient-to-r from-blue-700 to-blue-500 text-white',
    earth: 'bg-gradient-to-r from-green-700 to-green-500 text-white',
    light: 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white',
    dark: 'bg-gradient-to-r from-purple-800 to-violet-600 text-white',
};

const ELEMENT_ICONS: Record<string, string> = {
    fire: '🔥',
    ice: '❄️',
    earth: '🌿',
    light: '☀️',
    dark: '🌙',
};

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

const SET_ICONS: Record<string, string> = {
    Speed: '⚡',
    Attack: '⚔️',
    Critical: '🎯',
    Destruction: '💥',
    Defense: '🛡️',
    Health: '❤️',
    Hit: '🎪',
    Resist: '🔰',
    Lifesteal: '🧛',
    Counter: '↩️',
    Immunity: '✨',
    Rage: '😤',
    Unity: '🤝',
    Penetration: '🔱',
    Revenge: '⚡',
    Injury: '💀',
    Torrent: '🌊',
    Protection: '🛡️',
    Warfare: '⚔️',
    Pursuit: '🏃',
};

// Set code to local image URL mapping (for Fribbels data)
import { SET_CODE_IMAGES as SET_IMAGE_URLS, SET_IMAGES as SET_IMAGES_LOWERCASE } from '@/lib/sets';



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

// Get artifact image URL from Fribbels/SmileGate
const getArtifactImageUrl = (artifactCode: string): string => {
    return `https://raw.githubusercontent.com/fribbels/Fribbels-Epic-7-Optimizer/main/data/cachedimages/${artifactCode}.png`;
};

// StatItem component for displaying stats
const StatItem = ({ label, value, suffix = '', color = 'text-gray-300', large = false }: {
    label: string;
    value: number | undefined;
    suffix?: string;
    color?: string;
    large?: boolean;
}) => (
    <div className={`text-center p-3 bg-e7-void/50 rounded-lg border border-e7-gold/10 ${large ? 'py-4' : ''}`}>
        <p className="text-gray-500 text-sm mb-1">{label}</p>
        <p className={`${color} font-bold ${large ? 'text-xl' : 'text-lg'}`}>
            {value?.toLocaleString() || '0'}{suffix}
        </p>
    </div>
);
export function HeroDetailClient() {
    const params = useParams();
    const slug = params.slug as string;
    const { t, locale } = useTranslations();
    const { translateHeroName } = useHeroTranslations();

    const { data, isLoading, error } = useQuery({
        queryKey: ['hero', slug, locale],
        queryFn: async () => {
            const response = await heroApi.get(slug, locale);
            return response.data;
        },
        enabled: !!slug,
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

    const builds = buildsData?.data || [];

    // Builds filter states
    const [buildSearch, setBuildSearch] = useState('');
    const [buildSetFilter, setBuildSetFilter] = useState('');
    const [buildSortBy, setBuildSortBy] = useState<'newest' | 'views_desc' | 'views_asc' | 'likes_desc' | 'likes_asc'>('newest');

    // Get unique sets from builds
    const availableSets = useMemo(() => {
        const sets = new Set<string>();
        builds.forEach((build: any) => {
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
            result = result.filter((build: any) =>
                build.title?.toLowerCase().includes(search) ||
                build.description?.toLowerCase().includes(search) ||
                build.user?.name?.toLowerCase().includes(search)
            );
        }

        // Set filter
        if (buildSetFilter) {
            result = result.filter((build: any) =>
                build.primary_set === buildSetFilter || build.secondary_set === buildSetFilter
            );
        }

        // Sort
        switch (buildSortBy) {
            case 'views_desc':
                result.sort((a: any, b: any) => (b.views || 0) - (a.views || 0));
                break;
            case 'views_asc':
                result.sort((a: any, b: any) => (a.views || 0) - (b.views || 0));
                break;
            case 'likes_desc':
                result.sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0));
                break;
            case 'likes_asc':
                result.sort((a: any, b: any) => (a.likes || 0) - (b.likes || 0));
                break;
            case 'newest':
            default:
                result.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
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
                    <p className="text-gray-400 mt-2">Cargando datos del héroe...</p>
                </div>
            </div>
        );
    }

    if (error || !hero) {
        return (
            <div className="min-h-screen bg-e7-void flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-xl mb-4">Hero not found</p>
                    <Link href="/heroes" className="text-e7-gold hover:underline">
                        ← Back to heroes
                    </Link>
                </div>
            </div>
        );
    }

    const hasUsageStats = hero.guides_count > 0;

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link href="/heroes" className="text-e7-gold hover:text-e7-text-gold text-sm transition-colors inline-flex items-center gap-2">
                        <span>←</span> {t('heroes.backToHeroes', 'Back to Heroes')}
                    </Link>
                </div>

                {/* Hero Header */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-8">
                    {/* Portrait */}
                    <div className="w-full max-w-xs mx-auto lg:mx-0 lg:w-80 flex-shrink-0">
                        <div className="relative">
                            <div className="aspect-square bg-e7-panel rounded-lg overflow-hidden border border-e7-gold/30">
                                {hero.image_url ? (
                                    <Image
                                        src={appendImageVersion(hero.image_url)}
                                        alt={hero.name}
                                        width={320}
                                        height={320}
                                        className="w-full h-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-e7-void">
                                        <span className="text-8xl opacity-50">{CLASS_ICONS[hero.class] || '⚔️'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Rarity Stars */}
                        <div className="mt-4 text-center">
                            <span className="text-xl tracking-widest text-e7-gold">
                                {'★'.repeat(hero.rarity)}
                            </span>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-gold-gradient mb-4 tracking-wide text-center lg:text-left">{translatedHeroName}</h1>
                            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start">
                                <Badge className={`${ELEMENT_COLORS[hero.element]} px-4 py-2 text-sm font-semibold flex items-center gap-2 shadow-lg`}>
                                    {ELEMENT_IMAGES[hero.element] && (
                                        <Image src={ELEMENT_IMAGES[hero.element]} alt={hero.element} width={20} height={20} className="w-5 h-5" />
                                    )}
                                    <span className="capitalize">{hero.element}</span>
                                </Badge>
                                <Badge variant="outline" className="glass-panel border-e7-gold/30 text-slate-200 px-4 py-2 flex items-center gap-2">
                                    {CLASS_IMAGES[hero.class] && (
                                        <Image src={CLASS_IMAGES[hero.class]} alt={hero.class} width={20} height={20} className="w-5 h-5" />
                                    )}
                                    <span className="capitalize">{hero.class.replace('_', ' ')}</span>
                                </Badge>
                                {hasUsageStats && (
                                    <Badge className="glass-panel text-e7-gold border border-e7-gold/30 px-4 py-2">
                                        {hero.guides_count.toLocaleString()} builds
                                    </Badge>
                                )}
                            </div>

                            {/* Create Build Button */}
                            <div className="flex flex-wrap gap-3 mt-6 justify-center lg:justify-start">
                                <Link href={`/builds/create?hero_id=${hero.id}&hero_name=${encodeURIComponent(hero.name)}`}>
                                    <button className="btn-gold px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-e7-gold/20 hover:shadow-e7-gold/40 transition-all">
                                        {t('heroes.createBuild', 'Create Build')}
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Base Stats */}
                        <Card className="glass-panel border-e7-gold/20 rounded-xl overflow-hidden">
                            <CardHeader className="pb-2 border-b border-e7-gold/10">
                                <CardTitle className="text-e7-gold text-lg flex items-center gap-2">
                                    <span>{t('heroes.baseStats', 'Base Stats (Lv.60 Fully Awakened)')}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
                                    <StatItem label="ATK" value={hero.base_stats?.atk || 0} color="text-red-400" />
                                    <StatItem label="DEF" value={hero.base_stats?.def || 0} color="text-blue-400" />
                                    <StatItem label="HP" value={hero.base_stats?.hp || 0} color="text-green-400" />
                                    <StatItem label="SPD" value={hero.base_stats?.spd || 0} color="text-yellow-400" />
                                    <StatItem label="Crit" value={hero.base_stats?.crit_chance || 15} suffix="%" color="text-orange-400" />
                                    <StatItem label="C.Dmg" value={hero.base_stats?.crit_dmg || 150} suffix="%" color="text-purple-400" />
                                    <StatItem label="EFF" value={hero.base_stats?.eff || 0} suffix="%" color="text-cyan-400" />
                                    <StatItem label="RES" value={hero.base_stats?.res || 0} suffix="%" color="text-pink-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Popular Build Stats from API */}
                <div className="mb-8">
                    <PopularBuildStats heroSlug={slug} />
                </div>

                {/* Average Stats Recommendation */}
                {hasUsageStats && hero.avg_stats && (
                    <Card className="glass-panel border-e7-gold/20 rounded-xl overflow-hidden mb-8">
                        <CardHeader className="border-b border-e7-gold/10">
                            <CardTitle className="text-e7-gold flex items-center gap-2">
                                <span>{t('heroes.averageStats', 'Average Build Stats')}</span>
                                <span className="text-slate-500 text-sm font-normal ml-2">
                                    (from {hero.guides_count.toLocaleString()} builds)
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4">
                                <StatItem label="ATK" value={hero.avg_stats.atk} color="text-red-400" large />
                                <StatItem label="DEF" value={hero.avg_stats.def} color="text-blue-400" large />
                                <StatItem label="HP" value={hero.avg_stats.hp} color="text-green-400" large />
                                <StatItem label="SPD" value={hero.avg_stats.spd} color="text-yellow-400" large />
                                <StatItem label="Crit" value={hero.avg_stats.crit_chance} suffix="%" color="text-orange-400" large />
                                <StatItem label="C.Dmg" value={hero.avg_stats.crit_dmg} suffix="%" color="text-purple-400" large />
                                <StatItem label="EFF" value={hero.avg_stats.eff} suffix="%" color="text-cyan-400" large />
                                <StatItem label="RES" value={hero.avg_stats.res} suffix="%" color="text-pink-400" large />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Memory Imprint Section */}
                {hero.self_devotion && (
                    <Card className="bg-gradient-to-br from-e7-panel to-e7-void border-e7-gold/30 mb-8">
                        <CardHeader>
                            <CardTitle className="text-e7-gold flex items-center gap-2">
                                <span>{t('heroes.memoryImprint', 'Memory Imprint')}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-gray-400 text-lg">{t('heroes.type', 'Type')}:</span>
                                    <Badge className={`${IMPRINT_TYPES[hero.self_devotion.type]?.color || 'text-white'} bg-e7-void border border-e7-gold/30 text-base px-4 py-2`}>
                                        {IMPRINT_TYPES[hero.self_devotion.type]?.name || hero.self_devotion.type}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                                    {IMPRINT_GRADES.map((grade) => {
                                        const value = hero.self_devotion?.grades?.[grade];
                                        const isPercentage = hero.self_devotion?.type?.includes('rate') ||
                                            ['cri', 'cri_damage', 'acc', 'res'].includes(hero.self_devotion?.type || '');

                                        return (
                                            <div key={grade} className="text-center p-4 bg-e7-void/50 rounded-lg border border-e7-gold/10">
                                                <div className="flex justify-center items-center h-12 mb-3">
                                                    <Image
                                                        src={`${(process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '')}/images/imprints/hero_dedi_a_${grade.toLowerCase()}.png`}
                                                        alt={grade}
                                                        width={40}
                                                        height={40}
                                                        className="object-contain"
                                                        unoptimized
                                                    />
                                                </div>
                                                <p className={`${IMPRINT_TYPES[hero.self_devotion?.type || '']?.color || 'text-gray-300'} font-bold text-lg`}>
                                                    {value !== undefined
                                                        ? isPercentage
                                                            ? `${(value * 100).toFixed(1)}%`
                                                            : `+${Math.round(value)}`
                                                        : '-'
                                                    }
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Skills Section */}
                {hero.skills && Object.keys(hero.skills).length > 0 && (
                    <Card className="glass-panel border-e7-gold/20 rounded-xl overflow-hidden">
                        <CardHeader className="border-b border-e7-gold/10">
                            <CardTitle className="text-e7-gold flex items-center gap-2">
                                <span>{t('heroes.skills', 'Skills & Damage Scaling')}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {Object.entries(hero.skills).map(([skillKey, skill]: [string, unknown]) => {
                                const s = skill as {
                                    name?: string;
                                    name_es?: string;
                                    name_ko?: string;
                                    name_ja?: string;
                                    name_zh?: string;
                                    name_pt?: string;
                                    description?: string;
                                    description_es?: string;
                                    description_ko?: string;
                                    description_ja?: string;
                                    description_zh?: string;
                                    description_pt?: string;
                                    rate?: number;
                                    pow?: number;
                                    targets?: number;
                                    cooldown?: number;
                                    soulburn?: boolean;
                                    soulburn_effect?: string;
                                    soulburn_effect_es?: string;
                                    soulburn_effect_ko?: string;
                                    soulburn_effect_ja?: string;
                                    soulburn_effect_zh?: string;
                                    soulburn_effect_pt?: string;
                                    soulburn_souls?: number;
                                    selfHpScaling?: number;
                                    selfAtkScaling?: number;
                                    selfDefScaling?: number;
                                    selfSpdScaling?: number;
                                    penetration?: number;
                                    hitTypes?: string[];
                                };

                                // Get localized text based on current locale
                                const skillName = (locale !== 'en' && s[`name_${locale}` as keyof typeof s])
                                    ? String(s[`name_${locale}` as keyof typeof s])
                                    : s.name;
                                const skillDesc = (locale !== 'en' && s[`description_${locale}` as keyof typeof s])
                                    ? String(s[`description_${locale}` as keyof typeof s])
                                    : s.description;
                                const skillSoulburn = (locale !== 'en' && s[`soulburn_effect_${locale}` as keyof typeof s])
                                    ? String(s[`soulburn_effect_${locale}` as keyof typeof s])
                                    : s.soulburn_effect;

                                const hasScaling = s.rate || s.pow || s.selfHpScaling || s.selfAtkScaling || s.selfDefScaling || s.selfSpdScaling || s.penetration;

                                return (
                                    <div key={skillKey} className="bg-e7-void/50 rounded-lg p-4 border border-e7-gold/10">
                                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                                            {/* Skill Icon from datamine */}
                                            {hero.hero_code && (
                                                <Image
                                                    src={`${(process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '')}/images/skills/sk_${hero.hero_code}_${skillKey.replace('S', '')}.png`}
                                                    alt={`${skillKey} icon`}
                                                    width={56}
                                                    height={56}
                                                    className="rounded-lg"
                                                    unoptimized
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            )}
                                            <Badge className="bg-e7-gold text-black font-bold px-3">{skillKey}</Badge>
                                            <h3 className="text-white font-semibold">{skillName || `Skill ${skillKey}`}</h3>
                                            {s.targets && (
                                                <Badge variant="outline" className="border-gray-500 text-gray-400">
                                                    {s.targets === 1 ? 'Single Target' : `${s.targets} Targets`}
                                                </Badge>
                                            )}
                                            {s.cooldown && (
                                                <Badge className="bg-blue-600 text-white">
                                                    {s.cooldown} Turns
                                                </Badge>
                                            )}
                                            {s.soulburn && (
                                                <Badge className="bg-purple-600 text-white">
                                                    {s.soulburn_souls || 10} Souls
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Soulburn Effect */}
                                        {s.soulburn && skillSoulburn && (
                                            <div className="bg-purple-900/30 rounded px-3 py-2 mb-3 text-sm">
                                                <span className="text-purple-300 font-semibold">Soulburn:</span>{' '}
                                                <span className="text-purple-200">{formatSkillText(skillSoulburn)}</span>
                                            </div>
                                        )}

                                        {hasScaling && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {s.rate !== undefined && s.rate > 0 && (
                                                    <div className="bg-red-900/30 rounded px-2 py-1 text-xs text-red-300">
                                                        ATK Rate: <span className="font-bold">{(s.rate * 100).toFixed(0)}%</span>
                                                    </div>
                                                )}
                                                {/* ... other scaling items ... */}
                                                {s.penetration !== undefined && s.penetration > 0 && (
                                                    <div className="bg-pink-900/30 rounded px-2 py-1 text-xs text-pink-300">
                                                        Penetration: <span className="font-bold">{(s.penetration * 100).toFixed(0)}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Header Icons Summary */}
                                        {(skillDesc || skillSoulburn) && (
                                            <div className="flex flex-wrap gap-1.5 mb-2 pb-2 border-b border-white/5">
                                                {(() => {
                                                    // Import functions locally if needed or assume imported at top
                                                    // Note: We need to import getSkillMechanics and getBuffIcon at top of file
                                                    // For now assuming existing imports or I will add them in next step
                                                    // Combining desc + soulburn for summary
                                                    const fullText = (skillDesc || '') + ' ' + (skillSoulburn || '');
                                                    // Function from utils
                                                    const mechanics = getSkillMechanics(fullText);

                                                    if (mechanics.length === 0) return null;

                                                    return mechanics.map(mech => {
                                                        const icon = getBuffIcon(mech);
                                                        if (!icon) return null;
                                                        return (
                                                            <div key={mech} className="relative group cursor-help">
                                                                <Image
                                                                    src={icon}
                                                                    alt={mech}
                                                                    width={24}
                                                                    height={24}
                                                                    className="w-6 h-6"
                                                                    unoptimized
                                                                />
                                                                {/* Simple Native Tooltip for now */}
                                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-black/80 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                                    {mech}
                                                                </span>
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        )}

                                        {skillDesc && (
                                            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                                {formatSkillText(skillDesc)}
                                            </div>
                                        )}

                                        {!hasScaling && !skillDesc && (
                                            <p className="text-gray-500 text-sm italic">Passive or support skill</p>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                {/* Last Updated */}
                {hero.stats_updated_at && (
                    <p className="text-center text-slate-600 text-xs mt-8">
                        Stats last updated: {new Date(hero.stats_updated_at).toLocaleDateString()}
                    </p>
                )}

                {/* Community Builds Section */}
                <Card className="glass-panel border-e7-gold/20 rounded-xl overflow-hidden mb-8 mt-8">
                    <CardHeader className="border-b border-e7-gold/10">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                            <CardTitle className="text-e7-gold flex items-center gap-2">
                                <span>{t('heroes.communityBuilds', 'Community Builds')}</span>
                                {builds.length > 0 && (
                                    <span className="text-sm text-neutral-500 font-normal">({builds.length})</span>
                                )}
                            </CardTitle>
                            <Link href={`/builds/create?hero_id=${hero.id}&hero_name=${encodeURIComponent(hero.name)}`}>
                                <button className="btn-gold px-4 py-1.5 text-sm rounded-lg shadow-lg shadow-e7-gold/10 hover:shadow-e7-gold/30 transition-all">
                                    + {t('heroes.createBuild', 'Create Build')}
                                </button>
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
                                        className="w-full px-3 py-2 pl-9 text-sm rounded-lg bg-e7-void border border-e7-gold/20 text-white placeholder-neutral-500 focus:border-e7-gold focus:outline-none"
                                    />
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                {/* Set Filter */}
                                {availableSets.length > 0 && (
                                    <select
                                        value={buildSetFilter}
                                        onChange={(e) => setBuildSetFilter(e.target.value)}
                                        className="px-3 py-2 text-sm rounded-lg bg-e7-void border border-e7-gold/20 text-slate-200 focus:border-e7-gold focus:outline-none cursor-pointer min-w-[140px]"
                                    >
                                        <option value="">{t('heroes.allSets', 'All Sets')}</option>
                                        {availableSets.map(set => (
                                            <option key={set} value={set}>{set}</option>
                                        ))}
                                    </select>
                                )}

                                {/* Sort */}
                                <select
                                    value={buildSortBy}
                                    onChange={(e) => setBuildSortBy(e.target.value as typeof buildSortBy)}
                                    className="px-3 py-2 text-sm rounded-lg bg-e7-void border border-e7-gold/20 text-slate-200 focus:border-e7-gold focus:outline-none cursor-pointer min-w-[160px]"
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
                                {filteredBuilds.slice(0, 5).map((build: any) => (
                                    <Link key={build.id} href={`/builds/${build.id}`}>
                                        <div className="bg-e7-void/50 rounded-lg p-4 border border-e7-gold/10 hover:border-e7-gold/40 transition-all cursor-pointer">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-white font-medium">{build.title}</h4>
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
                                                    <div className="text-gray-500 text-xs">{build.user?.name || t('common.anonymous', 'Anonymous')}</div>
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

