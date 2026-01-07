'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkillUpgradeInput } from '@/components/builds/SkillUpgradeInput';
import { TierRatingSelector, TIER_CATEGORIES, TierCategory } from '@/components/ui/tier-rating-selector';
import { ProConsSelector, TagWithNote } from '@/components/ui/pro-cons-selector';
import { HeroSelectorWithNotes, HeroWithNote } from '@/components/builds/HeroSelectorWithNotes';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useTranslations } from '@/hooks/useTranslations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

import { SETS, SET_IMAGES } from '@/lib/sets';

interface Build {
    id: number;
    title: string;
    description: string;
    min_stats: Record<string, number>;
    primary_set: string;
    secondary_set: string;
    synergy_heroes?: number[];
    counter_heroes?: number[];
    images: string[];
    hero: {
        id: number;
        name: string;
        slug?: string;
        skills?: {
            name: string;
            icon: string;
            description: string;
        }[];
    };
    artifact?: {
        id: number;
        name: string;
        icon: string;
    };
    skill_1?: number;
    skill_2?: number;
    skill_3?: number;
    rating_pve?: number;
    rating_arena?: number;
    rating_gw?: number;
    rating_rta?: number;
    reason_pve?: string;
    reason_arena?: string;
    reason_gw?: string;
    reason_rta?: string;
    pro_tags?: TagWithNote[] | string[];
    con_tags?: TagWithNote[] | string[];
}

interface Hero {
    id: number;
    name: string;
    slug: string;
    image_url?: string;
    skills?: {
        name: string;
        icon: string;
        description: string;
    }[];
}

interface Artifact {
    id: number;
    name: string;
    code: string;
    icon: string;
}

export default function EditBuildPage() {
    const router = useRouter();
    const params = useParams();
    const buildId = params.id as string;
    const { t } = useTranslations();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [primarySet, setPrimarySet] = useState('');
    const [secondarySet, setSecondarySet] = useState('');
    const [minStats, setMinStats] = useState<Record<string, number>>({
        atk: 0, def: 0, hp: 0, spd: 0, chc: 0, chd: 0, eff: 0, efr: 0
    });
    const [skillLevels, setSkillLevels] = useState<[number, number, number]>([0, 0, 0]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);

    // Artifact state
    const [artifactId, setArtifactId] = useState<number | null>(null);
    const [artifactSearch, setArtifactSearch] = useState('');
    const [showArtifactDropdown, setShowArtifactDropdown] = useState(false);

    // Synergy and Counter heroes
    const [synergyHeroes, setSynergyHeroes] = useState<HeroWithNote[]>([]);
    const [counterHeroes, setCounterHeroes] = useState<HeroWithNote[]>([]);

    // Anonymous option
    const [isAnonymous, setIsAnonymous] = useState(false);

    // Tier Ratings (D-S system)
    const [tierRatings, setTierRatings] = useState<Partial<Record<TierCategory, number | null>>>({});
    const [tierReasons, setTierReasons] = useState<Partial<Record<TierCategory, string>>>({});

    // Pros/Cons Tags
    const [proTags, setProTags] = useState<TagWithNote[]>([]);
    const [conTags, setConTags] = useState<TagWithNote[]>([]);

    const artifactDropdownRef = useRef<HTMLDivElement>(null);


    // Click outside to close artifact dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (artifactDropdownRef.current && !artifactDropdownRef.current.contains(event.target as Node)) {
                setShowArtifactDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            localStorage.setItem('return_url', window.location.pathname);
            router.push('/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    // Fetch existing build data
    const { data: buildData, isLoading } = useQuery({
        queryKey: ['build', buildId],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/builds/${buildId}`);
            if (!response.ok) throw new Error('Build not found');
            return response.json();
        },
        enabled: isAuthenticated && !!buildId,
    });

    // Fetch artifacts for selector
    const { data: artifactsData } = useQuery({
        queryKey: ['artifacts-list'],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/artifacts`);
            return response.json();
        },
        enabled: isAuthenticated,
    });

    // Fetch heroes for synergy/counter selectors
    const { data: heroesData } = useQuery({
        queryKey: ['heroes-list'],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/heroes`);
            return response.json();
        },
        enabled: isAuthenticated,
    });

    const heroes: Hero[] = heroesData?.data || [];

    const artifacts: Artifact[] = artifactsData?.data || [];
    const filteredArtifacts = artifacts.filter(a =>
        a.name.toLowerCase().includes(artifactSearch.toLowerCase())
    );
    const selectedArtifact = artifacts.find(a => a.id === artifactId);

    // Pre-fill form when build loads
    useEffect(() => {
        if (buildData) {
            const build = buildData as Build;
            setTitle(build.title || '');
            setDescription(build.description || '');
            setPrimarySet(build.primary_set || '');
            setSecondarySet(build.secondary_set || '');
            if (build.min_stats) {
                setMinStats(build.min_stats);
            }
            if (build.images && build.images.length > 0) {
                setExistingImages(build.images);
            }
            if (build.artifact) {
                setArtifactId(build.artifact.id);
            }
            // Pre-fill synergy/counter heroes (handle both old number[] and new HeroWithNote[] format)
            if (build.synergy_heroes && build.synergy_heroes.length > 0) {
                if (typeof build.synergy_heroes[0] === 'number') {
                    setSynergyHeroes((build.synergy_heroes as unknown as number[]).map(id => ({ id })));
                } else {
                    setSynergyHeroes(build.synergy_heroes as unknown as HeroWithNote[]);
                }
            }
            if (build.counter_heroes && build.counter_heroes.length > 0) {
                if (typeof build.counter_heroes[0] === 'number') {
                    setCounterHeroes((build.counter_heroes as unknown as number[]).map(id => ({ id })));
                } else {
                    setCounterHeroes(build.counter_heroes as unknown as HeroWithNote[]);
                }
            }
            if (build.skill_1 !== undefined || build.skill_2 !== undefined || build.skill_3 !== undefined) {
                setSkillLevels([build.skill_1 || 0, build.skill_2 || 0, build.skill_3 || 0]);
            }
            // Pre-fill tier ratings
            const ratings: Partial<Record<TierCategory, number | null>> = {};
            const reasons: Partial<Record<TierCategory, string>> = {};
            if (build.rating_pve) { ratings.pve = build.rating_pve; if (build.reason_pve) reasons.pve = build.reason_pve; }
            if (build.rating_arena) { ratings.arena = build.rating_arena; if (build.reason_arena) reasons.arena = build.reason_arena; }
            if (build.rating_gw) { ratings.gw = build.rating_gw; if (build.reason_gw) reasons.gw = build.reason_gw; }
            if (build.rating_rta) { ratings.rta = build.rating_rta; if (build.reason_rta) reasons.rta = build.reason_rta; }
            setTierRatings(ratings);
            setTierReasons(reasons);

            // Pre-fill pros/cons tags (handle both old string[] and new TagWithNote[] format)
            if (build.pro_tags) {
                if (typeof build.pro_tags[0] === 'string') {
                    setProTags((build.pro_tags as string[]).map(id => ({ id })));
                } else {
                    setProTags(build.pro_tags as TagWithNote[]);
                }
            }
            if (build.con_tags) {
                if (typeof build.con_tags[0] === 'string') {
                    setConTags((build.con_tags as string[]).map(id => ({ id })));
                } else {
                    setConTags(build.con_tags as TagWithNote[]);
                }
            }
        }
    }, [buildData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            // Use FormData to support image uploads
            const formData = new FormData();
            formData.append('_method', 'PUT'); // Laravel method spoofing
            formData.append('title', title);
            if (description) formData.append('description', description);
            if (primarySet) formData.append('primary_set', primarySet);
            if (secondarySet) formData.append('secondary_set', secondarySet);
            formData.append('min_stats', JSON.stringify(minStats));

            // Add artifact
            if (artifactId) {
                formData.append('artifact_id', artifactId.toString());
            }

            // Add existing image URLs
            if (existingImages.length > 0) {
                formData.append('image_urls', JSON.stringify(existingImages));
            }

            // Add new image files
            imageFiles.forEach((file, index) => {
                formData.append(`images[${index}]`, file);
            });

            // Add synergy and counter heroes
            if (synergyHeroes.length > 0) {
                synergyHeroes.forEach((heroId, index) => {
                    formData.append(`synergy_heroes[${index}]`, heroId.toString());
                });
            }
            counterHeroes.forEach((heroId, index) => {
                formData.append(`counter_heroes[${index}]`, heroId.toString());
            });


            // Add skill levels
            if (skillLevels[0] > 0) formData.append('skill_1', skillLevels[0].toString());
            if (skillLevels[1] > 0) formData.append('skill_2', skillLevels[1].toString());
            if (skillLevels[2] > 0) formData.append('skill_3', skillLevels[2].toString());

            // Add anonymous option
            formData.append('is_anonymous', isAnonymous ? '1' : '0');

            // Add tier ratings
            TIER_CATEGORIES.forEach(cat => {
                if (tierRatings[cat] !== null && tierRatings[cat] !== undefined) {
                    formData.append(`rating_${cat}`, tierRatings[cat]!.toString());
                }
                if (tierReasons[cat]) {
                    formData.append(`reason_${cat}`, tierReasons[cat]!);
                }
            });

            // Add pros/cons tags as JSON
            if (proTags.length > 0) {
                formData.append('pro_tags', JSON.stringify(proTags));
            }
            if (conTags.length > 0) {
                formData.append('con_tags', JSON.stringify(conTags));
            }

            const response = await fetch(`${API_URL}/builds/${buildId}`, {
                method: 'POST', // Use POST with _method=PUT for FormData
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    throw new Error(data.message || 'Error al actualizar la build');
                } else {
                    throw new Error(`Error del servidor (${response.status}). Por favor intenta de nuevo.`);
                }
            }

            // Use window.location for full page refresh
            window.location.href = `/builds/${buildId}`;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateStat = (stat: string, value: string) => {
        setMinStats(prev => ({
            ...prev,
            [stat]: parseInt(value) || 0
        }));
    };

    if (!isAuthenticated) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-e7-void py-8 px-4 flex items-center justify-center">
                <div className="text-e7-gold">{t('common.loading', 'Loading...')}</div>
            </div>
        );
    }

    const build = buildData as Build | undefined;

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href={`/builds/${buildId}`} className="text-e7-gold hover:text-e7-text-gold text-sm mb-2 inline-flex items-center gap-2 group transition-colors">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> {t('common.back', 'Back')}
                    </Link>
                    <h1 className="font-display text-4xl text-gold-gradient tracking-wide mb-2">{t('builds.editBuild', 'Edit Build')}</h1>
                    <p className="text-slate-400">
                        {build?.hero?.name && `${t('builds.buildFor', 'Build for')} ${build.hero.name}`}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="glass-panel border-e7-gold/20 rounded-xl overflow-hidden mb-6">
                        <CardHeader className="border-b border-e7-gold/10">
                            <CardTitle className="text-e7-gold">{t('builds.buildInfo', 'Build Information')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('builds.titleLabel', 'Title')} *
                                </label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={t('builds.titlePlaceholder', 'E.g., Fast Cleave, RTA Counter, etc.')}
                                    className="bg-e7-void border-e7-gold/30 text-white"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('builds.descriptionLabel', 'Description (optional)')}
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t('builds.descriptionPlaceholder', 'Explain how to use this build...')}
                                    rows={4}
                                    className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none resize-none"
                                />
                            </div>

                            {/* Sets */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('builds.primarySet', 'Primary Set')}
                                    </label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {SETS.map((set) => (
                                            <button
                                                key={set}
                                                type="button"
                                                onClick={() => setPrimarySet(set)}
                                                className={`p-2 rounded-lg border transition-all ${primarySet === set
                                                    ? 'border-purple-500 bg-purple-500/20'
                                                    : 'border-e7-gold/20 hover:border-e7-gold/50'
                                                    }`}
                                                title={set}
                                            >
                                                <Image
                                                    src={SET_IMAGES[set]}
                                                    alt={set}
                                                    width={24}
                                                    height={24}
                                                    className="mx-auto"
                                                    unoptimized
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    {primarySet && (
                                        <p className="text-sm text-purple-400 mt-2 capitalize">{primarySet}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('builds.secondarySet', 'Secondary Set')}
                                    </label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {SETS.map((set) => (
                                            <button
                                                key={set}
                                                type="button"
                                                onClick={() => setSecondarySet(set)}
                                                className={`p-2 rounded-lg border transition-all ${secondarySet === set
                                                    ? 'border-blue-500 bg-blue-500/20'
                                                    : 'border-e7-gold/20 hover:border-e7-gold/50'
                                                    }`}
                                                title={set}
                                            >
                                                <Image
                                                    src={SET_IMAGES[set]}
                                                    alt={set}
                                                    width={24}
                                                    height={24}
                                                    className="mx-auto"
                                                    unoptimized
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    {secondarySet && (
                                        <p className="text-sm text-blue-400 mt-2 capitalize">{secondarySet}</p>
                                    )}
                                </div>
                            </div>

                            {/* Artifact Selector */}
                            <div className="relative" ref={artifactDropdownRef}>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('builds.artifact', 'Artifact')} ({t('common.optional', 'optional')})
                                </label>
                                <div
                                    className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white cursor-pointer flex items-center gap-2"
                                    onClick={() => setShowArtifactDropdown(!showArtifactDropdown)}
                                >
                                    {selectedArtifact ? (
                                        <>
                                            <Image
                                                src={selectedArtifact.icon}
                                                alt={selectedArtifact.name}
                                                width={40}
                                                height={40}
                                                className="rounded-lg"
                                                unoptimized
                                            />
                                            <span className="text-base">{selectedArtifact.name}</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-400">{t('builds.searchArtifact', 'Search artifact...')}</span>
                                    )}
                                </div>
                                {showArtifactDropdown && (
                                    <div className="absolute z-50 w-full mt-1 bg-e7-panel border border-e7-gold/30 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        <Input
                                            value={artifactSearch}
                                            onChange={(e) => setArtifactSearch(e.target.value)}
                                            placeholder={t('builds.searchArtifact', 'Search artifact...')}
                                            className="m-2 w-[calc(100%-16px)] bg-e7-void border-e7-gold/30 text-white"
                                            autoFocus
                                        />
                                        {filteredArtifacts.map((artifact) => (
                                            <div
                                                key={artifact.id}
                                                className="px-4 py-4 hover:bg-e7-gold/20 cursor-pointer text-white flex items-center gap-4"
                                                onClick={() => {
                                                    setArtifactId(artifact.id);
                                                    setShowArtifactDropdown(false);
                                                    setArtifactSearch('');
                                                }}
                                            >
                                                <Image
                                                    src={artifact.icon}
                                                    alt={artifact.name}
                                                    width={72}
                                                    height={72}
                                                    className="rounded-lg"
                                                    unoptimized
                                                />
                                                <span className="text-base">{artifact.name}</span>
                                            </div>
                                        ))}
                                        {filteredArtifacts.length === 0 && (
                                            <div className="px-4 py-2 text-gray-400">{t('builds.noArtifactsFound', 'No artifacts found')}</div>
                                        )}
                                    </div>
                                )}
                            </div>


                            {/* Skill Recommendations */}
                            {build?.hero?.skills && build.hero.skills.length >= 3 && (
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold mb-4 text-gold-gradient flex items-center gap-2">
                                        ⚡ {t('builds.skillRecommendations', 'Skill Upgrade Recommendations')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <SkillUpgradeInput
                                            skillNumber={1}
                                            skillData={build.hero.skills[0]}
                                            value={skillLevels[0]}
                                            onChange={(val) => setSkillLevels([val, skillLevels[1], skillLevels[2]])}
                                        />
                                        <SkillUpgradeInput
                                            skillNumber={2}
                                            skillData={build.hero.skills[1]}
                                            value={skillLevels[1]}
                                            onChange={(val) => setSkillLevels([skillLevels[0], val, skillLevels[2]])}
                                        />
                                        <SkillUpgradeInput
                                            skillNumber={3}
                                            skillData={build.hero.skills[2]}
                                            value={skillLevels[2]}
                                            onChange={(val) => setSkillLevels([skillLevels[0], skillLevels[1], val])}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Min Stats */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('builds.minStats', 'Minimum Recommended Stats')}
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { key: 'atk', label: 'ATK' },
                                        { key: 'def', label: 'DEF' },
                                        { key: 'hp', label: 'HP' },
                                        { key: 'spd', label: 'SPD' },
                                        { key: 'chc', label: 'CHC %' },
                                        { key: 'chd', label: 'CHD %' },
                                        { key: 'eff', label: 'EFF %' },
                                        { key: 'efr', label: 'RES %' },
                                    ].map((stat) => (
                                        <div key={stat.key}>
                                            <label className="block text-xs text-gray-400 mb-1">{stat.label}</label>
                                            <Input
                                                type="number"
                                                value={minStats[stat.key] || 0}
                                                onChange={(e) => updateStat(stat.key, e.target.value)}
                                                className="bg-e7-void border-e7-gold/30 text-white text-center"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('builds.images', 'Build Images (Screenshots)')}
                                </label>
                                <div
                                    className="border-2 border-dashed border-e7-gold/30 rounded-lg p-4 text-center hover:border-e7-gold/50 transition-colors cursor-pointer mb-3"
                                    onClick={() => document.getElementById('build-image-upload')?.click()}
                                >
                                    <input
                                        id="build-image-upload"
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            setImageFiles(prev => [...prev, ...files].slice(0, 5 - existingImages.length));
                                        }}
                                    />
                                    <div className="text-gray-400">
                                        📷 {t('builds.clickToUpload', 'Click to upload images')}
                                    </div>
                                </div>

                                {/* File previews */}
                                {imageFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {imageFiles.map((file, index) => (
                                            <div key={`file-${index}`} className="relative">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt=""
                                                    className="w-16 h-16 object-cover rounded border border-e7-gold/30"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setImageFiles(prev => prev.filter((_, i) => i !== index))}
                                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-500"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Existing images */}
                                {existingImages.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {existingImages.map((url, index) => (
                                            <div key={`existing-${index}`} className="relative">
                                                <img
                                                    src={url}
                                                    alt=""
                                                    className="w-16 h-16 object-cover rounded border border-purple-500/50"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== index))}
                                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-500"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Synergy Heroes */}
                            <HeroSelectorWithNotes
                                label={t('builds.synergyHeroes', 'Synergy Heroes')}
                                description={t('builds.synergyDesc', '(Heroes that work well with this hero)')}
                                selectedHeroes={synergyHeroes}
                                availableHeroes={heroes.filter(h => h.id !== build?.hero?.id)}
                                onChange={setSynergyHeroes}
                                type="synergy"
                                maxHeroes={5}
                            />

                            {/* Counter Heroes */}
                            <HeroSelectorWithNotes
                                label={t('builds.counterHeroes', 'Counter Heroes')}
                                description={t('builds.counterDesc', '(Heroes that counter this hero)')}
                                selectedHeroes={counterHeroes}
                                availableHeroes={heroes.filter(h => h.id !== build?.hero?.id)}
                                onChange={setCounterHeroes}
                                type="counter"
                                maxHeroes={5}
                            />

                            {/* Tier Ratings */}
                            <TierRatingSelector
                                ratings={tierRatings}
                                reasons={tierReasons}
                                onChange={(newRatings, newReasons) => {
                                    setTierRatings(newRatings);
                                    if (newReasons) setTierReasons(newReasons);
                                }}
                                showReasons={true}
                            />

                            {/* Pros/Cons Tags */}
                            <ProConsSelector
                                selectedPros={proTags}
                                selectedCons={conTags}
                                onChange={(pros, cons) => {
                                    setProTags(pros);
                                    setConTags(cons);
                                }}
                            />

                            {/* Anonymous option */}
                            <div className="flex items-center gap-3 p-4 bg-e7-void/30 rounded-lg border border-e7-gold/20">
                                <input
                                    type="checkbox"
                                    id="isAnonymous"
                                    checked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                    className="w-5 h-5 rounded border-e7-gold/30 bg-e7-void text-e7-gold focus:ring-e7-gold/30 cursor-pointer"
                                />
                                <label htmlFor="isAnonymous" className="text-slate-300 cursor-pointer">
                                    <div className="font-medium">{t('builds.publishAnonymously', 'Publish anonymously')}</div>
                                    <div className="text-xs text-gray-500">{t('builds.anonymousDesc', 'Your username will not appear in this build')}</div>
                                </label>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="p-4 rounded-lg bg-red-900/30 border border-red-500/50 text-red-400">
                                    {error}
                                </div>
                            )}

                            {/* Submit buttons */}
                            <div className="flex gap-4 justify-end pt-6 border-t border-e7-gold/10">
                                <Link href={`/builds/${buildId}`}>
                                    <Button type="button" variant="outline" className="border-e7-gold/30 text-slate-400 hover:text-slate-200 hover:border-e7-gold/50">
                                        {t('common.cancel', 'Cancel')}
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !title}
                                    className="btn-gold shadow-lg shadow-e7-gold/20 hover:shadow-e7-gold/40 disabled:opacity-50"
                                >
                                    {isSubmitting ? t('builds.updating', 'Updating...') : t('builds.updateBuild', 'Update Build')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div >
    );
}
