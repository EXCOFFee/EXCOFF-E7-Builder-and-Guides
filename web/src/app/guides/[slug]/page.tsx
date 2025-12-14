'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { guideApi } from '@/lib/api';
import { useTranslations } from '@/hooks/useTranslations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Guide {
    id: number;
    slug: string;
    title: string;
    description: string;
    gameplay_content: string;
    category: string;
    video_url: string | null;
    images: string[];
    likes_count: number;
    user: {
        id: number;
        name: string;
        avatar: string | null;
    };
    hero: {
        id: number;
        name: string;
        slug: string;
        portrait: string;
    } | null;
    created_at: string;
}

interface Comment {
    id: number;
    content: string;
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

const CATEGORY_LABELS: Record<string, string> = {
    general: 'General',
    pve: 'PVE',
    rta: 'RTA',
    guild_war: 'Guild War',
    arena: 'Arena',
};

export default function GuideDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { t } = useTranslations();
    const slug = params.slug as string;

    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [newComment, setNewComment] = useState('');
    const [hasLiked, setHasLiked] = useState(false);

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
            return response.data.data;
        },
    });

    // Fetch comments
    const { data: commentsData } = useQuery({
        queryKey: ['guide-comments', slug],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/guides/${slug}/comments`);
            if (!response.ok) return { data: [] };
            return response.json();
        },
        enabled: !!guide,
    });

    const comments: Comment[] = commentsData?.data || [];

    // Like mutation
    const likeMutation = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/guides/${slug}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            return response.json();
        },
        onSuccess: () => {
            setHasLiked(true);
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
                    content,
                    commentable_type: 'guide',
                    commentable_id: guide?.id,
                }),
            });
            return response.json();
        },
        onSuccess: () => {
            setNewComment('');
            queryClient.invalidateQueries({ queryKey: ['guide-comments', slug] });
        },
    });

    // Delete guide mutation
    const deleteMutation = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/guides/${slug}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guides'] });
            router.push('/guides');
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

    const canModify = currentUser && guide && (currentUser.id === guide.user.id || currentUser.is_admin);
    const canDeleteComment = (comment: Comment) => currentUser && (currentUser.id === comment.user.id || currentUser.is_admin);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-e7-void flex items-center justify-center">
                <div className="text-gray-400">{t('common.loading', 'Loading...')}</div>
            </div>
        );
    }

    if (error || !guide) {
        return (
            <div className="min-h-screen bg-e7-void flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Guide not found</h1>
                    <Link href="/guides">
                        <Button className="bg-e7-gold text-black">Back to Guides</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back link */}
                <Link href="/guides" className="text-e7-gold hover:text-e7-text-gold text-sm mb-4 inline-block">
                    ← {t('guides.backToGuides', 'Back to Guides')}
                </Link>

                {/* Guide Header */}
                <div className="bg-e7-panel border border-e7-gold/20 rounded-lg overflow-hidden mb-6">
                    {/* Hero Image */}
                    {guide.hero && (
                        <div className="flex items-center gap-4 p-6 border-b border-e7-gold/20">
                            <Image
                                src={guide.hero.portrait}
                                alt={guide.hero.name}
                                width={80}
                                height={80}
                                className="rounded-lg"
                                unoptimized
                            />
                            <div>
                                <p className="text-sm text-gray-400">{t('guides.relatedHero', 'Related Hero')}</p>
                                <Link href={`/heroes/${guide.hero.slug}`} className="text-e7-gold hover:text-e7-text-gold font-bold">
                                    {guide.hero.name}
                                </Link>
                            </div>
                        </div>
                    )}

                    <div className="p-6">
                        {/* Category Badge */}
                        <span className="px-3 py-1 text-sm bg-purple-500/20 text-purple-300 rounded-full">
                            {CATEGORY_LABELS[guide.category] || guide.category}
                        </span>

                        {/* Title */}
                        <h1 className="text-2xl md:text-3xl font-bold text-white mt-4 mb-4">
                            {guide.title}
                        </h1>

                        {/* Description */}
                        <p className="text-gray-400 mb-6">{guide.description}</p>

                        {/* Author & Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-e7-gold/20">
                            <div className="flex items-center gap-3">
                                {guide.user.avatar && (
                                    <Image
                                        src={guide.user.avatar}
                                        alt={guide.user.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                        unoptimized
                                    />
                                )}
                                <div>
                                    <p className="text-white font-medium">{guide.user.name}</p>
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
                                    {guide.likes_count}
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
                {guide.video_url && (
                    <div className="bg-e7-panel border border-e7-gold/20 rounded-lg overflow-hidden mb-6 p-6">
                        <h2 className="text-xl font-bold text-e7-gold mb-4">📺 Video</h2>
                        <div className="aspect-video">
                            <iframe
                                src={guide.video_url.replace('watch?v=', 'embed/')}
                                className="w-full h-full rounded"
                                allowFullScreen
                            />
                        </div>
                    </div>
                )}

                {/* Images */}
                {guide.images && guide.images.length > 0 && (
                    <div className="bg-e7-panel border border-e7-gold/20 rounded-lg overflow-hidden mb-6 p-6">
                        <h2 className="text-xl font-bold text-e7-gold mb-4">📷 {t('guides.images', 'Images')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {guide.images.map((img, idx) => (
                                <div key={idx} className="relative aspect-video rounded overflow-hidden">
                                    <Image src={img} alt={`Image ${idx + 1}`} fill className="object-cover" unoptimized />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="bg-e7-panel border border-e7-gold/20 rounded-lg overflow-hidden mb-6 p-6">
                    <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 whitespace-pre-wrap">{guide.gameplay_content}</div>
                    </div>
                </div>

                {/* Comments */}
                <div className="bg-e7-panel border border-e7-gold/20 rounded-lg overflow-hidden p-6">
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
                            <Button
                                type="submit"
                                className="mt-2 bg-e7-gold text-black hover:bg-e7-text-gold"
                                disabled={commentMutation.isPending}
                            >
                                {t('guides.postComment', 'Post Comment')}
                            </Button>
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
                                    {comment.user.avatar && (
                                        <Image
                                            src={comment.user.avatar}
                                            alt={comment.user.name}
                                            width={36}
                                            height={36}
                                            className="rounded-full"
                                            unoptimized
                                        />
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-white font-medium text-sm">{comment.user.name}</span>
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
