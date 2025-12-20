'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ImageGallery } from '@/components/ui/image-gallery';
import { useTranslations } from '@/hooks/useTranslations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

import { SET_IMAGES } from '@/lib/sets';

const ELEMENT_COLORS: Record<string, string> = {
    fire: 'bg-red-500',
    ice: 'bg-blue-500',
    earth: 'bg-green-500',
    light: 'bg-yellow-400',
    dark: 'bg-purple-600',
};

interface Build {
    id: number;
    title: string;
    description: string;
    min_stats: Record<string, number>;
    primary_set: string;
    secondary_set: string;
    likes: number;
    views: number;
    is_anonymous: boolean;
    synergy_heroes: number[];
    counter_heroes: number[];
    images: string[];
    user: {
        id: number;
        name: string;
        avatar: string | null;
    } | null;
    hero: {
        id: number;
        name: string;
        slug: string;
        portrait: string;
        element: string;
        class: string;
    };
    artifact: {
        id: number;
        name: string;
        icon: string;
    } | null;
    created_at: string;
}

interface Comment {
    id: number;
    content: string;
    is_anonymous: boolean;
    user: {
        id: number;
        name: string;
        avatar: string | null;
    } | null;
    created_at: string;
    replies: Comment[];
}

interface CurrentUser {
    id: number;
    is_admin: boolean;
}

export default function BuildDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { t } = useTranslations();
    const buildId = params.id as string;

    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [newComment, setNewComment] = useState('');
    const [hasLiked, setHasLiked] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);

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

    // Fetch build
    const { data: build, isLoading, error } = useQuery<Build>({
        queryKey: ['build', buildId],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/builds/${buildId}`);
            if (!response.ok) throw new Error('Build not found');
            return response.json();
        },
    });

    // Check if user liked this build
    useEffect(() => {
        const checkLike = async () => {
            if (!currentUser) return;
            try {
                const response = await fetch(`${API_URL}/builds/${buildId}/like-status`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setHasLiked(data.liked);
                }
            } catch {
                // Ignore
            }
        };
        checkLike();
    }, [currentUser, buildId]);

    // Fetch comments
    const { data: commentsData } = useQuery({
        queryKey: ['build-comments', buildId],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/builds/${buildId}/comments`);
            if (!response.ok) return [];
            return response.json();
        },
        enabled: !!build,
    });

    const comments: Comment[] = commentsData || [];

    // Like mutation
    const likeMutation = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/builds/${buildId}/vote`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            return response.json();
        },
        onSuccess: (data) => {
            setHasLiked(data.liked);
            queryClient.invalidateQueries({ queryKey: ['build', buildId] });
        },
    });

    // Comment mutation
    const commentMutation = useMutation({
        mutationFn: async (content: string) => {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type: 'build',
                    id: build?.id,
                    content,
                    is_anonymous: isAnonymous,
                }),
            });
            return response.json();
        },
        onSuccess: () => {
            setNewComment('');
            setIsAnonymous(false);
            queryClient.invalidateQueries({ queryKey: ['build-comments', buildId] });
        },
    });

    // Delete comment mutation
    const deleteCommentMutation = useMutation({
        mutationFn: async (commentId: number) => {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete comment');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['build-comments', buildId] });
        },
    });

    // Delete build mutation
    const deleteMutation = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Debes iniciar sesión para eliminar');
            }
            const response = await fetch(`${API_URL}/builds/${buildId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
            if (!response.ok) {
                // Check if response is JSON before parsing
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || errorData.error || `Error: ${response.status}`);
                } else {
                    throw new Error(`Error del servidor (${response.status}). Por favor intenta de nuevo.`);
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['builds'] });
            // Use window.location for full page refresh
            window.location.href = '/builds';
        },
        onError: (error: Error) => {
            alert(`Error al eliminar: ${error.message}`);
        },
    });

    const handleDelete = () => {
        if (confirm(t('builds.confirmDelete', 'Are you sure you want to delete this build?'))) {
            deleteMutation.mutate();
        }
    };

    const canModify = currentUser && build && build.user && (currentUser.id === build.user.id || currentUser.is_admin);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-void-glow flex items-center justify-center">
                <div className="text-slate-400">{t('common.loading', 'Loading...')}</div>
            </div>
        );
    }

    if (error || !build) {
        return (
            <div className="min-h-screen bg-void-glow flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Build not found</h1>
                    <Link href="/builds">
                        <Button className="btn-gold">Back to Builds</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-void-glow py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back link */}
                <Link href="/builds" className="text-e7-gold hover:text-e7-text-gold text-sm mb-4 inline-flex items-center gap-2 group transition-colors">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> {t('builds.backToBuilds', 'Back to Builds')}
                </Link>

                {/* Build Header */}
                <div className="glass-panel border-e7-gold/20 rounded-xl overflow-hidden mb-6">
                    {/* Hero Section */}
                    <div className="flex items-center gap-6 p-6 border-b border-e7-gold/20">
                        <div className="relative">
                            <Image
                                src={build.hero.portrait}
                                alt={build.hero.name}
                                width={150}
                                height={150}
                                className="rounded-xl ring-2 ring-e7-gold/30"
                                unoptimized
                            />
                            <span className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full ring-2 ring-e7-dark ${ELEMENT_COLORS[build.hero.element]}`} />
                        </div>
                        <div>
                            <Link href={`/heroes/${build.hero.slug}`} className="text-e7-gold hover:text-e7-text-gold font-bold text-3xl">
                                {build.hero.name}
                            </Link>
                            <p className="text-xl text-gray-400 capitalize">{build.hero.class.replace('_', ' ')}</p>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Title */}
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            {build.title}
                        </h1>

                        {/* Sets */}
                        <div className="flex gap-3 mb-4">
                            {build.primary_set && (
                                <span className="px-3 py-1 text-sm bg-purple-500/20 text-purple-300 rounded-full flex items-center gap-2">
                                    {SET_IMAGES[build.primary_set] && (
                                        <Image
                                            src={SET_IMAGES[build.primary_set]}
                                            alt={build.primary_set}
                                            width={20}
                                            height={20}
                                            unoptimized
                                        />
                                    )}
                                    {build.primary_set}
                                </span>
                            )}
                            {build.secondary_set && (
                                <span className="px-3 py-1 text-sm bg-blue-500/20 text-blue-300 rounded-full flex items-center gap-2">
                                    {SET_IMAGES[build.secondary_set] && (
                                        <Image
                                            src={SET_IMAGES[build.secondary_set]}
                                            alt={build.secondary_set}
                                            width={20}
                                            height={20}
                                            unoptimized
                                        />
                                    )}
                                    {build.secondary_set}
                                </span>
                            )}
                        </div>

                        {/* Artifact */}
                        {build.artifact && (
                            <div className="flex items-center gap-3 mb-4 p-3 bg-e7-void/50 rounded-lg">
                                <Image
                                    src={build.artifact.icon}
                                    alt={build.artifact.name}
                                    width={40}
                                    height={40}
                                    className="rounded"
                                    unoptimized
                                />
                                <span className="text-white">{build.artifact.name}</span>
                            </div>
                        )}

                        {/* Min Stats */}
                        {build.min_stats && Object.keys(build.min_stats).length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-e7-gold font-semibold mb-3">{t('builds.minStats', 'Min Stats')}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {Object.entries(build.min_stats).map(([stat, value]) => (
                                        <div key={stat} className="bg-e7-void/50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-400 uppercase">{stat}</p>
                                            <p className="text-lg font-bold text-white">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {build.description && (
                            <div className="mb-6">
                                <h3 className="text-e7-gold font-semibold mb-2">{t('builds.description', 'Description')}</h3>
                                <p className="text-gray-300 whitespace-pre-wrap">{build.description}</p>
                            </div>
                        )}

                        {/* Images */}
                        <ImageGallery images={build.images || []} title={t('builds.images', 'Images')} />

                        {/* Author & Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-e7-gold/20">
                            <div className="flex items-center gap-3">
                                {!build.is_anonymous && build.user?.avatar && (
                                    <Image
                                        src={build.user.avatar}
                                        alt={build.user.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                        unoptimized
                                    />
                                )}
                                <div>
                                    <p className="text-white font-medium">
                                        {build.is_anonymous ? 'Anonymous' : build.user?.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(build.created_at).toLocaleDateString()} • 👁️ {build.views}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {/* Like Button */}
                                <Button
                                    variant="outline"
                                    className={`border-e7-gold/30 flex items-center gap-2 ${hasLiked ? 'text-red-400 border-red-400/50' : 'text-e7-gold'}`}
                                    onClick={() => likeMutation.mutate()}
                                    disabled={likeMutation.isPending || !currentUser}
                                >
                                    <Image src="/images/ras-like.gif" alt="like" width={24} height={24} className="inline-block" unoptimized />
                                    {build.likes}
                                </Button>

                                {/* Edit/Delete Buttons */}
                                {canModify && (
                                    <>
                                        <Link href={`/builds/${build.id}/edit`}>
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
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments */}
                <div className="glass-panel border-e7-gold/20 rounded-xl overflow-hidden p-6">
                    <h2 className="text-xl font-bold text-e7-gold mb-4">
                        💬 {t('guides.comments', 'Comments')} ({comments.length})
                    </h2>

                    {/* Comment Form */}
                    {currentUser ? (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (newComment.trim()) {
                                    commentMutation.mutate(newComment);
                                }
                            }}
                            className="mb-6"
                        >
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={t('guides.writeComment', 'Write a comment...')}
                                className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none resize-none"
                                rows={3}
                            />
                            <div className="flex items-center justify-between mt-2">
                                <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isAnonymous}
                                        onChange={(e) => setIsAnonymous(e.target.checked)}
                                        className="w-4 h-4 rounded border-e7-gold/30 bg-e7-void accent-e7-gold"
                                    />
                                    {t('common.anonymous', 'Post anonymously')}
                                </label>
                                <Button
                                    type="submit"
                                    className="bg-e7-gold text-black hover:bg-e7-text-gold"
                                    disabled={commentMutation.isPending}
                                >
                                    {t('guides.postComment', 'Post Comment')}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <p className="text-gray-400 mb-6">{t('guides.loginToComment', 'Login to comment')}</p>
                    )}

                    {/* Comments List */}
                    <div className="space-y-4">
                        {comments.length === 0 ? (
                            <p className="text-gray-500">{t('guides.noComments', 'No comments yet.')}</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 p-4 bg-e7-void/50 rounded-lg">
                                    {!comment.is_anonymous && comment.user?.avatar && (
                                        <Image
                                            src={comment.user.avatar}
                                            alt={comment.user?.name || ''}
                                            width={36}
                                            height={36}
                                            className="rounded-full"
                                            unoptimized
                                        />
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium text-sm">
                                                    {comment.is_anonymous ? 'Anonymous' : comment.user?.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {currentUser && (currentUser.is_admin || comment.user?.id === currentUser.id) && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm(t('common.confirmDelete', 'Are you sure you want to delete this?'))) {
                                                            deleteCommentMutation.mutate(comment.id);
                                                        }
                                                    }}
                                                    className="text-red-400 hover:text-red-300 text-xs"
                                                    disabled={deleteCommentMutation.isPending}
                                                >
                                                    {t('common.delete', 'Delete')}
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-gray-300 text-sm">{comment.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
