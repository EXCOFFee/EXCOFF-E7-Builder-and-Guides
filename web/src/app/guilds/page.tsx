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
    { id: 'casual', emoji: '・' },
    { id: 'chill', emoji: '原' },
    { id: 'semi_competitive', emoji: '笞費ｸ・ },
    { id: 'competitive_all', emoji: '醇' },
    { id: 'competitive_gw', emoji: '床' },
    { id: 'competitive_rta', emoji: '式' },
    { id: 'whatsapp', emoji: '導' },
    { id: 'discord', emoji: '町' },
    { id: 'other_social', emoji: '倹' },
    { id: 'beginner', emoji: '験' },
    { id: 'help_improve', emoji: '嶋' },
    { id: 'active', emoji: '櫨' },
];

const LANGUAGE_NAMES: Record<string, string> = {
    en: 'English',
    es: 'Espaﾃｱol',
    ko: '﨑懋ｵｭ・ｴ',
    ja: '譌･譛ｬ隱・,
    zh: '荳ｭ譁・,
    pt: 'Portuguﾃｪs',
};

const LANGUAGE_FLAGS: Record<string, string> = {
    en: '・・',
    es: '・・',
    ko: '・・',
    ja: '・・',
    zh: '・・',
    pt: '・・',
};

const SERVER_FLAGS: Record<string, string> = {
    global: '訣',
    europe: '・・',
    asia: '件',
    japan: '・・',
    korea: '・・',
    china: '・・',
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
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-semibold text-e7-gold tracking-tight mb-2">
                            {t('guilds.title', 'Guild Recruitment')}
                        </h1>
                        <p className="text-neutral-500">
                            {t('guilds.subtitle', 'Find your perfect guild or recruit new members')}
                        </p>
                    </div>
                    <Link href="/guilds/create">
                        <Button className="btn-gold px-4 py-2 rounded-md">
                            + {t('guilds.createPost', 'Create Post')}
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 mb-6 bg-e7-panel p-4 rounded-lg border border-white/6">
                    <Input
                        placeholder={t('guilds.searchPlaceholder', 'Search guilds...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-md bg-white/4 border-white/8 text-neutral-200 placeholder:text-neutral-500 focus:border-e7-gold"
                    />
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={selectedServer === null ? 'default' : 'outline'}
                            onClick={() => setSelectedServer(null)}
                            className={selectedServer === null ? 'bg-e7-gold text-e7-void' : 'border-white/10 text-neutral-400 hover:bg-white/6'}
                            size="sm"
                        >
                            {t('common.all', 'All')}
                        </Button>
                        {SERVERS.map((server) => (
                            <Button
                                key={server}
                                variant={selectedServer === server ? 'default' : 'outline'}
                                onClick={() => setSelectedServer(server)}
                                className={selectedServer === server ? 'bg-e7-gold text-e7-void' : 'border-white/10 text-neutral-400 hover:bg-white/6'}
                                size="sm"
                            >
                                {SERVER_FLAGS[server]} {t(`guilds.servers.${server}`, server.charAt(0).toUpperCase() + server.slice(1))}
                            </Button>
                        ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={selectedLanguage === null ? 'default' : 'outline'}
                            onClick={() => setSelectedLanguage(null)}
                            className={selectedLanguage === null ? 'bg-e7-purple text-white' : 'border-white/10 text-neutral-400 hover:bg-white/6'}
                            size="sm"
                        >
                            {t('guilds.allLanguages', 'All Languages')}
                        </Button>
                        {LANGUAGES.map((lang) => (
                            <Button
                                key={lang}
                                variant={selectedLanguage === lang ? 'default' : 'outline'}
                                onClick={() => setSelectedLanguage(lang)}
                                className={selectedLanguage === lang ? 'bg-e7-purple text-white' : 'border-white/10 text-neutral-400 hover:bg-white/6'}
                                size="sm"
                            >
                                {LANGUAGE_FLAGS[lang]} {LANGUAGE_NAMES[lang]}
                            </Button>
                        ))}
                    </div>
                    <div className="flex gap-2 flex-wrap items-center">
                        <span className="text-neutral-500 text-sm">{t('guilds.filterByTags', 'Tags')}:</span>
                        {TAGS.map((tag) => (
                            <Button
                                key={tag.id}
                                variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                                onClick={() => toggleTag(tag.id)}
                                className={selectedTags.includes(tag.id) ? 'bg-green-600 text-white' : 'border-white/10 text-neutral-400 hover:bg-white/6'}
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
                                <div className="bg-e7-panel rounded-lg overflow-hidden border border-white/6 hover:border-e7-gold/30 transition-colors h-full group">
                                    {post.images?.[0] && (
                                        <div className="aspect-video relative overflow-hidden">
                                            <Image
                                                src={post.images[0]}
                                                alt={post.title}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg">{SERVER_FLAGS[post.server]}</span>
                                            <span className="text-xs text-slate-400 uppercase">{post.server}</span>
                                            <span className="text-xs text-slate-600">窶｢</span>
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
                                                    className="px-2 py-0.5 text-xs bg-purple-500/10 text-purple-300 rounded-md"
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
                                                    className="rounded-full"
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
