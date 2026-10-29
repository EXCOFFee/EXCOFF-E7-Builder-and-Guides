'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from '@/hooks/useTranslations';
import { TIER_CATEGORIES, TIER_COLORS, TIER_VALUES, tierToLetter, type TierCategory, type TierLetter } from '@/components/ui/tier-rating-selector';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ModeVotes {
    community: Record<TierCategory, { avg: number | null; count: number }>;
    my_votes: Record<TierCategory, number | null> | null;
    can_vote: boolean;
}

interface CommunityTierVoteProps {
    buildId: string | number;
    authorRatings: Partial<Record<TierCategory, number | null>>;
    isLoggedIn: boolean;
    isOwner: boolean;
}

const LETTERS = (Object.keys(TIER_VALUES) as TierLetter[]); // D, C, B, A, S

function authHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Nota por modo que vota la comunidad, al lado de la del autor. Un voto por modo; volver a
 * tocar la letra elegida lo quita. El autor no vota su propia build.
 */
export function CommunityTierVote({ buildId, authorRatings, isLoggedIn, isOwner }: CommunityTierVoteProps) {
    const { t } = useTranslations();
    const queryClient = useQueryClient();
    const key = ['build-mode-votes', String(buildId), isLoggedIn];

    const { data } = useQuery<ModeVotes>({
        queryKey: key,
        queryFn: async () => {
            const response = await fetch(`${API_URL}/builds/${buildId}/mode-votes`, { headers: authHeaders() });
            if (!response.ok) throw new Error('mode votes');
            return response.json();
        },
    });

    const vote = useMutation({
        mutationFn: async ({ mode, tier }: { mode: TierCategory; tier: number | null }) => {
            const response = await fetch(`${API_URL}/builds/${buildId}/mode-votes`, {
                method: 'POST',
                headers: { ...authHeaders(), 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ mode, tier }),
            });
            if (!response.ok) throw new Error('vote');
            return (await response.json()) as ModeVotes;
        },
        onSuccess: (result) => queryClient.setQueryData(key, result),
    });

    const canVote = isLoggedIn && !isOwner && (data?.can_vote ?? true);

    return (
        <section aria-labelledby="community-tier-title" className="mt-6 border-t border-e7-gold/10 pt-5">
            <h3 id="community-tier-title" className="text-lg font-semibold text-e7-gold">
                {t('builds.communityRating', 'Community rating')}
            </h3>
            <p className="mb-4 text-sm text-slate-400">
                {isOwner
                    ? t('builds.cannotVoteOwn', 'Other players rate your build here.')
                    : t('builds.communityRatingHint', 'How good is this build in each mode? Vote from D to S.')}
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {TIER_CATEGORIES.map((mode) => {
                    const community = data?.community?.[mode];
                    const communityLetter = community?.avg != null ? tierToLetter(Math.round(community.avg)) : null;
                    const authorLetter = tierToLetter(authorRatings[mode]);
                    const mine = data?.my_votes?.[mode] ?? null;
                    const modeLabel = t(`builds.tier_${mode}`, mode.toUpperCase());

                    return (
                        <div key={mode} className="rounded-xl border border-night-line bg-night-panel/60 p-4">
                            <div className="flex items-baseline justify-between gap-2">
                                <span className="text-sm uppercase tracking-wider text-slate-300">{modeLabel}</span>
                                <span className="text-xs text-slate-400">
                                    {t('builds.authorRating', 'Author')}:{' '}
                                    <span className={authorLetter ? `font-bold ${TIER_COLORS[authorLetter].text}` : ''}>{authorLetter ?? '—'}</span>
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-300">
                                {communityLetter ? (
                                    <>
                                        <span className={`mr-2 text-2xl font-bold ${TIER_COLORS[communityLetter].text}`}>{communityLetter}</span>
                                        {t('builds.votesCount', '{count} votes').replace('{count}', String(community!.count))}
                                    </>
                                ) : (
                                    <span className="text-slate-400">{t('builds.noVotesYet', 'No votes yet')}</span>
                                )}
                            </p>

                            {canVote && (
                                <div role="group" aria-label={`${t('builds.yourVote', 'Your vote')}: ${modeLabel}`} className="mt-3 flex gap-1.5">
                                    {LETTERS.map((letter) => {
                                        const value = TIER_VALUES[letter];
                                        const selected = mine === value;
                                        return (
                                            <button
                                                key={letter}
                                                type="button"
                                                aria-pressed={selected}
                                                disabled={vote.isPending}
                                                onClick={() => vote.mutate({ mode, tier: selected ? null : value })}
                                                className={`h-9 w-9 rounded-lg border text-sm font-bold transition-colors ${selected
                                                    ? `${TIER_COLORS[letter].bg} ${TIER_COLORS[letter].border} ${TIER_COLORS[letter].text}`
                                                    : 'border-night-line text-slate-400 hover:border-e7-gold/60 hover:text-slate-100'}`}
                                            >
                                                {letter}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {!isLoggedIn && (
                <p className="mt-3 text-sm text-slate-400">
                    <Link href="/login" className="text-e7-gold hover:underline">{t('builds.loginToVote', 'Log in to vote')}</Link>
                </p>
            )}
            {vote.isError && (
                <p role="alert" className="mt-3 text-sm text-red-400">{t('builds.voteError', 'Your vote could not be saved. Try again.')}</p>
            )}
        </section>
    );
}
