import { formatNumber } from '@/lib/utils';

export const STAT_KEYS = ['atk', 'hp', 'def', 'spd', 'crit_chance', 'crit_dmg', 'eff', 'res'] as const;
export type StatKey = (typeof STAT_KEYS)[number];
export type ClassStatRange = Partial<Record<StatKey, { min: number; median: number; max: number; count: number }>>;

const LABELS: Record<StatKey, string> = {
    atk: 'ATK',
    hp: 'HP',
    def: 'DEF',
    spd: 'SPD',
    crit_chance: 'CRIT',
    crit_dmg: 'C.DMG',
    eff: 'EFF',
    res: 'RES',
};

const PERCENT: ReadonlySet<StatKey> = new Set(['crit_chance', 'crit_dmg', 'eff', 'res']);

/** Valores por defecto del juego cuando la API no trae el dato */
const DEFAULTS: Partial<Record<StatKey, number>> = { crit_chance: 15, crit_dmg: 150 };

/**
 * Stats base como barras dentro del rango de la clase: la barra va del héroe con menos al
 * que tiene más de esa stat, y la marca vertical es la mediana. Sin rango (API caída o stat
 * igual en toda la clase), la fila muestra solo el número.
 */
export function StatLedger({
    stats,
    range,
    className,
    t,
}: {
    stats: Partial<Record<StatKey, number>> | undefined;
    range: ClassStatRange | null;
    className: string;
    t: (key: string, fallback: string) => string;
}) {
    return (
        <dl className="divide-y divide-night-line/60">
            {STAT_KEYS.map((key) => {
                const value = stats?.[key] || DEFAULTS[key] || 0;
                const r = range?.[key];
                const spread = r ? r.max - r.min : 0;
                const suffix = PERCENT.has(key) ? '%' : '';
                const position = (v: number) => (spread ? ((v - r!.min) / spread) * 100 : 0);
                // En stats de porcentaje la diferencia va en puntos (23% vs 15% = +8), no relativa
                const delta = !r ? 0 : PERCENT.has(key)
                    ? Math.round(value - r.median)
                    : r.median ? Math.round(((value - r.median) / r.median) * 100) : 0;
                const medianText = r
                    ? t('heroes.classMedian', 'Median for {class}: {value}')
                          .replace('{class}', className)
                          .replace('{value}', `${formatNumber(r.median)}${suffix}`)
                    : '';

                return (
                    <div key={key} className="grid grid-cols-[3.25rem_1fr_4.75rem] items-center gap-3 py-2.5 sm:grid-cols-[3.75rem_1fr_5.5rem_4.5rem]">
                        <dt className="font-mono text-xs font-semibold tracking-wider text-night-muted">{LABELS[key]}</dt>
                        <dd className="col-start-3 row-start-1 text-right font-mono text-base font-semibold tabular-nums text-slate-100">
                            {formatNumber(value)}
                            {suffix}
                        </dd>
                        <dd className="col-start-2 row-start-1" title={medianText || undefined}>
                            {spread > 0 ? (
                                <div
                                    className="relative h-2 rounded-full bg-night-line/70"
                                    role="img"
                                    aria-label={`${LABELS[key]} ${formatNumber(value)}${suffix}. ${medianText}`}
                                >
                                    <div
                                        className="absolute inset-y-0 left-0 rounded-full bg-el"
                                        style={{ width: `${Math.max(2, Math.min(100, position(value)))}%` }}
                                    />
                                    <div
                                        className="absolute -top-1 -bottom-1 w-0.5 rounded bg-slate-100/80"
                                        style={{ left: `calc(${position(r!.median)}% - 1px)` }}
                                    />
                                </div>
                            ) : (
                                <div className="h-px bg-night-line/70" aria-hidden />
                            )}
                        </dd>
                        <dd className="hidden text-right font-mono text-xs tabular-nums sm:block">
                            {spread > 0 && (
                                <span className={delta > 0 ? 'text-emerald-300' : delta < 0 ? 'text-rose-300' : 'text-night-muted'}>
                                    {delta > 0 ? '+' : ''}
                                    {delta}%
                                </span>
                            )}
                        </dd>
                    </div>
                );
            })}
        </dl>
    );
}
