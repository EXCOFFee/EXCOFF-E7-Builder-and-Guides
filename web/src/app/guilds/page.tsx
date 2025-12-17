'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/hooks/useTranslations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const SERVERS = ['global', 'europe', 'asia', 'japan', 'korea', 'china'];

const LANGUAGES = ['en', 'es', 'ko', 'ja', 'zh', 'pt'];

const TAGS = [
    { id: 'casual', emoji: '😎' },
    { id: 'chill', emoji: '🌴' },
    { id: 'semi_competitive', emoji: '⚔️' },
    { id: 'competitive_all', emoji: '🏆' },
    { id: 'competitive_gw', emoji: '🏰' },
    { id: 'competitive_rta', emoji: '🎮' },
    { id: 'whatsapp', emoji: '📱' },
    { id: 'discord', emoji: '💬' },
    { id: 'other_social', emoji: '🌐' },
    { id: 'beginner', emoji: '🌱' },
    { id: 'help_improve', emoji: '📈' },
    { id: 'active', emoji: '🔥' },
];

const LANGUAGE_NAMES: Record<string, string> = {
    en: 'English',
    es: 'Español',
    ko: '한국어',
    ja: '日本語',
    zh: '中文',
    pt: 'Português',
};

const LANGUAGE_FLAGS: Record<string, string> = {
    en: '🇺🇸',
    es: '🇪🇸',
    ko: '🇰🇷',
    ja: '🇯🇵',
    zh: '🇨🇳',
    pt: '🇧🇷',
};

const SERVER_FLAGS: Record<string, string> = {
    global: '🌍',
    europe: '🇪🇺',
    asia: '🌏',
    japan: '🇯🇵',
    korea: '🇰🇷',
    china: '🇨🇳',
};

interface GuildPost {
    id: number;
    slug: string;
    title: string;
    description: string;
    server: string;
    language: string;
    tags: string[];
    images: string[];
    user: {
        id: number;
        name: string;
        avatar: string | null;
    };
    created_at: string;
}

export default function GuildsPage() {
    const { t } = useTranslations();
    const [search, setSearch] = useState('');
    const [selectedServer, setSelectedServer] = useState<string | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const { data, isLoading } = useQuery({
        queryKey: ['guilds', search, selectedServer, selectedLanguage, selectedTags],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (selectedServer) params.append('server', selectedServer);
            if (selectedLanguage) params.append('language', selectedLanguage);
            if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));

            const response = await fetch(`${API_URL}/guilds?${params}`);
            if (!response.ok) throw new Error('Failed to fetch guilds');
            return response.json();
        },
    });

    const toggleTag = (tagId: string) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(t => t !== tagId)
                : [...prev, tagId]
        );
    };

    const posts: GuildPost[] = data?.data || [];

    return (
        <div className="min-h-screen bg-void-glow py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div className="text-center md:text-left">
                        <h1 className="font-display text-4xl md:text-5xl text-gold-gradient tracking-wide mb-2">
                            {t('guilds.title', 'Guild Recruitment')}
                        </h1>
                        <p className="text-slate-400">
                            {t('guilds.subtitle', 'Find your perfect guild or recruit new members')}
                        </p>
                    </div>
                    <Link href="/guilds/create">
                        <Button className="btn-gold px-6 py-2.5 rounded-lg shadow-lg shadow-e7-gold/20 hover:shadow-e7-gold/40 transition-all">
                            + {t('guilds.createPost', 'Create Post')}
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 mb-6 glass-panel p-4 rounded-xl">
                    <Input
                        placeholder={t('guilds.searchPlaceholder', 'Search guilds...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-md bg-e7-void/50 border-e7-gold/20 text-slate-200 placeholder:text-slate-500 focus:border-e7-gold focus:ring-e7-gold/30 transition-all"
                    />
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={selectedServer === null ? 'default' : 'outline'}
                            onClick={() => setSelectedServer(null)}
                            className={selectedServer === null ? 'bg-e7-gold text-e7-void font-semibold' : 'border-e7-gold/30 text-slate-400 hover:text-e7-gold hover:border-e7-gold/50'}
                        >
                            {t('common.all', 'All')}
                        </Button>
                        {SERVERS.map((server) => (
                            <Button
                                key={server}
                                variant={selectedServer === server ? 'default' : 'outline'}
                                onClick={() => setSelectedServer(server)}
                                className={selectedServer === server ? 'bg-e7-gold text-e7-void font-semibold' : 'border-e7-gold/30 text-slate-400 hover:text-e7-gold hover:border-e7-gold/50'}
                            >
                                {SERVER_FLAGS[server]} {t(`guilds.servers.${server}`, server.charAt(0).toUpperCase() + server.slice(1))}
                            </Button>
                        ))}
                    </div>
                    {/* Language Filter */}
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={selectedLanguage === null ? 'default' : 'outline'}
                            onClick={() => setSelectedLanguage(null)}
                            className={selectedLanguage === null ? 'bg-e7-purple text-white font-semibold' : 'border-e7-gold/30 text-slate-400 hover:text-e7-gold hover:border-e7-gold/50'}
                            size="sm"
                        >
                            {t('guilds.allLanguages', 'All Languages')}
                        </Button>
                        {LANGUAGES.map((lang) => (
                            <Button
                                key={lang}
                                variant={selectedLanguage === lang ? 'default' : 'outline'}
                                onClick={() => setSelectedLanguage(lang)}
                                className={selectedLanguage === lang ? 'bg-e7-purple text-white font-semibold' : 'border-e7-gold/30 text-slate-400 hover:text-e7-gold hover:border-e7-gold/50'}
                                size="sm"
                            >
                                {LANGUAGE_FLAGS[lang]} {LANGUAGE_NAMES[lang]}
                            </Button>
                        ))}
                    </div>
                    {/* Tags Filter */}
                    <div className="flex gap-2 flex-wrap items-center">
                        <span className="text-slate-400 text-sm">{t('guilds.filterByTags', 'Tags')}:</span>
                        {TAGS.map((tag) => (
                            <Button
                                key={tag.id}
                                variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                                onClick={() => toggleTag(tag.id)}
                                className={selectedTags.includes(tag.id) ? 'bg-green-600 text-white' : 'border-e7-gold/30 text-slate-400 hover:text-e7-gold hover:border-e7-gold/50'}
                                size="sm"
                            >
                                {tag.emoji} {t(`guilds.tags.${tag.id}`, tag.id.replace('_', ' '))}
                            </Button>
                        ))}
                        {selectedTags.length > 0 && (
                            <Button
                                variant="ghost"
                                onClick={() => setSelectedTags([])}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                size="sm"
                            >
                                {t('common.clearFilters', 'Clear')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Posts Grid */}
                {isLoading ? (
                    <div className="text-center py-12 text-slate-400">
                        {t('common.loading', 'Loading...')}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        {t('guilds.noPosts', 'No guild posts found')}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <Link key={post.id} href={`/guilds/${post.slug}`}>
                                <div className="card-fantasy bg-gradient-to-b from-e7-panel to-e7-void rounded-xl overflow-hidden h-full group">
                                    {post.images?.[0] && (
                                        <div className="aspect-video relative overflow-hidden">
                                            <Image
                                                src={post.images[0]}
                                                alt={post.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                unoptimized
                                            />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg">{SERVER_FLAGS[post.server]}</span>
                                            <span className="text-xs text-slate-400 uppercase">{post.server}</span>
                                            <span className="text-xs text-slate-600">•</span>
                                            <span className="text-xs text-slate-400">{LANGUAGE_FLAGS[post.language]} {LANGUAGE_NAMES[post.language] || post.language}</span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-100 mb-2 line-clamp-2 group-hover:text-e7-gold transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                                            {post.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {post.tags?.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-1 text-xs glass-panel text-purple-300 rounded-lg border border-purple-500/30"
                                                >
                                                    {t(`guilds.tags.${tag}`, tag.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-3 border-t border-e7-gold/10">
                                            {post.user.avatar && (
                                                <Image
                                                    src={post.user.avatar}
                                                    alt={post.user.name}
                                                    width={20}
                                                    height={20}
                                                    className="rounded-full ring-1 ring-e7-gold/20"
                                                    unoptimized
                                                />
                                            )}
                                            <span>{post.user.name}</span>
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
