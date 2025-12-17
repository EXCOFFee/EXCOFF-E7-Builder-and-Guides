'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { heroApi } from '@/lib/api';
import { useTranslations } from '@/hooks/useTranslations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const CATEGORIES = [
    { id: 'general', label: 'General', emoji: '📖', key: 'general' },
    { id: 'pve', label: 'PVE', emoji: '🐉', key: 'pve' },
    { id: 'rta', label: 'RTA', emoji: '⚔️', key: 'rta' },
    { id: 'guild_war', label: 'Guild War', emoji: '🏰', key: 'guild_war' },
    { id: 'arena', label: 'Arena', emoji: '🏆', key: 'arena' },
    { id: 'heroes', label: 'Heroes', emoji: '🧙', key: 'heroes' },
];

interface Hero {
    id: number;
    name: string;
    slug: string;
}

export default function CreateGuidePage() {
    const router = useRouter();
    const { t } = useTranslations();
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
    const [images, setImages] = useState<File[]>([]);

    // Get search params for pre-selection
    const searchParams = useSearchParams();
    const preselectedHeroId = searchParams.get('hero_id');
    const preselectedHeroName = searchParams.get('hero_name');

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
            // Use FormData for image uploads
            const formData = new FormData();
            formData.append('title', title);
            formData.append('category', category);
            if (heroId) formData.append('hero_id', heroId.toString());
            if (description) formData.append('description', description);
            if (content) formData.append('gameplay_content', content);
            if (videoUrl) formData.append('video_url', videoUrl);

            // Append images
            images.forEach((image, index) => {
                formData.append(`images[${index}]`, image);
            });

            const response = await fetch(`${API_URL}/guides`, {
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
                    throw new Error(data.message || 'Error al crear la guía');
                } else {
                    throw new Error(`Error del servidor (${response.status}). Por favor intenta de nuevo.`);
                }
            }

            const guide = await response.json();
            // Use window.location for full page refresh
            window.location.href = `/guides/${guide.slug}`;
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
        <div className="min-h-screen bg-void-glow py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/guides" className="text-e7-gold hover:text-e7-text-gold text-sm mb-2 inline-flex items-center gap-2 group transition-colors">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> {t('guides.backToGuides', 'Back to Guides')}
                    </Link>
                    <h1 className="font-display text-4xl text-gold-gradient tracking-wide mb-2">{t('guidesCreate.createGuide', 'Create New Guide')}</h1>
                    <p className="text-slate-400">
                        {preselectedHeroName
                            ? `${t('guidesCreate.creatingFor', 'Creating guide for')} ${decodeURIComponent(preselectedHeroName)}`
                            : t('guidesCreate.shareKnowledge', 'Share your knowledge with the community')
                        }
                    </p>
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
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('guidesCreate.videoSupport', 'We support YouTube, Twitch and Bilibili')}
                                </p>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('guides.imagesOptional', 'Images (optional)')}
                                </label>
                                <div
                                    className="border-2 border-dashed border-e7-gold/30 rounded-lg p-4 text-center hover:border-e7-gold/50 transition-colors cursor-pointer"
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                >
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            setImages(prev => [...prev, ...files].slice(0, 5));
                                        }}
                                    />
                                    <div className="text-gray-400">
                                        📷 {t('guidesCreate.clickToUpload', 'Click to upload images')}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {t('guidesCreate.maxImages', 'Maximum 5 images (JPEG, PNG, GIF, WebP)')}
                                    </p>
                                </div>
                                {images.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {images.map((file, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt=""
                                                    className="w-20 h-20 object-cover rounded border border-e7-gold/30"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-500"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('guidesCreate.markdownSupport', 'Supports Markdown: **bold**, *italic*, ## Headers, - Lists')}
                                </p>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="p-4 rounded-lg bg-red-900/30 border border-red-500/50 text-red-400">
                                    {error}
                                </div>
                            )}

                            {/* Submit buttons */}
                            <div className="flex gap-4 justify-end pt-6 border-t border-e7-gold/10">
                                <Link href="/guides">
                                    <Button type="button" variant="outline" className="border-e7-gold/30 text-slate-400 hover:text-slate-200 hover:border-e7-gold/50">
                                        {t('common.cancel', 'Cancel')}
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !title || !content}
                                    className="btn-gold shadow-lg shadow-e7-gold/20 hover:shadow-e7-gold/40 disabled:opacity-50"
                                >
                                    {isSubmitting ? t('guidesCreate.publishing', 'Publishing...') : t('guidesCreate.publishGuide', 'Publish Guide')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}
