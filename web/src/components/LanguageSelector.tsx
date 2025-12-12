'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

const locales = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
];

export function LanguageSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { locale, setLocale } = useTranslations();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLocaleChange = (localeCode: string) => {
        setLocale(localeCode);
        setIsOpen(false);
    };

    const currentLocaleData = locales.find(l => l.code === locale) || locales[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-e7-panel border border-e7-gold/30 hover:border-e7-gold/50 transition-colors"
                aria-label="Select language"
            >
                <span className="text-lg">{currentLocaleData.flag}</span>
                <span className="text-sm text-gray-300 hidden sm:inline">{currentLocaleData.code.toUpperCase()}</span>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-e7-panel border border-e7-gold/30 shadow-xl z-50">
                    {locales.map((loc) => (
                        <button
                            key={loc.code}
                            onClick={() => handleLocaleChange(loc.code)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-e7-gold/10 first:rounded-t-lg last:rounded-b-lg transition-colors ${locale === loc.code ? 'bg-e7-gold/20 text-e7-gold' : 'text-gray-300'
                                }`}
                        >
                            <span className="text-xl">{loc.flag}</span>
                            <span className="text-sm">{loc.name}</span>
                            {locale === loc.code && (
                                <svg className="w-4 h-4 ml-auto text-e7-gold" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
