'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { buildApi, guideApi, userApi } from '@/lib/api';
import { useTranslations } from '@/hooks/useTranslations';
import { useAuthToken } from '@/hooks/useAuth';
import { VerifiedBadge } from '@/components/builds/VerifiedBadge';
import { SET_IMAGES, formatSetName } from '@/lib/sets';

interface Profile {
    id: number;
    name: string;
    avatar: string | null;
    created_at: string;
    stats: { builds: number; guides: number; likes_received: number; verified_builds: number; followers: number; following: number };
    badges: ('verified_builder' | 'popular')[];
    is_self: boolean;
    is_following: boolean;
}

interface ProfileBuild {
    id: number;
    title: string;
    primary_set: string | null;
    secondary_set: string | null;
    likes: number;
    verification_status?: string | null;
    hero: { name: string; slug: string } | null;
}

interface ProfileGuide {
    id: number;
    slug: string;
    title: string;
    likes?: number;
    category: string;
}

const BADGES = {
    verified_builder: { icon: '✓', className: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300' },
    popular: { icon: '♥', className: 'border-e7-gold/40 bg-e7-gold/10 text-e7-gold' },
} as const;

/** Perfil público de un jugador: lo que publicó con su nombre, sus insignias y seguirlo */
export function ProfileClient({ userId }: { userId: string }) {
    const { t, locale } = useTranslations();
    const router = useRouter();
    const queryClient = useQueryClient();
    const token = useAuthToken();

    const { data: profile, isLoading, isError } = useQuery<Profile>({
        // Con sesión, la API dice si el usuario ya lo sigue (por eso el token va en la clave)
        queryKey: ['user-profile', userId, Boolean(token)],
        queryFn: async () => (await userApi.get(userId)).data,
        enabled: token !== undefined,
    });
    const { data: builds = [] } = useQuery<ProfileBuild[]>({
        queryKey: ['user-builds', userId],
        queryFn: async () => (await buildApi.list({ user: userId, lang: locale })).data.data,
    });
    const { data: guides = [] } = useQuery<ProfileGuide[]>({
        queryKey: ['user-guides', userId],
        queryFn: async () => (await guideApi.list({ user: userId })).data.data,
    });

    const follow = useMutation({
        mutationFn: async (following: boolean) => (following ? userApi.unfollow(userId) : userApi.follow(userId)),
        onSuccess: (response) => {
            queryClient.setQueryData<Profile>(['user-profile', userId, true], (current) => current && {
                ...current,
                is_following: response.data.following,
                stats: { ...current.stats, followers: response.data.followers },
            });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
        },
    });

    if (isLoading || token === undefined) {
        return <div className="min-h-screen bg-e7-void" aria-busy="true" />;
    }
    if (isError || !profile) {
        return (
            <div className="min-h-screen bg-e7-void px-4 py-16 text-center text-gray-300">
                <p>{t('profile.notFound', 'This player doesn’t exist.')}</p>
                <Link href="/builds" className="mt-4 inline-block text-e7-gold hover:underline">{t('profile.backToBuilds', 'Back to builds')}</Link>
            </div>
        );
    }

    const stats: [string, number][] = [
        [t('profile.builds', 'Builds'), profile.stats.builds],
        [t('profile.guides', 'Guides'), profile.stats.guides],
        [t('profile.likesReceived', 'Likes received'), profile.stats.likes_received],
        [t('profile.verifiedBuilds', 'Verified builds'), profile.stats.verified_builds],
        [t('profile.followers', 'Followers'), profile.stats.followers],
    ];
    const since = new Date(profile.created_at).toLocaleDateString(locale, { year: 'numeric', month: 'long' });

    return (
        <div className="min-h-screen bg-e7-void">
            <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
                <header className="glass-panel rounded-xl border border-e7-gold/20 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {profile.avatar ? (
                            <Image src={profile.avatar} alt="" width={72} height={72} className="h-18 w-18 rounded-full object-cover" unoptimized />
                        ) : (
                            <span aria-hidden="true" className="flex h-18 w-18 items-center justify-center rounded-full bg-e7-gold/15 text-2xl font-bold text-e7-gold">
                                {profile.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                        <div className="min-w-0 flex-1">
                            <h1 className="truncate text-2xl font-bold text-slate-50">{profile.name}</h1>
                            <p className="text-sm text-gray-400">{t('profile.memberSince', 'Member since {date}').replace('{date}', since)}</p>
                            {profile.badges.length > 0 && (
                                <ul className="mt-2 flex flex-wrap gap-2" aria-label={t('profile.badges', 'Badges')}>
                                    {profile.badges.map((badge) => (
                                        <li key={badge} className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${BADGES[badge].className}`}>
                                            {BADGES[badge].icon} {t(`profile.badge.${badge}`, badge)}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {!profile.is_self && (
                            <button
                                type="button"
                                disabled={follow.isPending}
                                onClick={() => (token ? follow.mutate(profile.is_following) : router.push('/login'))}
                                aria-pressed={profile.is_following}
                                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${profile.is_following ? 'border border-e7-gold/40 text-e7-gold hover:bg-e7-gold/10' : 'bg-e7-gold text-black hover:bg-yellow-400'}`}
                            >
                                {profile.is_following ? t('profile.following', 'Following') : t('profile.follow', 'Follow')}
                            </button>
                        )}
                    </div>
                    <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {stats.map(([label, value]) => (
                            <div key={label} className="rounded-lg bg-e7-dark/50 px-3 py-2">
                                <dt className="text-xs text-gray-400">{label}</dt>
                                <dd className="font-mono text-lg font-semibold tabular-nums text-slate-50">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </header>

                <section aria-labelledby="profile-builds" className="glass-panel rounded-xl border border-e7-gold/20 p-5">
                    <h2 id="profile-builds" className="text-lg font-semibold text-e7-gold">{t('profile.builds', 'Builds')}</h2>
                    {builds.length === 0 ? (
                        <p className="mt-3 text-sm text-gray-400">{t('profile.noBuilds', 'No builds published under this name yet.')}</p>
                    ) : (
                        <ul className="mt-3 divide-y divide-white/5">
                            {builds.map((build) => (
                                <li key={build.id}>
                                    <Link href={`/builds/${build.id}`} className="flex items-center gap-3 py-3 hover:bg-white/3">
                                        <span className="flex shrink-0 gap-1">
                                            {[build.primary_set, build.secondary_set].filter((set): set is string => !!set).map((set) =>
                                                SET_IMAGES[set] ? <Image key={set} src={SET_IMAGES[set]} alt={formatSetName(set)} width={24} height={24} /> : null,
                                            )}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate font-semibold text-slate-50">{build.title}</span>
                                            <span className="block truncate text-xs text-gray-400">{build.hero?.name}</span>
                                        </span>
                                        <VerifiedBadge status={build.verification_status} />
                                        <span className="shrink-0 font-mono text-xs text-e7-gold">♥ {build.likes || 0}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section aria-labelledby="profile-guides" className="glass-panel rounded-xl border border-e7-gold/20 p-5">
                    <h2 id="profile-guides" className="text-lg font-semibold text-e7-gold">{t('profile.guides', 'Guides')}</h2>
                    {guides.length === 0 ? (
                        <p className="mt-3 text-sm text-gray-400">{t('profile.noGuides', 'No guides published under this name yet.')}</p>
                    ) : (
                        <ul className="mt-3 divide-y divide-white/5">
                            {guides.map((guide) => (
                                <li key={guide.id}>
                                    <Link href={`/guides/${guide.slug}`} className="flex items-center gap-3 py-3 hover:bg-white/3">
                                        <span className="min-w-0 flex-1 truncate font-semibold text-slate-50">{guide.title}</span>
                                        <span className="shrink-0 font-mono text-xs text-e7-gold">♥ {guide.likes || 0}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}
