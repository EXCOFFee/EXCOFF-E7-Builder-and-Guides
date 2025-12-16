'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { heroApi, buildApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    fire: 'bg-gradient-to-r from-red-600 to-orange-500',
    ice: 'bg-gradient-to-r from-blue-500 to-cyan-400',
    earth: 'bg-gradient-to-r from-green-600 to-emerald-400',
    light: 'bg-gradient-to-r from-yellow-300 to-amber-200 text-black',
    dark: 'bg-gradient-to-r from-purple-700 to-violet-500',
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
};

// Set code to local image URL mapping
const SET_IMAGE_URLS: Record<string, string> = {
    set_speed: '/images/sets/SET_Speed.png',
    set_att: '/images/sets/SET_Attack.png',
    set_cri: '/images/sets/SET_Critical.png',
    set_cri_dmg: '/images/sets/SET_Destruction.png',
    set_def: '/images/sets/SET_Defense.png',
    set_max_hp: '/images/sets/SET_Health.png',
    set_acc: '/images/sets/SET_Hit.png',
    set_res: '/images/sets/SET_Resist.png',
    set_lifesteal: '/images/sets/SET_Lifesteal.png',
    set_counter: '/images/sets/SET_Counter.png',
    set_immunity: '/images/sets/SET_Immunity.png',
    set_rage: '/images/sets/SET_Destruction.png', // No Rage image, using Destruction
    set_unity: '/images/sets/SET_Unity.png',
    set_penetrate: '/images/sets/SET_Penetration.png',
    set_revenge: '/images/sets/SET_Revenge.png',
    set_injury: '/images/sets/SET_Injury.png',
    set_torrent: '/images/sets/SET_Torrent.png',
    set_protection: '/images/sets/SET_Barrier.png',
};

// Lowercase set names mapping (for user builds)
const SET_IMAGES_LOWERCASE: Record<string, string> = {
    speed: '/images/sets/SET_Speed.png',
    attack: '/images/sets/SET_Attack.png',
    health: '/images/sets/SET_Health.png',
    defense: '/images/sets/SET_Defense.png',
    critical: '/images/sets/SET_Critical.png',
    destruction: '/images/sets/SET_Destruction.png',
    counter: '/images/sets/SET_Counter.png',
    lifesteal: '/images/sets/SET_Lifesteal.png',
    immunity: '/images/sets/SET_Immunity.png',
    rage: '/images/sets/SET_Revenge.png',
    revenge: '/images/sets/SET_Revenge.png',
    injury: '/images/sets/SET_Injury.png',
    penetration: '/images/sets/SET_Penetration.png',
    protection: '/images/sets/SET_Barrier.png',
    unity: '/images/sets/SET_Unity.png',
    hit: '/images/sets/SET_Hit.png',
    resist: '/images/sets/SET_Resist.png',
    torrent: '/images/sets/SET_Torrent.png',
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
    <div className={`text-center p-2 bg-e7-void/50 rounded-lg border border-e7-gold/10 ${large ? 'py-3' : ''}`}>
        <p className="text-gray-500 text-xs mb-1">{label}</p>
        <p className={`${color} font-bold ${large ? 'text-lg' : 'text-sm'}`}>
            {value?.toLocaleString() || '0'}{suffix}
        </p>
    </div>
);
export default function HeroDetailPage() {
    const params = useParams();
    const slug = params.slug as string;

    const { data, isLoading, error } = useQuery({
        queryKey: ['hero', slug],
        queryFn: async () => {
            const response = await heroApi.get(slug);
            return response.data;
        },
        enabled: !!slug,
    });

    const hero: Hero | null = data?.data || data;

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
                    <Link href="/heroes" className="text-e7-gold hover:text-e7-text-gold text-sm">
                        ← Back to Heroes
                    </Link>
                </div>

                {/* Hero Header */}
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                    {/* Portrait */}
                    <div className="w-full md:w-72 flex-shrink-0">
                        <div className="aspect-square bg-gradient-to-br from-e7-panel to-e7-void rounded-xl border-2 border-e7-gold/40 flex items-center justify-center overflow-hidden shadow-2xl shadow-e7-gold/10">
                            {hero.image_url ? (
                                <Image
                                    src={hero.image_url}
                                    alt={hero.name}
                                    width={288}
                                    height={288}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                />
                            ) : (
                                <span className="text-8xl">{CLASS_ICONS[hero.class] || '⚔️'}</span>
                            )}
                        </div>
                        <div className="mt-3 text-center text-e7-text-gold text-2xl tracking-wider">
                            {'★'.repeat(hero.rarity)}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <h1 className="font-display text-4xl md:text-5xl text-e7-text-gold mb-4">{hero.name}</h1>
                            <div className="flex flex-wrap gap-3">
                                <Badge className={`${ELEMENT_COLORS[hero.element]} px-3 py-1.5 text-sm font-semibold flex items-center gap-2`}>
                                    {ELEMENT_IMAGES[hero.element] && (
                                        <Image src={ELEMENT_IMAGES[hero.element]} alt={hero.element} width={20} height={20} className="w-5 h-5" />
                                    )}
                                    {hero.element}
                                </Badge>
                                <Badge variant="outline" className="border-e7-gold/40 text-gray-200 px-3 py-1.5 flex items-center gap-2">
                                    {CLASS_IMAGES[hero.class] && (
                                        <Image src={CLASS_IMAGES[hero.class]} alt={hero.class} width={20} height={20} className="w-5 h-5" />
                                    )}
                                    {hero.class.replace('_', ' ')}
                                </Badge>
                                {hasUsageStats && (
                                    <Badge className="bg-e7-gold/20 text-e7-gold border border-e7-gold/40 px-4 py-1.5">
                                        📊 {hero.guides_count.toLocaleString()} builds
                                    </Badge>
                                )}
                            </div>

                            {/* Create Build Button */}
                            <div className="flex flex-wrap gap-3 mt-4">
                                <Link href={`/builds/create?hero_id=${hero.id}&hero_name=${encodeURIComponent(hero.name)}`}>
                                    <button className="px-4 py-2 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500 hover:bg-purple-600 hover:text-white transition-all flex items-center gap-2">
                                        ⚙️ Crear Build
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Base Stats */}
                        <Card className="bg-gradient-to-br from-e7-panel to-e7-void border-e7-gold/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-e7-gold text-lg flex items-center gap-2">
                                    <span>📈</span> Base Stats (Lv.60 Fully Awakened)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
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

                {/* Usage Statistics */}
                {hasUsageStats && (
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Popular Sets */}
                        <Card className="bg-gradient-to-br from-e7-panel to-e7-void border-e7-gold/30">
                            <CardHeader>
                                <CardTitle className="text-e7-gold flex items-center gap-2">
                                    <span>🎮</span> Popular Set Combinations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {hero.popular_sets?.slice(0, 5).map((setCombo, index) => (
                                    <div key={index} className="flex items-center justify-between bg-e7-void/50 rounded-lg p-3 border border-e7-gold/10">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-e7-gold font-bold text-sm">#{index + 1}</span>
                                            {setCombo.set_codes?.map((setCode, i) => (
                                                <div key={i} className="flex items-center gap-1 bg-e7-panel rounded px-2 py-1">
                                                    {SET_IMAGE_URLS[setCode] && (
                                                        <Image
                                                            src={SET_IMAGE_URLS[setCode]}
                                                            alt={setCombo.sets[i] || setCode}
                                                            width={20}
                                                            height={20}
                                                            className="rounded"
                                                            unoptimized
                                                        />
                                                    )}
                                                    <span className="text-gray-200 text-xs">{setCombo.sets[i] || setCode}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-right">
                                            <span className="text-e7-gold font-bold">{setCombo.percentage}%</span>
                                            <span className="text-gray-500 text-xs block">{setCombo.count} uses</span>
                                        </div>
                                    </div>
                                ))}
                                {(!hero.popular_sets || hero.popular_sets.length === 0) && (
                                    <p className="text-gray-500 text-center py-4">No set data available</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Popular Artifacts */}
                        <Card className="bg-gradient-to-br from-e7-panel to-e7-void border-e7-gold/30">
                            <CardHeader>
                                <CardTitle className="text-e7-gold flex items-center gap-2">
                                    <span>💎</span> Popular Artifacts
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {hero.popular_artifacts?.slice(0, 5).map((artifact, index) => (
                                    <div key={index} className="flex items-center justify-between bg-e7-void/50 rounded-lg p-3 border border-e7-gold/10">
                                        <div className="flex items-center gap-3">
                                            <span className="text-e7-gold font-bold text-sm">#{index + 1}</span>
                                            <Image
                                                src={getArtifactImageUrl(artifact.code)}
                                                alt={artifact.code}
                                                width={40}
                                                height={40}
                                                className="rounded-md border border-e7-gold/20"
                                                unoptimized
                                            />
                                            <span className="text-gray-200 capitalize">{artifact.code.replace(/_/g, ' ')}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-e7-gold font-bold">{artifact.percentage}%</span>
                                            <span className="text-gray-500 text-xs block">{artifact.count} uses</span>
                                        </div>
                                    </div>
                                ))}
                                {(!hero.popular_artifacts || hero.popular_artifacts.length === 0) && (
                                    <p className="text-gray-500 text-center py-4">No artifact data available</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Average Stats Recommendation */}
                {hasUsageStats && hero.avg_stats && (
                    <Card className="bg-gradient-to-br from-e7-panel to-e7-void border-e7-gold/30 mb-8">
                        <CardHeader>
                            <CardTitle className="text-e7-gold flex items-center gap-2">
                                <span>🎯</span> Average Build Stats
                                <span className="text-gray-500 text-sm font-normal ml-2">
                                    (from {hero.guides_count.toLocaleString()} builds)
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
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
                                <span>💫</span> Memory Imprint
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-gray-400">Type:</span>
                                    <Badge className={`${IMPRINT_TYPES[hero.self_devotion.type]?.color || 'text-white'} bg-e7-void border border-e7-gold/30`}>
                                        {IMPRINT_TYPES[hero.self_devotion.type]?.name || hero.self_devotion.type}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {IMPRINT_GRADES.map((grade) => {
                                        const value = hero.self_devotion?.grades?.[grade];
                                        const isPercentage = hero.self_devotion?.type?.includes('rate') ||
                                            ['cri', 'cri_damage', 'acc', 'res'].includes(hero.self_devotion?.type || '');

                                        return (
                                            <div key={grade} className="text-center p-3 bg-e7-void/50 rounded-lg border border-e7-gold/10">
                                                <p className="text-e7-gold font-bold text-lg mb-1">{grade}</p>
                                                <p className={`${IMPRINT_TYPES[hero.self_devotion?.type || '']?.color || 'text-gray-300'} font-semibold`}>
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
                    <Card className="bg-gradient-to-br from-e7-panel to-e7-void border-e7-gold/30">
                        <CardHeader>
                            <CardTitle className="text-e7-gold flex items-center gap-2">
                                <span>⚡</span> Skills & Damage Scaling
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Object.entries(hero.skills).map(([skillKey, skill]: [string, unknown]) => {
                                const s = skill as {
                                    name?: string;
                                    description?: string;
                                    rate?: number;
                                    pow?: number;
                                    targets?: number;
                                    selfHpScaling?: number;
                                    selfAtkScaling?: number;
                                    selfDefScaling?: number;
                                    selfSpdScaling?: number;
                                    penetration?: number;
                                    hitTypes?: string[];
                                };

                                const hasScaling = s.rate || s.pow || s.selfHpScaling || s.selfAtkScaling || s.selfDefScaling || s.selfSpdScaling || s.penetration;

                                return (
                                    <div key={skillKey} className="bg-e7-void/50 rounded-lg p-4 border border-e7-gold/10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Badge className="bg-e7-gold text-black font-bold px-3">{skillKey}</Badge>
                                            <h3 className="text-white font-semibold">{s.name || `Skill ${skillKey}`}</h3>
                                            {s.targets && (
                                                <Badge variant="outline" className="border-gray-500 text-gray-400">
                                                    {s.targets === 1 ? 'Single Target' : `${s.targets} Targets`}
                                                </Badge>
                                            )}
                                        </div>

                                        {hasScaling && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {s.rate !== undefined && s.rate > 0 && (
                                                    <div className="bg-red-900/30 rounded px-2 py-1 text-xs text-red-300">
                                                        ATK Rate: <span className="font-bold">{(s.rate * 100).toFixed(0)}%</span>
                                                    </div>
                                                )}
                                                {s.pow !== undefined && s.pow > 0 && (
                                                    <div className="bg-purple-900/30 rounded px-2 py-1 text-xs text-purple-300">
                                                        POW: <span className="font-bold">{s.pow}</span>
                                                    </div>
                                                )}
                                                {s.selfHpScaling !== undefined && s.selfHpScaling > 0 && (
                                                    <div className="bg-green-900/30 rounded px-2 py-1 text-xs text-green-300">
                                                        HP Scaling: <span className="font-bold">+{(s.selfHpScaling * 100).toFixed(0)}%</span>
                                                    </div>
                                                )}
                                                {s.selfAtkScaling !== undefined && s.selfAtkScaling > 0 && (
                                                    <div className="bg-orange-900/30 rounded px-2 py-1 text-xs text-orange-300">
                                                        ATK Scaling: <span className="font-bold">+{(s.selfAtkScaling * 100).toFixed(0)}%</span>
                                                    </div>
                                                )}
                                                {s.selfDefScaling !== undefined && s.selfDefScaling > 0 && (
                                                    <div className="bg-blue-900/30 rounded px-2 py-1 text-xs text-blue-300">
                                                        DEF Scaling: <span className="font-bold">+{(s.selfDefScaling * 100).toFixed(0)}%</span>
                                                    </div>
                                                )}
                                                {s.selfSpdScaling !== undefined && s.selfSpdScaling > 0 && (
                                                    <div className="bg-yellow-900/30 rounded px-2 py-1 text-xs text-yellow-300">
                                                        SPD Scaling: <span className="font-bold">+{(s.selfSpdScaling * 1000).toFixed(2)}%/SPD</span>
                                                    </div>
                                                )}
                                                {s.penetration !== undefined && s.penetration > 0 && (
                                                    <div className="bg-pink-900/30 rounded px-2 py-1 text-xs text-pink-300">
                                                        Penetration: <span className="font-bold">{(s.penetration * 100).toFixed(0)}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {s.description && (
                                            <p className="text-gray-400 text-sm">{s.description}</p>
                                        )}

                                        {!hasScaling && !s.description && (
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
                    <p className="text-center text-gray-600 text-xs mt-8">
                        Stats last updated: {new Date(hero.stats_updated_at).toLocaleDateString()}
                    </p>
                )}

                {/* Community Builds Section */}
                <Card className="bg-gradient-to-br from-e7-panel to-e7-void border-e7-gold/30 mb-8">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-e7-gold flex items-center gap-2">
                                <span>⚙️</span> Builds de la Comunidad
                            </CardTitle>
                            <Link href={`/builds/create?hero_id=${hero.id}&hero_name=${encodeURIComponent(hero.name)}`}>
                                <button className="px-3 py-1 text-sm rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500 hover:bg-purple-600 hover:text-white transition-all">
                                    + Crear Build
                                </button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {builds.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <p className="text-lg mb-2">💭 Aún no hay builds para este héroe</p>
                                <p className="text-sm">¡Sé el primero en compartir tu build!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {builds.slice(0, 5).map((build: any) => (
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
                                                    <div className="text-gray-500 text-xs">{build.user?.name || 'Anónimo'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {builds.length > 5 && (
                                    <Link href={`/heroes/${slug}/builds`} className="block text-center text-e7-gold hover:text-e7-text-gold text-sm">
                                        Ver todas las {builds.length} builds →
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

