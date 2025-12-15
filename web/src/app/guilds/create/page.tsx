'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/hooks/useTranslations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const SERVERS = ['global', 'europe', 'asia', 'japan', 'korea', 'china'];
const LANGUAGES = ['en', 'es', 'ko', 'ja', 'zh', 'pt'];
const TAGS = [
    'casual', 'chill', 'semi_competitive', 'competitive_all',
    'competitive_gw', 'competitive_rta', 'whatsapp', 'discord',
    'other_social', 'beginner', 'help_improve', 'active'
];

const SERVER_LABELS: Record<string, string> = {
    global: 'Global',
    europe: 'Europe',
    asia: 'Asia',
    japan: 'Japan',
    korea: 'Korea',
    china: 'China',
};

const SERVER_FLAGS: Record<string, string> = {
    global: '🌍',
    europe: '🇪🇺',
    asia: '🌏',
    japan: '🇯🇵',
    korea: '🇰🇷',
    china: '🇨🇳',
};

const LANGUAGE_LABELS: Record<string, string> = {
    en: 'English',
    es: 'Español',
    ko: '한국어',
    ja: '日本語',
    zh: '中文',
    pt: 'Português',
};

export default function CreateGuildPostPage() {
    const router = useRouter();
    const { t } = useTranslations();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [server, setServer] = useState('');
    const [language, setLanguage] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [imageFiles, setImageFiles] = useState<File[]>([]);

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

    const TAG_LABELS: Record<string, string> = {
        casual: t('guilds.tags.casual', 'Casual'),
        chill: t('guilds.tags.chill', 'Chill'),
        semi_competitive: t('guilds.tags.semi_competitive', 'Semi Competitive'),
        competitive_all: t('guilds.tags.competitive_all', 'Competitive (All)'),
        competitive_gw: t('guilds.tags.competitive_gw', 'Competitive (GW)'),
        competitive_rta: t('guilds.tags.competitive_rta', 'Competitive (RTA)'),
        whatsapp: t('guilds.tags.whatsapp', 'WhatsApp Group'),
        discord: t('guilds.tags.discord', 'Discord Server'),
        other_social: t('guilds.tags.other_social', 'Other Social'),
        beginner: t('guilds.tags.beginner', 'For Beginners'),
        help_improve: t('guilds.tags.help_improve', 'Help Improve'),
        active: t('guilds.tags.active', 'Be Active'),
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const addImageUrl = () => {
        if (newImageUrl && imageUrls.length < 5) {
            setImageUrls([...imageUrls, newImageUrl]);
            setNewImageUrl('');
        }
    };

    const removeImageUrl = (index: number) => {
        setImageUrls(imageUrls.filter((_, i) => i !== index));
    };

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
            formData.append('title', title);
            formData.append('description', description);
            formData.append('server', server);
            formData.append('language', language);
            formData.append('tags', JSON.stringify(selectedTags));

            // Add image URLs if any
            if (imageUrls.length > 0) {
                formData.append('image_urls', JSON.stringify(imageUrls));
            }

            // Add image files if any
            imageFiles.forEach((file, index) => {
                formData.append(`images[${index}]`, file);
            });

            const response = await fetch(`${API_URL}/guilds`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error?.message || t('guilds.createError', 'Error creating post'));
            }

            const result = await response.json();
            router.push(`/guilds/${result.data.slug}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('common.unknownError', 'Unknown error'));
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
                    <Link href="/guilds" className="text-e7-gold hover:text-e7-text-gold text-sm mb-2 inline-block">
                        ← {t('guilds.backToList', 'Back to Guild Posts')}
                    </Link>
                    <h1 className="text-3xl font-bold text-e7-gold">
                        {t('guilds.createPost', 'Create Guild Post')}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {t('guilds.createSubtitle', 'Recruit members for your guild')}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="bg-e7-panel border-e7-gold/20">
                        <CardHeader>
                            <CardTitle className="text-e7-gold">
                                {t('guilds.postDetails', 'Post Details')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('guilds.title', 'Title')} *
                                </label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={t('guilds.titlePlaceholder', 'e.g., Active Guild Looking for Members!')}
                                    className="bg-e7-void border-e7-gold/30 text-white"
                                    required
                                />
                            </div>

                            {/* Server & Language */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('guilds.server', 'Server')} *
                                    </label>
                                    <select
                                        value={server}
                                        onChange={(e) => setServer(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none"
                                        required
                                    >
                                        <option value="">{t('guilds.selectServer', 'Select server...')}</option>
                                        {SERVERS.map((s) => (
                                            <option key={s} value={s}>
                                                {SERVER_FLAGS[s]} {SERVER_LABELS[s]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('guilds.language', 'Language')} *
                                    </label>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none"
                                        required
                                    >
                                        <option value="">{t('guilds.selectLanguage', 'Select language...')}</option>
                                        {LANGUAGES.map((l) => (
                                            <option key={l} value={l}>
                                                {LANGUAGE_LABELS[l]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('guilds.tagsLabel', 'Tags')}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {TAGS.map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => toggleTag(tag)}
                                            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${selectedTags.includes(tag)
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-e7-void border border-e7-gold/30 text-gray-400 hover:border-purple-500'
                                                }`}
                                        >
                                            {TAG_LABELS[tag]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('guilds.description', 'Description')} *
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t('guilds.descriptionPlaceholder', 'Describe your guild, requirements, benefits...')}
                                    rows={6}
                                    className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none resize-none"
                                    required
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('guilds.images', 'Images (optional)')}
                                </label>

                                {/* File Upload */}
                                <div
                                    className="border-2 border-dashed border-e7-gold/30 rounded-lg p-4 text-center hover:border-e7-gold/50 transition-colors cursor-pointer mb-3"
                                    onClick={() => document.getElementById('guild-image-upload')?.click()}
                                >
                                    <input
                                        id="guild-image-upload"
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            setImageFiles(prev => [...prev, ...files].slice(0, 5));
                                        }}
                                    />
                                    <div className="text-gray-400">
                                        📷 {t('guilds.clickToUpload', 'Click to upload images')}
                                    </div>
                                </div>

                                {/* Or add via URL */}
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        value={newImageUrl}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                        placeholder={t('guilds.imageUrlPlaceholder', 'Or paste image URL...')}
                                        className="bg-e7-void border-e7-gold/30 text-white"
                                    />
                                    <Button
                                        type="button"
                                        onClick={addImageUrl}
                                        disabled={!newImageUrl || imageUrls.length >= 5}
                                        variant="outline"
                                        className="border-e7-gold/30"
                                    >
                                        {t('common.add', 'Add')}
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">
                                    {t('guilds.maxImages', 'Maximum 5 images total')}
                                </p>

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

                                {/* URL previews */}
                                {imageUrls.length > 0 && (
                                    <div className="grid grid-cols-5 gap-2">
                                        {imageUrls.map((url, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-e7-void border border-e7-gold/20">
                                                <Image
                                                    src={url}
                                                    alt={`Image ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImageUrl(index)}
                                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
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
                            <div className="flex gap-4 justify-end pt-4">
                                <Link href="/guilds">
                                    <Button type="button" variant="outline" className="border-e7-gold/30 text-gray-400">
                                        {t('common.cancel', 'Cancel')}
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !title || !description || !server || !language}
                                    className="bg-purple-600 text-white hover:bg-purple-700"
                                >
                                    {isSubmitting ? t('common.saving', 'Saving...') : t('guilds.publishPost', 'Publish Post')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}
