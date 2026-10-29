'use client';

import { useState, useRef, useEffect, useId, KeyboardEvent } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import type { Locale } from '@/i18n/config';

// Nombre de cada idioma en su propio idioma. Sin banderas: Windows no tiene emojis de bandera
// (se veían como "US"/"ES") y una bandera es un país, no un idioma.
const LOCALES: { code: Locale; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'pt', name: 'Português' },
    { code: 'ko', name: '한국어' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '简体中文' },
];

function GlobeIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" strokeWidth={1.75} />
            <path strokeWidth={1.75} strokeLinecap="round" d="M3 12h18M12 3c2.5 2.7 3.75 5.7 3.75 9S14.5 18.3 12 21c-2.5-2.7-3.75-5.7-3.75-9S9.5 5.7 12 3z" />
        </svg>
    );
}

export function LanguageSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const listId = useId();
    const { locale, setLocale, isChangingLocale, t } = useTranslations();

    const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

    // Cerrar al hacer clic afuera
    useEffect(() => {
        if (!isOpen) return;
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Al abrir, el foco va al idioma actual
    useEffect(() => {
        if (isOpen) optionRefs.current[LOCALES.indexOf(current)]?.focus();
    }, [isOpen, current]);

    const close = () => {
        setIsOpen(false);
        buttonRef.current?.focus();
    };

    const choose = (code: Locale) => {
        setLocale(code);
        close();
    };

    const handleListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
        const index = optionRefs.current.findIndex((el) => el === document.activeElement);
        const move = (to: number) => optionRefs.current[(to + LOCALES.length) % LOCALES.length]?.focus();
        if (event.key === 'Escape') {
            event.preventDefault();
            close();
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            move(index + 1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            move(index - 1);
        } else if (event.key === 'Home') {
            event.preventDefault();
            move(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            move(LOCALES.length - 1);
        } else if (event.key === 'Tab') {
            setIsOpen(false);
        }
    };

    const label = t('language.selectLanguage', 'Language');

    return (
        <div className="relative" ref={containerRef}>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
                aria-controls={listId}
                aria-label={`${label}: ${current.name}`}
                aria-busy={isChangingLocale}
                className="flex items-center gap-2 h-10 px-3 rounded-lg bg-e7-panel border border-e7-gold/30 hover:border-e7-gold/50 text-slate-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-e7-gold"
            >
                {isChangingLocale ? (
                    <span className="w-5 h-5 rounded-full border-2 border-e7-gold/30 border-t-e7-gold animate-spin" aria-hidden="true" />
                ) : (
                    <GlobeIcon className="w-5 h-5 text-e7-gold" />
                )}
                <span lang={current.code} className="text-sm hidden sm:inline">{current.name}</span>
                <span className="text-sm font-semibold sm:hidden" aria-hidden="true">{current.code.toUpperCase()}</span>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <ul
                    id={listId}
                    aria-label={label}
                    onKeyDown={handleListKeyDown}
                    className="absolute right-0 mt-2 w-48 py-1 rounded-lg bg-e7-panel border border-e7-gold/30 shadow-xl z-50"
                >
                    {LOCALES.map((loc, index) => {
                        const active = loc.code === locale;
                        return (
                            <li key={loc.code}>
                                <button
                                    ref={(el) => {
                                        optionRefs.current[index] = el;
                                    }}
                                    type="button"
                                    lang={loc.code}
                                    onClick={() => choose(loc.code)}
                                    aria-current={active ? 'true' : undefined}
                                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-e7-gold/10 focus-visible:bg-e7-gold/10 focus-visible:outline-none ${
                                        active ? 'text-e7-gold font-semibold' : 'text-slate-200'
                                    }`}
                                >
                                    <span>{loc.name}</span>
                                    <span className="text-xs text-gray-400 uppercase" aria-hidden="true">
                                        {active ? (
                                            <svg className="w-4 h-4 text-e7-gold" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            loc.code
                                        )}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
