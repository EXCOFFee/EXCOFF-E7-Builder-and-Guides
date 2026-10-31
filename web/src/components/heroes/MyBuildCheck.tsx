'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from '@/hooks/useTranslations';
import { heroApi } from '@/lib/api';
import { STAT_FIELDS, type StatKey } from '@/components/builds/buildFormModel';

/** Con menos builds que esto, un porcentaje no dice nada */
const MIN_BUILDS = 5;

type Distribution = Partial<Record<StatKey, number[]>>;

/** Porcentaje de builds cuyo mínimo para el stat ya se cumple con `value` */
function shareMet(sorted: number[], value: number): number {
    let met = 0;
    for (const min of sorted) if (min <= value) met++;
    return Math.round((met / sorted.length) * 100);
}

function median(sorted: number[]): number {
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * "¿Tu build llega?": el jugador escribe sus stats y ve qué parte de los mínimos que piden las
 * builds de la web cumple en cada uno, y cuál le falta más respecto de la mediana.
 */
export function MyBuildCheck({ heroSlug }: { heroSlug: string }) {
    const { t } = useTranslations();
    const [mine, setMine] = useState<Partial<Record<StatKey, string>>>({});

    const { data: distribution } = useQuery<Distribution>({
        queryKey: ['stat-distribution', heroSlug],
        queryFn: async () => (await heroApi.statDistribution(heroSlug)).data?.data ?? {},
        staleTime: 5 * 60 * 1000,
    });

    const comparable = useMemo(
        () => STAT_FIELDS.filter(({ key }) => (distribution?.[key]?.length ?? 0) >= MIN_BUILDS),
        [distribution],
    );

    const results = useMemo(() => comparable
        .map(({ key, label }) => {
            const value = Number(mine[key]);
            const sorted = distribution![key]!;
            if (!mine[key] || !Number.isFinite(value)) return null;
            const mid = median(sorted);
            return { key, label, share: shareMet(sorted, value), median: mid, gap: (mid - value) / mid };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null), [comparable, distribution, mine]);

    const furthest = results.filter((r) => r.gap > 0).sort((a, b) => b.gap - a.gap)[0];

    if (!distribution) return null;

    return (
        <section aria-labelledby="my-build-check-title" className="hero-sheet__panel p-4 sm:p-5">
            <h2 id="my-build-check-title" className="hero-sheet__label font-sans">{t('heroes.myBuildCheck', 'Does your build make it?')}</h2>
            {comparable.length === 0 ? (
                <p className="mt-3 text-sm text-night-muted">
                    {t('heroes.myBuildCheckFew', 'Not enough builds with minimum stats to compare yet (at least {count} per stat).').replace('{count}', String(MIN_BUILDS))}
                </p>
            ) : (
                <>
                    <p className="mt-1 text-sm text-night-muted">
                        {t('heroes.myBuildCheckHint', 'Type your hero’s stats to see how many builds’ minimums you already meet.')}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {comparable.map(({ key, label }) => (
                            <label key={key} className="text-xs text-night-muted">
                                {label}
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min={0}
                                    value={mine[key] ?? ''}
                                    onChange={(e) => setMine({ ...mine, [key]: e.target.value })}
                                    className="mt-1 w-full rounded-md border border-night-line bg-night px-2 py-1.5 font-mono text-sm text-slate-100 focus:border-e7-gold focus:outline-none"
                                />
                            </label>
                        ))}
                    </div>

                    {results.length > 0 && (
                        <div aria-live="polite">
                            <ul className="mt-4 space-y-2">
                                {results.map((r) => (
                                    <li key={r.key} className="flex items-center gap-3 text-sm">
                                        <span className="w-14 font-mono text-xs text-night-muted">{r.label}</span>
                                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-night-line" aria-hidden>
                                            <span className="block h-full bg-e7-gold" style={{ width: `${r.share}%` }} />
                                        </span>
                                        <span className="w-48 shrink-0 text-right text-slate-200">
                                            {t('heroes.meetsShare', 'Meets {share}% of builds').replace('{share}', String(r.share))}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            {furthest && (
                                <p className="mt-3 text-sm text-amber-200">
                                    {t('heroes.furthestStat', 'Furthest behind: {stat} (builds usually ask for {median}).')
                                        .replace('{stat}', furthest.label)
                                        .replace('{median}', String(Math.round(furthest.median)))}
                                </p>
                            )}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
