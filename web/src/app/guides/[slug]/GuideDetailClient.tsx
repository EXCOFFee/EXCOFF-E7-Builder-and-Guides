'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ImageGallery } from '@/components/ui/image-gallery';
import { guideApi } from '@/lib/api';
import { useTranslations } from '@/hooks/useTranslations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Convert YouTube watch URLs to embed URLs
const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    // Already an embed URL
    if (url.includes('youtube.com/embed/')) {
        return url;
    }

    // Handle youtube.com/watch?v=VIDEO_ID format
    const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) {
        return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }

    // Handle youtu.be/VIDEO_ID format
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortMatch) {
        return `https://www.youtube.com/embed/${shortMatch[1]}`;
    }

    // Handle youtube.com/v/VIDEO_ID format
    const vMatch = url.match(/youtube\.com\/v\/([a-zA-Z0-9_-]+)/);
    if (vMatch) {
        return `https://www.youtube.com/embed/${vMatch[1]}`;
    }

    return url;
};

interface Guide {
    id: number;
    slug: string;
    title: string;
    description: string;
    gameplay_content: string;
    category: string;
    video_url: string | null;
    images: string[];
    likes: number;
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
    } | null;
    created_at: string;
    recommended_heroes_list?: {
        id: number;
        name: string;
        slug: string;
        image_url?: string;
        portrait?: string;
    }[];
    recommended_artifacts_list?: {
        id: number;
        name: string;
        code: string;
        icon?: string;
    }[];
}

interface Comment {
    id: number;
    content: string;
    is_anonymous?: boolean;
    user: {
        id: number;
        name: string;
        avatar: string | null;
    } | null;
    created_at: string;
}

interface CurrentUser {
    id: number;
    is_admin: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
    general: 'General',
    pve: 'PVE',
    rta: 'RTA',
    guild_war: 'Guild War',
    arena: 'Arena',
};

export function GuideDetailClient() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { t } = useTranslations();
    const slug = params.slug as string;

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

    // Fetch guide
    const { data: guide, isLoading, error } = useQuery<Guide>({
        queryKey: ['guide', slug],
        queryFn: async () => {
            const response = await guideApi.get(slug);
            // API returns guide directly or wrapped in data
            return response.data.data || response.data;
        },
    });

    // Fetch comments
    const { data: commentsData } = useQuery({
        queryKey: ['guide-comments', slug],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/guides/${guide?.id}/comments`);
            if (!response.ok) return [];
            return response.json();
        },
        enabled: !!guide?.id,
    });
    const comments: Comment[] = Array.isArray(commentsData) ? commentsData : (commentsData?.data || []);

    // Like mutation
    const likeMutation = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/guides/${guide?.id}/vote`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            return response.json();
        },
        onSuccess: (data) => {
            setHasLiked(data.liked);
            queryClient.invalidateQueries({ queryKey: ['guide', slug] });
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
                    type: 'guide',
                    id: guide?.id,
                    content,
                    is_anonymous: isAnonymous,
                }),
            });
            return response.json();
        },
        onSuccess: () => {
            setNewComment('');
            setIsAnonymous(false);
            queryClient.invalidateQueries({ queryKey: ['guide-comments', slug] });
        },
    });

    // Delete guide mutation
    const deleteMutation = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Debes iniciar sesión para eliminar');
            }
            const response = await fetch(`${API_URL}/guides/${slug}`, {
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
                    throw new Error(errorData.message || errorData.error || `Error: ${response.status}`);
                } else {
                    throw new Error(`Error del servidor (${response.status}). Por favor intenta de nuevo.`);
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guides'] });
            window.location.href = '/guides';
        },
        onError: (error: Error) => {
            alert(`Error al eliminar: ${error.message}`);
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
            if (!response.ok) throw new Error('Failed to delete');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guide-comments', slug] });
        },
    });

    const handleDelete = () => {
        if (confirm(t('guides.confirmDelete', 'Are you sure you want to delete this guide?'))) {
            deleteMutation.mutate();
        }
    };

    const handleDeleteComment = (commentId: number) => {
        if (confirm(t('guides.confirmDeleteComment', 'Delete this comment?'))) {
            deleteCommentMutation.mutate(commentId);
        }
    };

    const canDeleteComment = (comment: Comment) => {
        if (!currentUser) return false;
        return currentUser.is_admin || comment.user?.id === currentUser.id;
    };

    const canModify = currentUser && guide && (currentUser.id === guide.user?.id || currentUser.is_admin);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-e7-void flex items-center justify-center">
                <div className="text-slate-400">{t('common.loading', 'Loading...')}</div>
            </div>
        );
    }

    if (error || !guide) {
        return (
            <div className="min-h-screen bg-e7-void flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Guide not found</h1>
                    <Link href="/guides">
                        <Button className="btn-gold">Back to Guides</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back link */}
                <Link href="/guides" className="text-e7-gold hover:text-e7-text-gold text-sm mb-4 inline-flex items-center gap-2 group transition-colors">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> {t('guides.backToGuides', 'Back to Guides')}
                </Link>

                {/* Guide Header */}
                <div className="glass-panel border-e7-gold/20 rounded-2xl overflow-hidden mb-6 backdrop-blur-xl bg-gradient-to-br from-e7-panel/90 to-e7-dark/90 shadow-2xl">
                    {/* Hero Image */}
                    {guide.hero && (
                        <div className="flex items-center gap-6 p-6 border-b border-e7-gold/20 bg-gradient-to-r from-transparent via-e7-gold/5 to-transparent">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-e7-gold/20 to-e7-purple/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                                <Image
                                    src={guide.hero.portrait}
                                    alt={guide.hero.name}
                                    width={80}
                                    height={80}
                                    className="rounded-xl ring-2 ring-e7-gold/50 relative z-10 shadow-xl transform group-hover:scale-105 transition-transform duration-300"
                                    unoptimized
                                />
                            </div>
                            <div>
                                <p className="font-display text-sm text-gray-400 mb-1">{t('guides.relatedHero', 'Related Hero')}</p>
                                <Link href={`/heroes/${guide.hero.slug}`} className="text-transparent bg-clip-text bg-gradient-to-r from-e7-text-gold to-e7-gold hover:from-e7-gold hover:to-e7-text-gold font-bold text-xl transition-all duration-300">
                                    {guide.hero.name}
                                </Link>
                            </div>
                        </div>
                    )}

                    <div className="p-6">
                        {/* Category Badge */}
                        <span className="px-4 py-2 text-sm bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-200 rounded-full border border-purple-500/30 backdrop-blur-sm shadow-lg inline-block font-semibold">
                            {CATEGORY_LABELS[guide.category] || guide.category}
                        </span>

                        {/* Title */}
                        <h1 className="font-display text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
                            {guide.title}
                        </h1>

                        {/* Description */}
                        <p className="text-gray-400 mb-6 leading-relaxed">{guide.description}</p>

                        {/* Author & Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-e7-gold/20">
                            <div className="flex items-center gap-3">
                                {guide.user?.avatar && (
                                    <Image
                                        src={guide.user.avatar}
                                        alt={guide.user?.name || 'User'}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                        unoptimized
                                    />
                                )}
                                <div>
                                    <p className="text-white font-medium">{guide.user?.name || t('common.anonymous', 'Anonymous')}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(guide.created_at).toLocaleDateString()}
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
                                    {guide.likes || 0}
                                </Button>

                                {/* Edit/Delete Buttons */}
                                {canModify && (
                                    <>
                                        <Link href={`/guides/${guide.slug}/edit`}>
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

                {/* Video Embed */}
                {guide.video_url && getYouTubeEmbedUrl(guide.video_url) && (
                    <div className="glass-panel border-e7-gold/20 rounded-xl overflow-hidden mb-6 p-6">
                        <h2 className="text-xl font-bold text-e7-gold mb-4">Video</h2>
                        <div className="aspect-video">
                            <iframe
                                src={getYouTubeEmbedUrl(guide.video_url)!}
                                className="w-full h-full rounded"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                )}

                {/* Images */}
                {guide.images && Array.isArray(guide.images) && guide.images.length > 0 && (
                    <div className="glass-panel border-e7-gold/20 rounded-xl overflow-hidden mb-6 p-6">
                        <ImageGallery
                            images={guide.images.filter(img => typeof img === 'string' && img && (img.startsWith('http') || img.startsWith('data:image')))}
                            title={t('guides.images', 'Images')}
                        />
                    </div>
                )}

                {/* Content */}
                <div className="glass-panel border-e7-gold/20 rounded-2xl overflow-hidden mb-6 p-6 backdrop-blur-sm bg-gradient-to-br from-e7-panel/80 to-e7-void/80 shadow-lg">
                    <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-e7-text-gold to-e7-gold font-bold text-xl mb-4">Guide Content</h2>
                    <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">{guide.gameplay_content}</div>
                    </div>
                </div>

                {/* Recommended Heroes */}
                {guide.recommended_heroes_list && guide.recommended_heroes_list.length > 0 && (
                    <div className="glass-panel border-e7-gold/20 rounded-xl overflow-hidden mb-6 p-6">
                        <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-400 font-bold text-xl mb-4">
                            {t('guides.recommendedHeroes', 'Recommended Heroes')}
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            {guide.recommended_heroes_list.map(hero => (
                                <Link
                                    key={hero.id}
                                    href={`/heroes/${hero.slug}`}
                                    className="group flex items-center gap-4 bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-2 border-purple-500/40 rounded-xl px-5 py-4 hover:border-purple-400/60 hover:bg-gradient-to-br hover:from-purple-900/50 hover:to-purple-800/30 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-purple-600/10 rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
                                        <Image
                                            src={hero.image_url || hero.portrait || `/images/hero/${hero.slug}_s.png`}
                                            alt={hero.name}
                                            width={64}
                                            height={64}
                                            className="rounded-full ring-2 ring-purple-500/60 relative z-10 shadow-lg group-hover:scale-110 transition-transform duration-300"
                                            unoptimized
                                        />
                                    </div>
                                    <span className="text-purple-200 font-semibold text-lg group-hover:text-purple-100 transition-colors duration-300">{hero.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommended Artifacts */}
                {guide.recommended_artifacts_list && guide.recommended_artifacts_list.length > 0 && (
                    <div className="glass-panel border-e7-gold/20 rounded-xl overflow-hidden mb-6 p-6">
                        <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-400 font-bold text-xl mb-4">
                            {t('guides.recommendedArtifacts', 'Recommended Artifacts')}
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            {guide.recommended_artifacts_list.map(artifact => (
                                <Link
                                    key={artifact.id}
                                    href={`/artifacts`}
                                    className="group flex items-center gap-4 bg-gradient-to-br from-amber-900/40 to-amber-800/20 border-2 border-amber-500/40 rounded-xl px-5 py-4 hover:border-amber-400/60 hover:bg-gradient-to-br hover:from-amber-900/50 hover:to-amber-800/30 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-amber-500/20 hover:-translate-y-1"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-amber-600/10 rounded-lg blur-md group-hover:blur-lg transition-all duration-300"></div>
                                        <Image
                                            src={artifact.icon || `/images/artifacts/${artifact.code}.png`}
                                            alt={artifact.name}
                                            width={64}
                                            height={64}
                                            className="rounded-lg ring-2 ring-amber-500/60 relative z-10 shadow-lg group-hover:scale-110 transition-transform duration-300"
                                            unoptimized
                                        />
                                    </div>
                                    <span className="text-amber-200 font-semibold text-lg group-hover:text-amber-100 transition-colors duration-300">{artifact.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

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
                                            <span className="text-white font-medium text-sm">
                                                {comment.is_anonymous ? t('common.anonymous', 'Anonymous') : comment.user?.name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </span>
                                                {canDeleteComment(comment) && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="text-red-400 hover:text-red-300 text-xs"
                                                    >
                                                        {t('common.delete', 'Delete')}
                                                    </button>
                                                )}
                                            </div>
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
