'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ImageCarousel } from '@/components/ui/image-carousel';
import { useTranslations } from '@/hooks/useTranslations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const SERVER_FLAGS: Record<string, string> = {
    global: '🌍',
    europe: '🇪🇺',
    asia: '🌏',
    japan: '🇯🇵',
    korea: '🇰🇷',
    china: '🇨🇳',
};

const TAG_LABELS: Record<string, string> = {
    casual: 'Casual',
    chill: 'Chill',
    semi_competitive: 'Semi Competitive',
    competitive_all: 'Competitive (All)',
    competitive_gw: 'Competitive (GW)',
    competitive_rta: 'Competitive (RTA)',
    whatsapp: 'WhatsApp Group',
    discord: 'Discord Server',
    other_social: 'Other Social',
    beginner: 'For Beginners',
    help_improve: 'Help Improve',
    active: 'Be Active',
    mystic_x3: 'x3 Mystic',
    mystic_x4: 'x4 Mystic',
    mystic_x5: 'x5 Mystic',
    guild_buffs_24_7: '24/7 Guild Buffs',
};

const LANGUAGE_NAMES: Record<string, string> = {
    en: 'English',
    es: 'Español',
    pt: 'Português',
    ko: '한국어',
    zh: '中文',
    ja: '日本語',
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
    contacts?: {
        discord?: string;
        whatsapp?: string;
        telegram?: string;
    };
}

interface CurrentUser {
    id: number;
    is_admin: boolean;
}

export default function GuildPostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { t } = useTranslations();
    const slug = params.slug as string;

    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

    // Fetch current user
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                const response = await fetch(`${API_URL}/user`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setCurrentUser({ id: data.id, is_admin: data.is_admin });
                }
            } catch {
                // Ignore
            }
        };
        fetchUser();
    }, []);

    const { data: post, isLoading, error } = useQuery<GuildPost>({
        queryKey: ['guild-post', slug],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/guilds/${slug}`);
            if (!response.ok) throw new Error('Post not found');
            const data = await response.json();
            return data.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Debes iniciar sesión para eliminar');
            }
            const response = await fetch(`${API_URL}/guilds/${slug}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || errorData.error?.message || `Error: ${response.status}`);
                } else {
                    throw new Error(`Error del servidor (${response.status}). Por favor intenta de nuevo.`);
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guilds'] });
            window.location.href = '/guilds';
        },
        onError: (error: Error) => {
            alert(`Error al eliminar: ${error.message}`);
        },
    });

    const handleDelete = () => {
        if (confirm(t('guilds.confirmDelete', 'Are you sure you want to delete this post?'))) {
            deleteMutation.mutate();
        }
    };

    const canModify = currentUser && post && (currentUser.id === post.user.id || currentUser.is_admin);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-e7-void flex items-center justify-center">
                <div className="text-slate-400">{t('common.loading', 'Loading...')}</div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-e7-void flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Post not found</h1>
                    <Link href="/guilds">
                        <Button className="btn-gold">Back to Guilds</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back link */}
                <Link href="/guilds" className="text-e7-gold hover:text-e7-text-gold text-sm mb-4 inline-flex items-center gap-2 group transition-colors">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> {t('guilds.backToList', 'Back to Guild Posts')}
                </Link>

                {/* Post Header */}
                <div className="glass-panel border-e7-gold/20 rounded-2xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-e7-panel/90 to-e7-dark/90 shadow-2xl">
                    {/* Images */}
                    <div className="p-6">
                        <ImageCarousel images={post.images || []} title={t('guilds.images', 'Images')} />
                    </div>

                    <div className="p-6">
                        {/* Server & Language */}
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <span className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-200 rounded-full text-sm border border-purple-500/30 backdrop-blur-sm shadow-lg font-semibold">
                                <span className="text-xl">{SERVER_FLAGS[post.server]}</span> {post.server.charAt(0).toUpperCase() + post.server.slice(1)}
                            </span>
                            <span className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 rounded-full text-sm border border-blue-500/30 backdrop-blur-sm shadow-lg font-semibold">
                                🌐 {LANGUAGE_NAMES[post.language] || post.language.toUpperCase()}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            {post.title}
                        </h1>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            {post.tags?.map((tag) => {
                                const isMysticTag = tag.startsWith('mystic_');
                                return (
                                    <span
                                        key={tag}
                                        className="group px-4 py-2 text-sm bg-gradient-to-r from-e7-gold/20 to-e7-text-gold/10 text-e7-text-gold rounded-xl flex items-center gap-2 border border-e7-gold/30 backdrop-blur-sm shadow-lg hover:shadow-e7-gold/20 hover:scale-105 hover:border-e7-gold/50 transition-all duration-300 font-semibold"
                                    >
                                        {isMysticTag && (
                                            <Image src="/images/mystic.png" alt="mystic" width={18} height={18} className="drop-shadow-lg" unoptimized />
                                        )}
                                        {t(`guilds.tags.${tag}`, TAG_LABELS[tag] || tag.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))}
                                    </span>
                                );
                            })}
                        </div>

                        {/* Description */}
                        <div className="p-5 bg-gradient-to-br from-e7-void/50 to-e7-panel/30 rounded-xl border border-e7-gold/10 backdrop-blur-sm mb-6">
                            <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-e7-text-gold to-e7-gold font-bold text-lg mb-3">Description</h3>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{post.description}</p>
                            </div>
                        </div>

                        {/* Contact Links */}
                        {post.contacts && (post.contacts.discord || post.contacts.whatsapp || post.contacts.telegram) && (
                            <div className="p-5 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 rounded-xl border border-indigo-500/20 backdrop-blur-sm mb-6">
                                <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-bold text-lg mb-4">
                                    {t('guilds.contactLinks', 'Contact Links')}
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {post.contacts.discord && (
                                        <a
                                            href={post.contacts.discord.startsWith('http') ? post.contacts.discord : `https://${post.contacts.discord}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600/30 text-indigo-300 rounded-lg border border-indigo-500/40 hover:bg-indigo-600/50 hover:scale-105 transition-all"
                                        >
                                            <span className="font-semibold">Discord</span>
                                            <span className="text-sm text-indigo-400">→</span>
                                        </a>
                                    )}
                                    {post.contacts.whatsapp && (
                                        <a
                                            href={`https://wa.me/${post.contacts.whatsapp.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600/30 text-green-300 rounded-lg border border-green-500/40 hover:bg-green-600/50 hover:scale-105 transition-all"
                                        >
                                            <span className="font-semibold">WhatsApp</span>
                                            <span className="text-sm text-green-400">→</span>
                                        </a>
                                    )}
                                    {post.contacts.telegram && (
                                        <a
                                            href={post.contacts.telegram.startsWith('http') ? post.contacts.telegram : `https://${post.contacts.telegram}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-cyan-600/30 text-cyan-300 rounded-lg border border-cyan-500/40 hover:bg-cyan-600/50 hover:scale-105 transition-all"
                                        >
                                            <span className="font-semibold">Telegram</span>
                                            <span className="text-sm text-cyan-400">→</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Author & Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-e7-gold/20">
                            <div className="flex items-center gap-3">
                                {post.user.avatar && (
                                    <Image
                                        src={post.user.avatar}
                                        alt={post.user.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                        unoptimized
                                    />
                                )}
                                <div>
                                    <p className="text-white font-medium">{post.user.name}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {canModify && (
                                <div className="flex gap-2">
                                    <Link href={`/guilds/${post.slug}/edit`}>
                                        <Button variant="outline" className="border-e7-gold/30 text-e7-gold">
                                            {t('common.edit', 'Edit')}
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                                        onClick={handleDelete}
                                        disabled={deleteMutation.isPending}
                                    >
                                        {t('common.delete', 'Delete')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
