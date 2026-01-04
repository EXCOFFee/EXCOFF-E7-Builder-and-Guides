'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query';
import { heroApi, buildApi } from '@/lib/api';
import Image from 'next/image';
import { useTranslations } from '@/hooks/useTranslations';

import { SETS, SET_IMAGES, SET_NAMES } from '@/lib/sets';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Hero {
    id: number;
    name: string;
    slug: string;
    image_url?: string;
}

interface Artifact {
    id: number;
    name: string;
    code: string;
    icon: string;
}

export default function CreateBuildPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslations();
    const preselectedHeroId = searchParams.get('hero_id');
    const preselectedHeroName = searchParams.get('hero_name');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Form state
    const [heroId, setHeroId] = useState<number | null>(preselectedHeroId ? parseInt(preselectedHeroId) : null);
    const [artifactId, setArtifactId] = useState<number | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [primarySet, setPrimarySet] = useState('');
    const [secondarySet, setSecondarySet] = useState('');

    // Search states for dropdowns
    const [heroSearch, setHeroSearch] = useState('');
    const [artifactSearch, setArtifactSearch] = useState('');
    const [showHeroDropdown, setShowHeroDropdown] = useState(false);
    const [showArtifactDropdown, setShowArtifactDropdown] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        atk: '',
        def: '',
        hp: '',
        spd: '',
        crit_chance: '',
        crit_dmg: '',
        eff: '',
        res: ''
    });

    // Images
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Synergy and Counter heroes
    const [synergyHeroes, setSynergyHeroes] = useState<number[]>([]);
    const [counterHeroes, setCounterHeroes] = useState<number[]>([]);
    const [showSynergyDropdown, setShowSynergyDropdown] = useState(false);
    const [showCounterDropdown, setShowCounterDropdown] = useState(false);
    const [synergySearch, setSynergySearch] = useState('');
    const [counterSearch, setCounterSearch] = useState('');

    // Refs for click outside
    const heroDropdownRef = useRef<HTMLDivElement>(null);
    const artifactDropdownRef = useRef<HTMLDivElement>(null);
    const synergyDropdownRef = useRef<HTMLDivElement>(null);
    const counterDropdownRef = useRef<HTMLDivElement>(null);

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            localStorage.setItem('return_url', window.location.pathname + window.location.search);
            router.push('/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    // Set preselected hero
    useEffect(() => {
        if (preselectedHeroId && !heroId) {
            setHeroId(parseInt(preselectedHeroId));
        }
    }, [preselectedHeroId, heroId]);

    // Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (heroDropdownRef.current && !heroDropdownRef.current.contains(event.target as Node)) {
                setShowHeroDropdown(false);
            }
            if (artifactDropdownRef.current && !artifactDropdownRef.current.contains(event.target as Node)) {
                setShowArtifactDropdown(false);
            }
            if (synergyDropdownRef.current && !synergyDropdownRef.current.contains(event.target as Node)) {
                setShowSynergyDropdown(false);
            }
            if (counterDropdownRef.current && !counterDropdownRef.current.contains(event.target as Node)) {
                setShowCounterDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch heroes for selector
    const { data: heroesData } = useQuery({
        queryKey: ['heroes-list'],
        queryFn: async () => {
            const response = await heroApi.list({});
            return response.data;
        },
        enabled: isAuthenticated,
    });

    const heroes: Hero[] = heroesData?.data || [];
    const filteredHeroes = heroes.filter(h =>
        h.name.toLowerCase().includes(heroSearch.toLowerCase())
    );
    const selectedHero = heroes.find(h => h.id === heroId);

    // Fetch artifacts for selector
    const { data: artifactsData } = useQuery({
        queryKey: ['artifacts-list'],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/artifacts`);
            return response.json();
        },
        enabled: isAuthenticated,
    });

    const artifacts: Artifact[] = artifactsData?.data || [];
    const filteredArtifacts = artifacts.filter(a =>
        a.name.toLowerCase().includes(artifactSearch.toLowerCase())
    );
    const selectedArtifact = artifacts.find(a => a.id === artifactId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Convert stats to numbers
        const minStats: Record<string, number> = {};
        Object.entries(stats).forEach(([key, value]) => {
            if (value) minStats[key] = parseInt(value);
        });

        try {
            // Use FormData to support image uploads
            const formData = new FormData();
            if (heroId) formData.append('hero_id', heroId.toString());
            formData.append('title', title);
            if (description) formData.append('description', description);
            if (primarySet) formData.append('primary_set', primarySet);
            if (secondarySet) formData.append('secondary_set', secondarySet);
            if (Object.keys(minStats).length > 0) {
                formData.append('min_stats', JSON.stringify(minStats));
            }

            // Add artifact
            if (artifactId) {
                formData.append('artifact_id', artifactId.toString());
            }

            // Add images
            images.forEach((image, index) => {
                formData.append(`images[${index}]`, image);
            });

            // Add synergy and counter heroes
            if (synergyHeroes.length > 0) {
                synergyHeroes.forEach((heroId, index) => {
                    formData.append(`synergy_heroes[${index}]`, heroId.toString());
                });
            }
            if (counterHeroes.length > 0) {
                counterHeroes.forEach((heroId, index) => {
                    formData.append(`counter_heroes[${index}]`, heroId.toString());
                });
            }

            const response = await fetch(`${API_URL}/builds`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                // Check if response is JSON before parsing
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    throw new Error(data.message || 'Error al crear la build');
                } else {
                    // Server returned HTML error page
                    throw new Error(`Error del servidor (${response.status}). Por favor intenta de nuevo.`);
                }
            }

            // Use window.location for full page refresh to ensure data is reloaded
            const selectedHero = heroes.find(h => h.id === heroId);
            if (selectedHero) {
                window.location.href = `/heroes/${selectedHero.slug}`;
            } else {
                window.location.href = '/heroes';
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/heroes" className="text-e7-gold hover:text-e7-text-gold text-sm mb-2 inline-flex items-center gap-2 group transition-colors">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> {t('builds.backToHeroes', 'Back to Heroes')}
                    </Link>
                    <h1 className="font-display text-4xl text-gold-gradient tracking-wide mb-2">{t('builds.createNewBuild', 'Create New Build')}</h1>
                    <p className="text-slate-400">
                        {preselectedHeroName
                            ? `${t('builds.creatingFor', 'Creating build for')} ${decodeURIComponent(preselectedHeroName)}`
                            : t('builds.shareConfig', 'Share your equipment configuration with the community')
                        }
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="glass-panel border-e7-gold/20 rounded-xl overflow-hidden">
                        <CardHeader className="border-b border-e7-gold/10">
                            <CardTitle className="text-e7-gold">{t('builds.buildInfo', 'Build Information')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* Hero selector with search */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('builds.hero', 'Hero')} *
                                </label>
                                <div
                                    className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white cursor-pointer flex items-center gap-2"
                                    onClick={() => setShowHeroDropdown(!showHeroDropdown)}
                                >
                                    {selectedHero ? (
                                        <>
                                            <span>{selectedHero.name}</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-400">{t('builds.searchHero', 'Search hero...')}</span>
                                    )}
                                </div>
                                {showHeroDropdown && (
                                    <div className="absolute z-50 w-full mt-1 bg-e7-panel border border-e7-gold/30 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        <Input
                                            value={heroSearch}
                                            onChange={(e) => setHeroSearch(e.target.value)}
                                            placeholder={t('builds.searchHero', 'Search hero...')}
                                            className="m-2 w-[calc(100%-16px)] bg-e7-void border-e7-gold/30 text-white"
                                            autoFocus
                                        />
                                        {filteredHeroes.slice(0, 20).map((hero) => (
                                            <div
                                                key={hero.id}
                                                className="px-4 py-2 hover:bg-e7-gold/20 cursor-pointer text-white flex items-center gap-3"
                                                onClick={() => {
                                                    setHeroId(hero.id);
                                                    setShowHeroDropdown(false);
                                                    setHeroSearch('');
                                                }}
                                            >
                                                {hero.image_url && (
                                                    <Image
                                                        src={hero.image_url}
                                                        alt={hero.name}
                                                        width={64}
                                                        height={64}
                                                        className="rounded-full"
                                                        unoptimized
                                                    />
                                                )}
                                                {hero.name}
                                            </div>
                                        ))}
                                        {filteredHeroes.length === 0 && (
                                            <div className="px-4 py-2 text-gray-400">{t('heroes.noResults', 'No heroes found')}</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Artifact selector with search */}
                            <div className="relative">
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
                                    <div className="absolute z-50 w-full mt-1 bg-e7-panel border border-e7-gold/30 rounded-lg shadow-lg max-h-96 overflow-y-auto">
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
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none resize-none"
                                />
                            </div>

                            {/* Sets */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('builds.primarySet', 'Primary Set')}
                                    </label>
                                    <div className="grid grid-cols-6 gap-2 p-3 bg-e7-void rounded-lg border border-e7-gold/30">
                                        {SETS.map((set) => (
                                            <button
                                                key={set}
                                                type="button"
                                                onClick={() => setPrimarySet(primarySet === set ? '' : set)}
                                                className={`relative w-10 h-10 rounded-lg transition-all ${primarySet === set
                                                    ? 'ring-2 ring-e7-gold bg-e7-gold/30 scale-110'
                                                    : 'hover:bg-e7-panel hover:scale-105 opacity-70 hover:opacity-100'
                                                    }`}
                                                title={SET_NAMES[set]}
                                            >
                                                <Image
                                                    src={SET_IMAGES[set]}
                                                    alt={SET_NAMES[set]}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-contain"
                                                    unoptimized
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    {primarySet && (
                                        <p className="text-sm text-e7-gold mt-1 capitalize">{SET_NAMES[primarySet]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('builds.secondarySet', 'Secondary Set')}
                                    </label>
                                    <div className="grid grid-cols-6 gap-2 p-3 bg-e7-void rounded-lg border border-e7-gold/30">
                                        {SETS.map((set) => (
                                            <button
                                                key={set}
                                                type="button"
                                                onClick={() => setSecondarySet(secondarySet === set ? '' : set)}
                                                className={`relative w-10 h-10 rounded-lg transition-all ${secondarySet === set
                                                    ? 'ring-2 ring-e7-gold bg-e7-gold/30 scale-110'
                                                    : 'hover:bg-e7-panel hover:scale-105 opacity-70 hover:opacity-100'
                                                    }`}
                                                title={SET_NAMES[set]}
                                            >
                                                <Image
                                                    src={SET_IMAGES[set]}
                                                    alt={SET_NAMES[set]}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-contain"
                                                    unoptimized
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    {secondarySet && (
                                        <p className="text-sm text-e7-gold mt-1 capitalize">{SET_NAMES[secondarySet]}</p>
                                    )}
                                </div>
                            </div>

                            {/* Minimum Stats */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                    {t('builds.minStats', 'Minimum Recommended Stats')}
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">ATK</label>
                                        <Input
                                            type="number"
                                            value={stats.atk}
                                            onChange={(e) => setStats({ ...stats, atk: e.target.value })}
                                            placeholder="4000"
                                            className="bg-e7-void border-e7-gold/30 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">DEF</label>
                                        <Input
                                            type="number"
                                            value={stats.def}
                                            onChange={(e) => setStats({ ...stats, def: e.target.value })}
                                            placeholder="1200"
                                            className="bg-e7-void border-e7-gold/30 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">HP</label>
                                        <Input
                                            type="number"
                                            value={stats.hp}
                                            onChange={(e) => setStats({ ...stats, hp: e.target.value })}
                                            placeholder="15000"
                                            className="bg-e7-void border-e7-gold/30 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">SPD</label>
                                        <Input
                                            type="number"
                                            value={stats.spd}
                                            onChange={(e) => setStats({ ...stats, spd: e.target.value })}
                                            placeholder="250"
                                            className="bg-e7-void border-e7-gold/30 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Crit %</label>
                                        <Input
                                            type="number"
                                            value={stats.crit_chance}
                                            onChange={(e) => setStats({ ...stats, crit_chance: e.target.value })}
                                            placeholder="100"
                                            className="bg-e7-void border-e7-gold/30 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">C.Dmg %</label>
                                        <Input
                                            type="number"
                                            value={stats.crit_dmg}
                                            onChange={(e) => setStats({ ...stats, crit_dmg: e.target.value })}
                                            placeholder="300"
                                            className="bg-e7-void border-e7-gold/30 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">EFF %</label>
                                        <Input
                                            type="number"
                                            value={stats.eff}
                                            onChange={(e) => setStats({ ...stats, eff: e.target.value })}
                                            placeholder="0"
                                            className="bg-e7-void border-e7-gold/30 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">RES %</label>
                                        <Input
                                            type="number"
                                            value={stats.res}
                                            onChange={(e) => setStats({ ...stats, res: e.target.value })}
                                            placeholder="0"
                                            className="bg-e7-void border-e7-gold/30 text-white text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('builds.images', 'Build Images (Screenshots)')}
                                </label>
                                <div className="border-2 border-dashed border-e7-gold/30 rounded-lg p-4 hover:border-e7-gold/50 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        id="build-images"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            if (files.length + images.length > 5) {
                                                alert(t('builds.maxImages', 'Maximum 5 images'));
                                                return;
                                            }
                                            setImages([...images, ...files]);
                                            // Create previews
                                            files.forEach((file) => {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setImagePreviews((prev) => [...prev, reader.result as string]);
                                                };
                                                reader.readAsDataURL(file);
                                            });
                                        }}
                                    />
                                    <label htmlFor="build-images" className="cursor-pointer flex flex-col items-center">
                                        <span className="text-3xl mb-2">📷</span>
                                        <span className="text-gray-400 text-sm">{t('builds.clickToUpload', 'Click to upload images')}</span>
                                        <span className="text-gray-500 text-xs mt-1">{t('builds.maxImages', 'Maximum 5 images (PNG, JPG)')}</span>
                                    </label>
                                </div>
                                {/* Image previews */}
                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-5 gap-2 mt-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-e7-void border border-e7-gold/20">
                                                <Image
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImages(images.filter((_, i) => i !== index));
                                                        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
                                                    }}
                                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                                                >
                                                    ÁE
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Synergy Heroes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('builds.synergyHeroes', 'Synergy Heroes')}
                                    <span className="text-gray-500 text-xs ml-2">{t('builds.synergyDesc', '(Heroes that work well with this hero)')}</span>
                                </label>
                                <div className="relative" ref={synergyDropdownRef}>
                                    <Input
                                        type="text"
                                        value={synergySearch}
                                        onChange={(e) => setSynergySearch(e.target.value)}
                                        onFocus={() => setShowSynergyDropdown(true)}
                                        placeholder={t('builds.searchHeroToAdd', 'Search hero to add...')}
                                        className="bg-e7-void border-e7-gold/30 text-white"
                                    />
                                    {showSynergyDropdown && (
                                        <div className="absolute z-30 w-full mt-1 bg-e7-dark border border-e7-gold/30 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                            {heroes
                                                .filter(h => h.name.toLowerCase().includes(synergySearch.toLowerCase()) && !synergyHeroes.includes(h.id) && h.id !== heroId)
                                                .slice(0, 10)
                                                .map(hero => (
                                                    <button
                                                        key={hero.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSynergyHeroes([...synergyHeroes, hero.id]);
                                                            setSynergySearch('');
                                                            setShowSynergyDropdown(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-e7-gold/20 flex items-center gap-3"
                                                    >
                                                        <Image
                                                            src={hero.image_url || `/images/hero/${hero.slug}_s.png`}
                                                            alt={hero.name}
                                                            width={48}
                                                            height={48}
                                                            className="rounded-full"
                                                        />
                                                        <span className="text-slate-200">{hero.name}</span>
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </div>
                                {/* Selected synergy heroes */}
                                {synergyHeroes.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {synergyHeroes.map(hId => {
                                            const h = heroes.find(hero => hero.id === hId);
                                            if (!h) return null;
                                            return (
                                                <div key={hId} className="flex items-center gap-2 bg-green-900/30 border border-green-500/30 rounded-full px-3 py-1">
                                                    <Image
                                                        src={h.image_url || `/images/hero/${h.slug}_s.png`}
                                                        alt={h.name}
                                                        width={24}
                                                        height={24}
                                                        className="rounded-full"
                                                    />
                                                    <span className="text-sm text-green-300">{h.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSynergyHeroes(synergyHeroes.filter(id => id !== hId))}
                                                        className="text-green-400 hover:text-red-400 ml-1"
                                                    >
                                                        ÁE
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Counter Heroes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('builds.counterHeroes', 'Counter Heroes')}
                                    <span className="text-gray-500 text-xs ml-2">{t('builds.counterDesc', '(Heroes that counter this hero)')}</span>
                                </label>
                                <div className="relative" ref={counterDropdownRef}>
                                    <Input
                                        type="text"
                                        value={counterSearch}
                                        onChange={(e) => setCounterSearch(e.target.value)}
                                        onFocus={() => setShowCounterDropdown(true)}
                                        placeholder={t('builds.searchHeroToAdd', 'Search hero to add...')}
                                        className="bg-e7-void border-e7-gold/30 text-white"
                                    />
                                    {showCounterDropdown && (
                                        <div className="absolute z-30 w-full mt-1 bg-e7-dark border border-e7-gold/30 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                            {heroes
                                                .filter(h => h.name.toLowerCase().includes(counterSearch.toLowerCase()) && !counterHeroes.includes(h.id) && h.id !== heroId)
                                                .slice(0, 10)
                                                .map(hero => (
                                                    <button
                                                        key={hero.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setCounterHeroes([...counterHeroes, hero.id]);
                                                            setCounterSearch('');
                                                            setShowCounterDropdown(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-e7-gold/20 flex items-center gap-3"
                                                    >
                                                        <Image
                                                            src={hero.image_url || `/images/hero/${hero.slug}_s.png`}
                                                            alt={hero.name}
                                                            width={48}
                                                            height={48}
                                                            className="rounded-full"
                                                        />
                                                        <span className="text-slate-200">{hero.name}</span>
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </div>
                                {/* Selected counter heroes */}
                                {counterHeroes.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {counterHeroes.map(hId => {
                                            const h = heroes.find(hero => hero.id === hId);
                                            if (!h) return null;
                                            return (
                                                <div key={hId} className="flex items-center gap-2 bg-red-900/30 border border-red-500/30 rounded-full px-3 py-1">
                                                    <Image
                                                        src={h.image_url || `/images/hero/${h.slug}_s.png`}
                                                        alt={h.name}
                                                        width={24}
                                                        height={24}
                                                        className="rounded-full"
                                                    />
                                                    <span className="text-sm text-red-300">{h.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setCounterHeroes(counterHeroes.filter(id => id !== hId))}
                                                        className="text-red-400 hover:text-red-600 ml-1"
                                                    >
                                                        ÁE
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="p-4 rounded-lg bg-red-900/30 border border-red-500/50 text-red-400">
                                    {error}
                                </div>
                            )}

                            {/* Submit buttons */}
                            <div className="flex gap-4 justify-end pt-6 border-t border-e7-gold/10">
                                <Link href="/heroes">
                                    <Button type="button" variant="outline" className="border-e7-gold/30 text-slate-400 hover:text-slate-200 hover:border-e7-gold/50">
                                        {t('common.cancel', 'Cancel')}
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !heroId || !title}
                                    className="btn-gold shadow-lg shadow-e7-gold/20 hover:shadow-e7-gold/40 disabled:opacity-50"
                                >
                                    {isSubmitting ? t('builds.publishing', 'Publishing...') : t('builds.publishBuild', 'Publish Build')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}
