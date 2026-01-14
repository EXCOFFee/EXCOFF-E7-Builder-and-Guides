'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ImageCarousel } from '@/components/ui/image-carousel';
import { StarRating } from '@/components/ui/star-rating';
import { TierRatingDisplay, TierCategory } from '@/components/ui/tier-rating-selector';
import { ProConsDisplay } from '@/components/ui/pro-cons-selector';
import { SynergyCounterSection, HeroWithNote } from '@/components/builds/SynergyCounterCard';
import { ExportBuildImage } from '@/components/builds/ExportBuildImage';
import { ShareButton } from '@/components/ui/ShareButton';
import { useTranslations } from '@/hooks/useTranslations';
import { appendImageVersion } from '@/lib/heroImages';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

import { SET_IMAGES } from '@/lib/sets';

const ELEMENT_COLORS: Record<string, string> = {
    fire: 'bg-red-500',
    ice: 'bg-blue-500',
    earth: 'bg-green-500',
    light: 'bg-yellow-400',
    dark: 'bg-purple-600',
};

// Element to image mapping
const ELEMENT_IMAGES: Record<string, string> = {
    fire: '/images/elements/ElementFire.png',
    ice: '/images/elements/ElementWater.png',
    earth: '/images/elements/ElementEarth.png',
    light: '/images/elements/ElementLight.png',
    dark: '/images/elements/ElementDark.png',
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
    skill_1?: number;
    skill_2?: number;
    skill_3?: number;
    synergy_heroes_list?: HeroWithNote[];
    counter_heroes_list?: HeroWithNote[];
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
        skills?: {
            name: string;
            icon: string;
            description: string;
        }[];
    };
    artifact: {
        id: number;
        name: string;
        icon: string;
    } | null;
    created_at: string;
    avg_rating?: number;
    rating_count?: number;
    // Tier Ratings (D-S system)
    rating_pve?: number | null;
    rating_arena?: number | null;
    rating_gw?: number | null;
    rating_rta?: number | null;
    reason_pve?: string;
    reason_arena?: string;
    reason_gw?: string;
    reason_rta?: string;
    // Pros/Cons tags
    pro_tags?: string[];
    con_tags?: string[];
}

interface Comment {
    id: number;
    user_id: number;
    parent_id?: number | null;
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

export function BuildDetailClient() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { t, locale } = useTranslations();
    const buildId = params.id as string;

    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [newComment, setNewComment] = useState('');
    const [hasLiked, setHasLiked] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [userRating, setUserRating] = useState<number | null>(null);
    // Reply and edit state
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [editingComment, setEditingComment] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    // Ref for export to image
    const buildCardRef = useRef<HTMLDivElement>(null);

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
        queryKey: ['build', buildId, locale],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/builds/${buildId}?lang=${locale}`);
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
            // Update likes locally without refetching (to avoid incrementing views)
            queryClient.setQueryData(['build', buildId], (oldData: Build | undefined) => {
                if (!oldData) return oldData;
                return { ...oldData, likes: data.likes };
            });
        },
    });

    // Rating mutation
    const rateMutation = useMutation({
        mutationFn: async (rating: number) => {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/builds/${buildId}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ rating }),
            });
            return response.json();
        },
        onSuccess: (data) => {
            setUserRating(data.user_rating);
            // Update rating locally
            queryClient.setQueryData(['build', buildId], (oldData: Build | undefined) => {
                if (!oldData) return oldData;
                return { ...oldData, avg_rating: data.avg_rating, rating_count: data.rating_count };
            });
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

    // Edit comment mutation
    const editCommentMutation = useMutation({
        mutationFn: async ({ commentId, content }: { commentId: number; content: string }) => {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to edit comment');
            }
            return response.json();
        },
        onSuccess: () => {
            setEditingComment(null);
            setEditContent('');
            queryClient.invalidateQueries({ queryKey: ['build-comments', buildId] });
        },
    });

    // Reply to comment mutation
    const replyMutation = useMutation({
        mutationFn: async ({ parentId, content }: { parentId: number; content: string }) => {
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
                    parent_id: parentId,
                    is_anonymous: false,
                }),
            });
            return response.json();
        },
        onSuccess: () => {
            setReplyingTo(null);
            setReplyContent('');
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
            <div className="min-h-screen bg-e7-void flex items-center justify-center">
                <div className="text-slate-400">{t('common.loading', 'Loading...')}</div>
            </div>
        );
    }

    if (error || !build) {
        return (
            <div className="min-h-screen bg-e7-void flex items-center justify-center">
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
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back link */}
                <Link href="/builds" className="text-e7-gold hover:text-e7-text-gold text-sm mb-4 inline-flex items-center gap-2 group transition-colors">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> {t('builds.backToBuilds', 'Back to Builds')}
                </Link>

                {/* Build Header */}
                <div ref={buildCardRef} className="glass-panel border-e7-gold/20 rounded-2xl overflow-hidden mb-6 backdrop-blur-xl bg-gradient-to-br from-e7-panel/90 to-e7-dark/90 shadow-2xl">
                    {/* Hero Section */}
                    <div className="flex flex-col md:flex-row items-center gap-8 p-8 border-b border-e7-gold/20 bg-gradient-to-r from-transparent via-e7-gold/5 to-transparent">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-e7-gold/30 to-e7-purple/30 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                            <Image
                                src={appendImageVersion(build.hero.portrait)}
                                alt={build.hero.name}
                                width={200}
                                height={200}
                                className="rounded-2xl ring-2 ring-e7-gold/60 relative z-10 shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                                unoptimized
                            />
                            <Image
                                src={ELEMENT_IMAGES[build.hero.element] || '/images/elements/ElementFire.png'}
                                alt={build.hero.element}
                                width={40}
                                height={40}
                                className="absolute -bottom-2 -right-2 w-10 h-10 ring-2 ring-e7-dark rounded-full bg-e7-dark/90 backdrop-blur-sm z-20 shadow-lg"
                            />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <Link href={`/heroes/${build.hero.slug}`} className="font-display inline-block text-transparent bg-clip-text bg-gradient-to-r from-e7-text-gold to-e7-gold hover:from-e7-gold hover:to-e7-text-gold font-bold text-4xl md:text-5xl transition-all duration-300 transform hover:scale-105">
                                {build.hero.name}
                            </Link>
                            <p className="font-display text-2xl text-gray-400 capitalize mt-2 font-medium">{build.hero.class.replace('_', ' ')}</p>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Title */}
                        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                            {build.title}
                        </h1>

                        {/* Author & Actions - moved to top */}
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-e7-gold/20">
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

                            <div className="flex gap-2 flex-wrap">
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

                                {/* Share Button */}
                                <ShareButton
                                    title={`${build.hero.name} - ${build.title}`}
                                    url={`/builds/${build.id}`}
                                    description={build.description}
                                />

                                {/* Export Image Button */}
                                <ExportBuildImage
                                    buildRef={buildCardRef}
                                    heroName={build.hero?.name || 'hero'}
                                    buildTitle={build.title}
                                />

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

                        {/* Sets */}
                        <div className="flex flex-wrap gap-4 mb-6">
                            {build.primary_set && (
                                <span className="px-5 py-3 text-base bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-200 rounded-2xl flex items-center gap-3 border border-purple-500/30 backdrop-blur-sm shadow-lg hover:shadow-purple-500/20 hover:scale-105 transition-all duration-300">
                                    {SET_IMAGES[build.primary_set] && (
                                        <Image
                                            src={SET_IMAGES[build.primary_set]}
                                            alt={build.primary_set}
                                            width={32}
                                            height={32}
                                            className="drop-shadow-lg"
                                            unoptimized
                                        />
                                    )}
                                    <span className="font-semibold">{build.primary_set}</span>
                                </span>
                            )}
                            {build.secondary_set && (
                                <span className="px-5 py-3 text-base bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 rounded-2xl flex items-center gap-3 border border-blue-500/30 backdrop-blur-sm shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300">
                                    {SET_IMAGES[build.secondary_set] && (
                                        <Image
                                            src={SET_IMAGES[build.secondary_set]}
                                            alt={build.secondary_set}
                                            width={32}
                                            height={32}
                                            className="drop-shadow-lg"
                                            unoptimized
                                        />
                                    )}
                                    <span className="font-semibold">{build.secondary_set}</span>
                                </span>
                            )}
                        </div>

                        {/* Artifact */}
                        {build.artifact && (
                            <div className="group flex items-center gap-6 mb-6 p-5 bg-gradient-to-r from-e7-void/70 via-e7-panel/50 to-e7-void/70 rounded-2xl border border-e7-gold/20 backdrop-blur-sm hover:border-e7-gold/40 transition-all duration-300 shadow-lg">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-e7-gold/20 to-e7-purple/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                                    <Image
                                        src={build.artifact.icon}
                                        alt={build.artifact.name}
                                        width={96}
                                        height={96}
                                        className="rounded-xl ring-2 ring-e7-gold/40 relative z-10 shadow-xl group-hover:scale-110 transition-transform duration-300"
                                        unoptimized
                                    />
                                </div>
                                <span className="text-2xl text-white font-semibold group-hover:text-e7-text-gold transition-colors duration-300">{build.artifact.name}</span>
                            </div>
                        )}



                        {/* Skill Recommendations */}
                        {build.hero.skills && build.hero.skills.length >= 3 &&
                            (build.skill_1 || build.skill_2 || build.skill_3) ? (
                            <div className="mb-6">
                                <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-e7-text-gold to-e7-gold font-bold text-xl mb-4">
                                    {t('builds.skillRecommendations', 'Skill Recommendations')}
                                </h3>
                                <div className="flex flex-wrap gap-6">
                                    {[0, 1, 2].map(idx => {
                                        const skillLevel = build[`skill_${idx + 1}` as keyof Build] as number || 0;
                                        const skill = build.hero.skills![idx];
                                        return (
                                            <div key={idx} className="relative group">
                                                <div className={`
                                                    relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300
                                                    ${skillLevel > 0
                                                        ? 'border-e7-gold shadow-lg shadow-e7-gold/20'
                                                        : 'border-white/10 opacity-70 group-hover:opacity-100 group-hover:border-white/30'
                                                    }
                                                `}>
                                                    <Image
                                                        src={skill.icon}
                                                        alt={skill.name}
                                                        width={64}
                                                        height={64}
                                                        className="w-full h-full object-cover"
                                                        unoptimized
                                                    />
                                                    {skillLevel > 0 && (
                                                        <div className="absolute inset-0 border-2 border-e7-gold/50 rounded-xl animate-pulse"></div>
                                                    )}
                                                </div>

                                                {/* Level Badge */}
                                                <div className={`
                                                    absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold border
                                                    ${skillLevel > 0
                                                        ? 'bg-e7-gold text-black border-white/20 shadow-md transform scale-110'
                                                        : 'bg-e7-panel text-gray-400 border-white/10'
                                                    }
                                                `}>
                                                    +{skillLevel}
                                                </div>

                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-white/10">
                                                    {skill.name}
                                                    {skillLevel === 0 && <span className="block text-gray-500 text-[10px]">{t('common.noUpgrade', 'No upgrade')}</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : null}

                        {/* Min Stats */}
                        {build.min_stats && Object.keys(build.min_stats).length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-e7-text-gold to-e7-gold font-bold text-xl mb-4">{t('builds.minStats', 'Min Stats')}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(build.min_stats).map(([stat, value]) => (
                                        <div key={stat} className="group bg-gradient-to-br from-e7-void/70 to-e7-panel/50 p-4 rounded-xl border border-e7-gold/20 backdrop-blur-sm hover:border-e7-gold/40 hover:shadow-lg hover:shadow-e7-gold/10 transition-all duration-300 hover:-translate-y-1">
                                            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">{stat}</p>
                                            <p className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-e7-text-gold group-hover:to-e7-gold transition-all duration-300">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {build.description && (
                            <div className="mb-6 p-5 bg-gradient-to-br from-e7-void/50 to-e7-panel/30 rounded-xl border border-e7-gold/10 backdrop-blur-sm">
                                <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-e7-text-gold to-e7-gold font-bold text-xl mb-3">Description</h3>
                                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{build.description}</p>
                            </div>
                        )}

                        {/* Tier Ratings (D-S) */}
                        <div className="mb-6 p-5 bg-gradient-to-br from-e7-void/50 to-e7-panel/30 rounded-xl border border-e7-gold/10 backdrop-blur-sm">
                            <TierRatingDisplay
                                ratings={{
                                    pve: build.rating_pve ?? null,
                                    arena: build.rating_arena ?? null,
                                    gw: build.rating_gw ?? null,
                                    rta: build.rating_rta ?? null,
                                }}
                                reasons={{
                                    pve: build.reason_pve,
                                    arena: build.reason_arena,
                                    gw: build.reason_gw,
                                    rta: build.reason_rta,
                                }}
                            />
                        </div>

                        {/* Pros/Cons Tags */}
                        <div className="mb-6">
                            <ProConsDisplay
                                pros={build.pro_tags || []}
                                cons={build.con_tags || []}
                            />
                        </div>

                        {/* Images */}
                        <ImageCarousel images={build.images || []} title={t('builds.images', 'Images')} />

                        {/* Synergy Heroes */}
                        <SynergyCounterSection
                            title={t('builds.synergyHeroes', 'Synergy Heroes')}
                            heroes={build.synergy_heroes_list || []}
                            type="synergy"
                        />

                        {/* Counter Heroes */}
                        <SynergyCounterSection
                            title={t('builds.counterHeroes', 'Counter Heroes')}
                            heroes={build.counter_heroes_list || []}
                            type="counter"
                        />
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
                            comments.map((comment) => {
                                const canEdit = currentUser && comment.user_id === currentUser.id &&
                                    (new Date().getTime() - new Date(comment.created_at).getTime()) < 24 * 60 * 60 * 1000;
                                const canDelete = currentUser && (currentUser.is_admin || comment.user_id === currentUser.id);

                                return (
                                    <div key={comment.id} className="space-y-2">
                                        <div className="flex gap-3 p-4 bg-e7-void/50 rounded-lg">
                                            {!comment.is_anonymous && comment.user?.avatar && (
                                                <Image
                                                    src={comment.user.avatar}
                                                    alt={comment.user?.name || ''}
                                                    width={36}
                                                    height={36}
                                                    className="rounded-full flex-shrink-0"
                                                    unoptimized
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-medium text-sm">
                                                            {comment.is_anonymous ? t('common.anonymous', 'Anonymous') : comment.user?.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(comment.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2 text-xs">
                                                        {currentUser && (
                                                            <button
                                                                onClick={() => { setReplyingTo(comment.id); setReplyContent(''); }}
                                                                className="text-cyan-400 hover:text-cyan-300"
                                                            >
                                                                {t('comments.reply', 'Reply')}
                                                            </button>
                                                        )}
                                                        {canEdit && (
                                                            <button
                                                                onClick={() => { setEditingComment(comment.id); setEditContent(comment.content); }}
                                                                className="text-e7-gold hover:text-e7-text-gold"
                                                            >
                                                                {t('common.edit', 'Edit')}
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(t('common.confirmDelete', 'Are you sure?'))) {
                                                                        deleteCommentMutation.mutate(comment.id);
                                                                    }
                                                                }}
                                                                className="text-red-400 hover:text-red-300"
                                                            >
                                                                {t('common.delete', 'Delete')}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Edit form or content */}
                                                {editingComment === comment.id ? (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white text-sm resize-none"
                                                            rows={2}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => editCommentMutation.mutate({ commentId: comment.id, content: editContent })}
                                                                disabled={editCommentMutation.isPending}
                                                                className="px-3 py-1 bg-e7-gold text-black text-xs rounded hover:bg-e7-text-gold"
                                                            >
                                                                {t('common.save', 'Save')}
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingComment(null)}
                                                                className="px-3 py-1 border border-gray-500 text-gray-400 text-xs rounded hover:text-white"
                                                            >
                                                                {t('common.cancel', 'Cancel')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-300 text-sm">{comment.content}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Reply form */}
                                        {replyingTo === comment.id && (
                                            <div className="ml-8 p-3 bg-e7-void/30 rounded-lg border border-cyan-500/20">
                                                <textarea
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    placeholder={t('comments.writeReply', 'Write a reply...')}
                                                    className="w-full px-3 py-2 rounded-lg bg-e7-void border border-cyan-500/30 text-white text-sm resize-none"
                                                    rows={2}
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => replyMutation.mutate({ parentId: comment.id, content: replyContent })}
                                                        disabled={replyMutation.isPending || !replyContent.trim()}
                                                        className="px-3 py-1 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-500"
                                                    >
                                                        {t('comments.reply', 'Reply')}
                                                    </button>
                                                    <button
                                                        onClick={() => setReplyingTo(null)}
                                                        className="px-3 py-1 border border-gray-500 text-gray-400 text-xs rounded hover:text-white"
                                                    >
                                                        {t('common.cancel', 'Cancel')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Nested replies */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="ml-8 space-y-2">
                                                {comment.replies.map((reply) => (
                                                    <div key={reply.id} className="flex gap-2 p-3 bg-e7-void/30 rounded-lg border-l-2 border-cyan-500/30">
                                                        {!reply.is_anonymous && reply.user?.avatar && (
                                                            <Image
                                                                src={reply.user.avatar}
                                                                alt={reply.user?.name || ''}
                                                                width={28}
                                                                height={28}
                                                                className="rounded-full flex-shrink-0"
                                                                unoptimized
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-white font-medium text-xs">
                                                                    {reply.is_anonymous ? t('common.anonymous', 'Anonymous') : reply.user?.name}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {new Date(reply.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-300 text-sm">{reply.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
