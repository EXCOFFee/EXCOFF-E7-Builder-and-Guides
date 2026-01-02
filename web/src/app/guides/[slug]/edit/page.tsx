'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { heroApi, guideApi, artifactApi } from '@/lib/api';
import { useTranslations } from '@/hooks/useTranslations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const CATEGORIES = [
    { id: 'general', label: 'General', emoji: '📖', key: 'general' },
    { id: 'pve', label: 'PVE', emoji: '🐉', key: 'pve' },
    { id: 'rta', label: 'RTA', emoji: '⚔️', key: 'rta' },
    { id: 'guild_war', label: 'Guild War', emoji: '🏰', key: 'guild_war' },
    { id: 'arena', label: 'Arena', emoji: '🏆', key: 'arena' },
    { id: 'heroes', label: 'Heroes', emoji: '🧙', key: 'heroes' },
    { id: 'tier_list', label: 'Tier List', emoji: '📊', key: 'tier_list' },
    { id: 'character_guide', label: 'Character Guide', emoji: '📋', key: 'character_guide' },
];

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

interface Guide {
    id: number;
    slug: string;
    title: string;
    category: string;
    hero_id: number | null;
    description: string;
    gameplay_content: string;
    video_url: string | null;
    images: string[];
    user: { id: number; name: string };
    recommended_heroes?: number[];
    recommended_artifacts?: number[];
}

export default function EditGuidePage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;
    const { t } = useTranslations();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('general');
    const [heroId, setHeroId] = useState<number | null>(null);
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imageUrl, setImageUrl] = useState('');

    // Recommended heroes/artifacts state
    const [recommendedHeroes, setRecommendedHeroes] = useState<number[]>([]);
    const [recommendedArtifacts, setRecommendedArtifacts] = useState<number[]>([]);
    const [heroSearch, setHeroSearch] = useState('');
    const [artifactSearch, setArtifactSearch] = useState('');
    const [showHeroDropdown, setShowHeroDropdown] = useState(false);
    const [showArtifactDropdown, setShowArtifactDropdown] = useState(false);
    const heroDropdownRef = useRef<HTMLDivElement>(null);
    const artifactDropdownRef = useRef<HTMLDivElement>(null);

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

    // Fetch existing guide data
    const { data: guideData, isLoading: loadingGuide } = useQuery({
        queryKey: ['guide', slug],
        queryFn: async () => {
            const response = await guideApi.get(slug);
            return response.data.data || response.data;
        },
        enabled: isAuthenticated && !!slug,
    });

    // Pre-fill form when guide loads
    useEffect(() => {
        if (guideData) {
            const guide = guideData as Guide;
            setTitle(guide.title || '');
            setCategory(guide.category || 'general');
            setHeroId(guide.hero_id);
            setDescription(guide.description || '');
            setContent(guide.gameplay_content || '');
            setVideoUrl(guide.video_url || '');
            setImages(guide.images || []);
            setRecommendedHeroes(guide.recommended_heroes || []);
            setRecommendedArtifacts(guide.recommended_artifacts || []);
        }
    }, [guideData]);

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

    // Fetch artifacts for selector
    const { data: artifactsData } = useQuery({
        queryKey: ['artifacts-list'],
        queryFn: async () => {
            const response = await artifactApi.list();
            return response.data;
        },
        enabled: isAuthenticated,
    });

    const artifacts: Artifact[] = artifactsData?.data || [];

    // Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (heroDropdownRef.current && !heroDropdownRef.current.contains(event.target as Node)) {
                setShowHeroDropdown(false);
            }
            if (artifactDropdownRef.current && !artifactDropdownRef.current.contains(event.target as Node)) {
                setShowArtifactDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
            // Use FormData to support file uploads
            const formData = new FormData();
            formData.append('_method', 'PUT'); // Laravel method spoofing
            formData.append('title', title);
            formData.append('category', category);
            if (heroId) formData.append('hero_id', heroId.toString());
            if (description) formData.append('description', description);
            if (content) formData.append('gameplay_content', content);
            if (videoUrl) formData.append('video_url', videoUrl);

            // Add existing image URLs
            if (images.length > 0) {
                formData.append('image_urls', JSON.stringify(images));
            }

            // Add new image files
            imageFiles.forEach((file, index) => {
                formData.append(`images[${index}]`, file);
            });

            // Add recommended heroes and artifacts
            recommendedHeroes.forEach((id, index) => {
                formData.append(`recommended_heroes[${index}]`, id.toString());
            });
            recommendedArtifacts.forEach((id, index) => {
                formData.append(`recommended_artifacts[${index}]`, id.toString());
            });

            const response = await fetch(`${API_URL}/guides/${slug}`, {
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
                    throw new Error(data.message || 'Error al actualizar la guía');
                } else {
                    throw new Error(`Error del servidor (${response.status}). Por favor intenta de nuevo.`);
                }
            }

            const updated = await response.json();
            // Use window.location for full page refresh
            window.location.href = `/guides/${updated.slug || slug}`;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    if (loadingGuide) {
        return (
            <div className="min-h-screen bg-void-glow py-8 px-4 flex items-center justify-center">
                <div className="text-e7-gold">{t('common.loading', 'Loading...')}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-void-glow py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href={`/guides/${slug}`} className="text-e7-gold hover:text-e7-text-gold text-sm mb-2 inline-flex items-center gap-2 group transition-colors">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> {t('guides.backToGuides', 'Back to Guide')}
                    </Link>
                    <h1 className="font-display text-4xl text-gold-gradient tracking-wide mb-2">{t('guides.editGuide', 'Edit Guide')}</h1>
                    <p className="text-slate-400">{t('guides.editSubtitle', 'Update your guide content')}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="glass-panel border-e7-gold/20 rounded-xl overflow-hidden">
                        <CardHeader className="border-b border-e7-gold/10">
                            <CardTitle className="text-e7-gold">{t('guides.guideInfo', 'Guide Information')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('guides.titleLabel', 'Title')} *
                                </label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={t('guides.titlePlaceholder', 'E.g., Complete Arbiter Vildred Guide for RTA')}
                                    className="bg-e7-void border-e7-gold/30 text-white"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('guides.category', 'Category')} *
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategory(cat.id)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${category === cat.id
                                                ? 'bg-e7-gold/20 text-e7-gold border border-e7-gold'
                                                : 'bg-e7-void text-gray-400 border border-e7-gold/20 hover:border-e7-gold/50'
                                                }`}
                                        >
                                            <span className="mr-2">{cat.emoji}</span>
                                            {t(`guides.categories.${cat.key}`, cat.label)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Hero selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('guides.relatedHero', 'Related Hero (optional)')}
                                </label>
                                <select
                                    value={heroId || ''}
                                    onChange={(e) => setHeroId(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none"
                                >
                                    <option value="">{t('guides.noSpecificHero', 'No specific hero')}</option>
                                    {heroes.map((hero) => (
                                        <option key={hero.id} value={hero.id}>
                                            {hero.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Video URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('guides.videoUrl', 'Video URL (optional)')}
                                </label>
                                <Input
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="bg-e7-void border-e7-gold/30 text-white"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('guides.descriptionLabel', 'Brief Description')}
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t('guides.descriptionPlaceholder', 'A brief description of what this guide covers...')}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none resize-none"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('guides.content', 'Guide Content')} *
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={t('guides.contentPlaceholder', 'Write your guide content here...')}
                                    rows={15}
                                    className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none resize-none font-mono text-sm"
                                    required
                                />
                            </div>

                            {/* Recommended Heroes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('guides.recommendedHeroes', 'Recommended Heroes')}
                                    <span className="text-gray-500 text-xs ml-2">{t('guides.recommendedHeroesDesc', '(Heroes that synergize with this guide)')}</span>
                                </label>
                                <div className="relative" ref={heroDropdownRef}>
                                    <Input
                                        type="text"
                                        value={heroSearch}
                                        onChange={(e) => setHeroSearch(e.target.value)}
                                        onFocus={() => setShowHeroDropdown(true)}
                                        placeholder={t('guides.searchHeroToAdd', 'Search hero to add...')}
                                        className="bg-e7-void border-e7-gold/30 text-white"
                                    />
                                    {showHeroDropdown && (
                                        <div className="absolute z-30 w-full mt-1 bg-e7-dark border border-e7-gold/30 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                            {heroes
                                                .filter(h => h.name.toLowerCase().includes(heroSearch.toLowerCase()) && !recommendedHeroes.includes(h.id))
                                                .slice(0, 10)
                                                .map(hero => (
                                                    <button
                                                        key={hero.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setRecommendedHeroes([...recommendedHeroes, hero.id]);
                                                            setHeroSearch('');
                                                            setShowHeroDropdown(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-e7-gold/20 flex items-center gap-3"
                                                    >
                                                        {hero.image_url && (
                                                            <Image
                                                                src={hero.image_url}
                                                                alt={hero.name}
                                                                width={48}
                                                                height={48}
                                                                className="rounded-full"
                                                            />
                                                        )}
                                                        <span className="text-slate-200">{hero.name}</span>
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </div>
                                {recommendedHeroes.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {recommendedHeroes.map(hId => {
                                            const h = heroes.find(hero => hero.id === hId);
                                            if (!h) return null;
                                            return (
                                                <div key={hId} className="flex items-center gap-2 bg-purple-900/30 border border-purple-500/30 rounded-lg px-3 py-2">
                                                    {h.image_url && (
                                                        <Image
                                                            src={h.image_url}
                                                            alt={h.name}
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full"
                                                        />
                                                    )}
                                                    <span className="text-sm text-purple-300">{h.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setRecommendedHeroes(recommendedHeroes.filter(id => id !== hId))}
                                                        className="text-purple-400 hover:text-red-400 ml-1"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Recommended Artifacts */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('guides.recommendedArtifacts', 'Recommended Artifacts')}
                                    <span className="text-gray-500 text-xs ml-2">{t('guides.recommendedArtifactsDesc', '(Artifacts recommended for this guide)')}</span>
                                </label>
                                <div className="relative" ref={artifactDropdownRef}>
                                    <Input
                                        type="text"
                                        value={artifactSearch}
                                        onChange={(e) => setArtifactSearch(e.target.value)}
                                        onFocus={() => setShowArtifactDropdown(true)}
                                        placeholder={t('guides.searchArtifactToAdd', 'Search artifact to add...')}
                                        className="bg-e7-void border-e7-gold/30 text-white"
                                    />
                                    {showArtifactDropdown && (
                                        <div className="absolute z-30 w-full mt-1 bg-e7-dark border border-e7-gold/30 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                            {artifacts
                                                .filter(a => a.name.toLowerCase().includes(artifactSearch.toLowerCase()) && !recommendedArtifacts.includes(a.id))
                                                .slice(0, 10)
                                                .map(artifact => (
                                                    <button
                                                        key={artifact.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setRecommendedArtifacts([...recommendedArtifacts, artifact.id]);
                                                            setArtifactSearch('');
                                                            setShowArtifactDropdown(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-e7-gold/20 flex items-center gap-3"
                                                    >
                                                        <Image
                                                            src={artifact.icon || `/images/artifacts/${artifact.code}.png`}
                                                            alt={artifact.name}
                                                            width={48}
                                                            height={48}
                                                            className="rounded"
                                                            unoptimized
                                                        />
                                                        <span className="text-slate-200">{artifact.name}</span>
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </div>
                                {recommendedArtifacts.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {recommendedArtifacts.map(aId => {
                                            const a = artifacts.find(artifact => artifact.id === aId);
                                            if (!a) return null;
                                            return (
                                                <div key={aId} className="flex items-center gap-2 bg-amber-900/30 border border-amber-500/30 rounded-lg px-3 py-2">
                                                    <Image
                                                        src={a.icon || `/images/artifacts/${a.code}.png`}
                                                        alt={a.name}
                                                        width={40}
                                                        height={40}
                                                        className="rounded"
                                                        unoptimized
                                                    />
                                                    <span className="text-sm text-amber-300">{a.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setRecommendedArtifacts(recommendedArtifacts.filter(id => id !== aId))}
                                                        className="text-amber-400 hover:text-red-400 ml-1"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('guides.imagesOptional', 'Images (optional)')}
                                </label>
                                {/* Current Images */}
                                {images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="relative group">
                                                <img
                                                    src={img}
                                                    alt={`Image ${idx + 1}`}
                                                    className="w-full h-24 object-cover rounded border border-e7-gold/20"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* File Upload */}
                                <div className="mb-3">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            setImageFiles(prev => [...prev, ...files].slice(0, 5 - images.length));
                                            e.target.value = '';
                                        }}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={(images.length + imageFiles.length) >= 5}
                                        className="border-e7-gold/30 w-full"
                                    >
                                        📁 {t('guides.uploadFromDevice', 'Upload from device')}
                                    </Button>
                                </div>

                                {/* New file previews */}
                                {imageFiles.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        {imageFiles.map((file, idx) => (
                                            <div key={`new-${idx}`} className="relative group">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt=""
                                                    className="w-full h-24 object-cover rounded border border-green-500/50"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setImageFiles(prev => prev.filter((_, i) => i !== idx))}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ×
                                                </button>
                                                <span className="absolute bottom-1 left-1 text-xs bg-green-600 text-white px-1 rounded">New</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Image URL */}
                                <div className="flex gap-2">
                                    <Input
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder={t('guides.pasteImageUrl', 'Paste image URL...')}
                                        className="flex-1 bg-e7-void border-e7-gold/30 text-white"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            if (imageUrl && images.length < 5) {
                                                setImages([...images, imageUrl]);
                                                setImageUrl('');
                                            }
                                        }}
                                        disabled={!imageUrl || images.length >= 5}
                                        className="border-e7-gold/30"
                                    >
                                        {t('common.add', 'Add')}
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{t('guides.maxImages', 'Maximum 5 images')}</p>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="p-4 rounded-lg bg-red-900/30 border border-red-500/50 text-red-400">
                                    {error}
                                </div>
                            )}

                            {/* Submit buttons */}
                            <div className="flex gap-4 justify-end pt-6 border-t border-e7-gold/10">
                                <Link href={`/guides/${slug}`}>
                                    <Button type="button" variant="outline" className="border-e7-gold/30 text-slate-400 hover:text-slate-200 hover:border-e7-gold/50">
                                        {t('common.cancel', 'Cancel')}
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !title || !content}
                                    className="btn-gold shadow-lg shadow-e7-gold/20 hover:shadow-e7-gold/40 disabled:opacity-50"
                                >
                                    {isSubmitting ? t('common.saving', 'Saving...') : t('common.saveChanges', 'Save Changes')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div >
        </div >
    );
}
