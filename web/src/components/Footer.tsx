'use client';

import { useTranslations } from '@/hooks/useTranslations';

export function Footer() {
    const { t } = useTranslations();

    return (
        <footer className="border-t border-e7-gold/10 glass-panel py-8 mt-12">
            <div className="container mx-auto px-4 text-center">
                <p className="mb-3 text-slate-400">
                    {t('footer.dataPoweredBy', 'Hero & Artifact data powered by')}{' '}
                    <a
                        href="https://github.com/fribbels/Fribbels-Epic-7-Optimizer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-e7-gold hover:text-e7-text-gold transition-colors underline decoration-e7-gold/30 hover:decoration-e7-gold"
                    >
                        Fribbels Epic 7 Optimizer
                    </a>
                    {' | '}
                    <a
                        href="/credits"
                        className="text-e7-gold hover:text-e7-text-gold transition-colors underline decoration-e7-gold/30 hover:decoration-e7-gold"
                    >
                        {t('footer.credits', 'Credits')}
                    </a>
                </p>
                <p className="text-xs text-slate-500">
                    {t('footer.disclaimer', 'Epic Seven © Smilegate & Super Creative. This site is not affiliated with the game developers.')}
                </p>
            </div>
        </footer>
    );
}
