'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, verificationApi } from '@/lib/api';
import { useTranslations } from '@/hooks/useTranslations';
import { useRequireAuth } from '@/hooks/useAuth';
import { STAT_FIELDS } from '@/components/builds/buildFormModel';

interface QueueBuild {
    id: number;
    title: string;
    proof_image: string;
    min_stats: Record<string, number | string> | null;
    proof_ocr: { read: Record<string, number>; matched: number; total: number } | null;
    hero: { name: string; slug: string } | null;
    user: { id: number; name: string } | null;
}

/**
 * Cola de verificación (solo admin): la captura del juego al lado de los stats de la build y lo
 * que leyó el OCR. Arriba las que coinciden todas: se pueden aprobar juntas.
 */
export default function AdminVerificationsPage() {
    const { t } = useTranslations();
    const queryClient = useQueryClient();
    const loggedIn = useRequireAuth();
    const [selected, setSelected] = useState<number[]>([]);

    const { data: me } = useQuery({
        queryKey: ['current-user'],
        queryFn: async () => (await authApi.getUser()).data as { is_admin?: boolean },
        enabled: loggedIn,
    });
    const { data, isLoading } = useQuery<{ data: QueueBuild[]; loaded_at: string }>({
        queryKey: ['admin-verifications'],
        queryFn: async () => (await verificationApi.queue()).data,
        enabled: Boolean(me?.is_admin),
    });
    const queue = data?.data ?? [];
    // Lo editado después de cargar la cola no se aprueba: vuelve a aparecer para revisarlo
    const decide = useMutation({
        mutationFn: ({ ids, status }: { ids: number[]; status: 'verified' | 'rejected' }) => verificationApi.set(ids, status, data?.loaded_at ?? ''),
        onSuccess: () => {
            setSelected([]);
            queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
        },
    });

    if (!loggedIn || !me) return <div className="min-h-screen bg-e7-void" aria-busy="true" />;
    if (!me.is_admin) {
        return <p className="min-h-screen bg-e7-void px-4 py-16 text-center text-gray-300">{t('admin.onlyAdmins', 'Only admins can see this page.')}</p>;
    }

    const fullMatches = queue.filter((b) => b.proof_ocr && b.proof_ocr.total > 0 && b.proof_ocr.matched === b.proof_ocr.total).map((b) => b.id);
    const toggle = (id: number) => setSelected((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));

    return (
        <div className="min-h-screen bg-e7-void">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <h1 className="text-2xl font-bold text-e7-gold">{t('admin.verifications', 'Build verification')}</h1>
                <p className="mt-1 text-sm text-gray-400">
                    {t('admin.verificationsHint', 'The OCR reading comes from the author’s browser and can be faked: always check the screenshot.')}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setSelected(fullMatches)} disabled={fullMatches.length === 0} className="rounded-lg border border-emerald-400/40 px-3 py-1.5 text-sm text-emerald-300 disabled:opacity-40">
                        {t('admin.selectFullMatches', 'Select full matches ({count})').replace('{count}', String(fullMatches.length))}
                    </button>
                    <button type="button" onClick={() => decide.mutate({ ids: selected, status: 'verified' })} disabled={selected.length === 0 || decide.isPending} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-black disabled:opacity-40">
                        {t('admin.approveSelected', 'Approve selected ({count})').replace('{count}', String(selected.length))}
                    </button>
                </div>

                {isLoading ? (
                    <p className="mt-6 text-gray-400">{t('common.loading', 'Loading...')}</p>
                ) : queue.length === 0 ? (
                    <p className="mt-6 text-gray-400">{t('admin.noVerifications', 'Nothing to review.')}</p>
                ) : (
                    <ul className="mt-6 space-y-4">
                        {queue.map((build) => (
                            <li key={build.id} className="glass-panel grid gap-4 rounded-xl border border-e7-gold/20 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                <a href={build.proof_image} target="_blank" rel="noreferrer">
                                    {/* eslint-disable-next-line @next/next/no-img-element -- captura subida por el autor, se ve tal cual */}
                                    <img src={build.proof_image} alt={t('admin.proofOf', 'Screenshot of {title}').replace('{title}', build.title)} className="w-full rounded-lg border border-white/10 object-contain" />
                                </a>
                                <div className="space-y-3">
                                    <label className="flex items-start gap-2">
                                        <input type="checkbox" checked={selected.includes(build.id)} onChange={() => toggle(build.id)} className="mt-1 accent-emerald-400" />
                                        <span>
                                            <Link href={`/builds/${build.id}`} className="font-semibold text-slate-50 hover:text-e7-gold">{build.title}</Link>
                                            <span className="block text-xs text-gray-400">{build.hero?.name} · {build.user?.name}</span>
                                        </span>
                                    </label>
                                    <p className="text-sm text-gray-300">
                                        {build.proof_ocr
                                            ? t('admin.ocrMatched', 'OCR: {matched} of {total} stats match').replace('{matched}', String(build.proof_ocr.matched)).replace('{total}', String(build.proof_ocr.total))
                                            : t('admin.noOcr', 'No OCR reading: compare by eye')}
                                    </p>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-xs text-gray-400">
                                                <th scope="col" className="text-left font-normal">{t('admin.stat', 'Stat')}</th>
                                                <th scope="col" className="text-right font-normal">{t('admin.buildValue', 'Build')}</th>
                                                <th scope="col" className="text-right font-normal">{t('admin.ocrValue', 'Screenshot')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {STAT_FIELDS.map(({ key, label }) => {
                                                const value = build.min_stats?.[key];
                                                const read = build.proof_ocr?.read?.[key];
                                                const differs = value !== undefined && value !== '' && read !== undefined && Math.abs(Number(value) - read) > 1;
                                                return (
                                                    <tr key={key} className={differs ? 'text-amber-300' : 'text-slate-200'}>
                                                        <th scope="row" className="text-left font-normal">{label}</th>
                                                        <td className="text-right font-mono">{value ?? '—'}</td>
                                                        <td className="text-right font-mono">{read ?? '—'}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => decide.mutate({ ids: [build.id], status: 'verified' })} disabled={decide.isPending} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-black disabled:opacity-40">
                                            {t('admin.approve', 'Approve')}
                                        </button>
                                        <button type="button" onClick={() => decide.mutate({ ids: [build.id], status: 'rejected' })} disabled={decide.isPending} className="rounded-lg border border-red-400/40 px-3 py-1.5 text-sm text-red-300 disabled:opacity-40">
                                            {t('admin.reject', 'Reject')}
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
