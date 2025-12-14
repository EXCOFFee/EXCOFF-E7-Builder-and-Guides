'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
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
            const response = await fetch(`${API_URL}/guilds/${slug}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guilds'] });
            router.push('/guilds');
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
                <div className="text-gray-400">{t('common.loading', 'Loading...')}</div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-e7-void flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Post not found</h1>
                    <Link href="/guilds">
                        <Button className="bg-e7-gold text-black">Back to Guilds</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back link */}
                <Link href="/guilds" className="text-e7-gold hover:text-e7-text-gold text-sm mb-4 inline-block">
                    ← {t('guilds.backToList', 'Back to Guild Posts')}
                </Link>

                {/* Post Header */}
                <div className="bg-e7-panel border border-e7-gold/20 rounded-lg overflow-hidden">
                    {/* Images */}
                    {post.images && post.images.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
                            {post.images.map((img, idx) => (
                                <div key={idx} className="aspect-video relative rounded overflow-hidden">
                                    <Image
                                        src={img}
                                        alt={`Image ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="p-6">
                        {/* Server & Language */}
                        <div className="flex items-center gap-4 mb-4">
                            <span className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                                {SERVER_FLAGS[post.server]} {post.server.charAt(0).toUpperCase() + post.server.slice(1)}
                            </span>
                            <span className="text-gray-400 text-sm">
                                {post.language.toUpperCase()}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            {post.title}
                        </h1>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {post.tags?.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 text-sm bg-e7-gold/10 text-e7-gold rounded-full"
                                >
                                    {TAG_LABELS[tag] || tag}
                                </span>
                            ))}
                        </div>

                        {/* Description */}
                        <div className="prose prose-invert max-w-none mb-6">
                            <p className="text-gray-300 whitespace-pre-wrap">{post.description}</p>
                        </div>

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
