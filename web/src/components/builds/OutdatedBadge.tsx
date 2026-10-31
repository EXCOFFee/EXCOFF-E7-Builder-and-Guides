'use client';

import { useTranslations } from '@/hooks/useTranslations';

/** ¿La build es de antes del último cambio del héroe en el juego (stats, skills o impronta)? */
export function isBuildOutdated(buildUpdatedAt?: string | null, heroChangedAt?: string | null): boolean {
    if (!buildUpdatedAt || !heroChangedAt) return false;
    return new Date(buildUpdatedAt).getTime() < new Date(heroChangedAt).getTime();
}

/** Aviso: el héroe cambió después de esta build (lo detecta data:sync en los datos del juego) */
export function OutdatedBadge({ buildUpdatedAt, heroChangedAt, className = '' }: {
    buildUpdatedAt?: string | null;
    heroChangedAt?: string | null;
    className?: string;
}) {
    const { t } = useTranslations();
    if (!isBuildOutdated(buildUpdatedAt, heroChangedAt)) return null;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-amber-900/30 px-2 py-0.5 text-xs text-amber-200 ${className}`}
            title={t('builds.outdatedHint', 'The hero’s stats or skills changed in the game after this build was last updated.')}
        >
            <span aria-hidden>⚠</span> {t('builds.outdated', 'Hero changed since this build')}
        </span>
    );
}
