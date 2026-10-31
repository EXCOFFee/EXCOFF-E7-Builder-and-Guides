'use client';

import { useTranslations } from '@/hooks/useTranslations';

/**
 * Build verificada: un moderador comparó la captura del juego con sus stats. El autor ve
 * también si está en revisión o fue rechazada (`showPending`).
 */
export function VerifiedBadge({ status, showPending = false, className = '' }: { status?: string | null; showPending?: boolean; className?: string }) {
    const { t } = useTranslations();

    if (status === 'verified') {
        return (
            <span
                title={t('builds.verifiedHint', 'A moderator checked the in-game screenshot against these stats.')}
                className={`inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300 ${className}`}
            >
                ✓ {t('builds.verified', 'Verified')}
            </span>
        );
    }
    if (!showPending || (status !== 'pending' && status !== 'rejected')) return null;

    return (
        <span className={`inline-flex items-center rounded-full border border-gray-500/40 px-2 py-0.5 text-xs text-gray-300 ${className}`}>
            {status === 'pending'
                ? t('builds.verificationPending', 'Screenshot under review')
                : t('builds.verificationRejected', 'Screenshot not accepted: check that it shows these stats')}
        </span>
    );
}
