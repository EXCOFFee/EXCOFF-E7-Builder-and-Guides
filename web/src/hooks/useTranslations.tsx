'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

type Messages = Record<string, any>;

interface TranslationContextType {
    locale: string;
    messages: Messages;
    t: (key: string, fallback?: string) => string;
    setLocale: (locale: string) => void;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

// Get nested value from object by dot notation
function getNestedValue(obj: any, path: string): string | undefined {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

// All supported locales
const SUPPORTED_LOCALES = ['en', 'es', 'ko', 'ja', 'zh', 'pt'];
const DEFAULT_LOCALE = 'en';

// Messages cache
const messagesCache: Record<string, Messages> = {};

// Load messages for a locale
async function loadMessages(locale: string): Promise<Messages> {
    const validLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;

    // Return cached if available
    if (messagesCache[validLocale]) {
        return messagesCache[validLocale];
    }

    try {
        const messages = await import(`../../messages/${validLocale}.json`);
        messagesCache[validLocale] = messages.default;
        return messages.default;
    } catch (error) {
        console.error(`Failed to load messages for ${validLocale}:`, error);
        if (validLocale !== 'en') {
            return loadMessages('en');
        }
        return {};
    }
}

// Get saved locale from localStorage (more reliable than cookies in Next.js)
function getSavedLocale(): string {
    if (typeof window === 'undefined') return DEFAULT_LOCALE;

    // Try localStorage first
    const fromStorage = localStorage.getItem('e7_locale');
    if (fromStorage && SUPPORTED_LOCALES.includes(fromStorage)) {
        return fromStorage;
    }

    // Fallback to cookie
    const match = document.cookie.match(/locale=([^;]+)/);
    if (match && SUPPORTED_LOCALES.includes(match[1])) {
        return match[1];
    }

    return DEFAULT_LOCALE;
}

// Save locale to both localStorage and cookie
function saveLocale(locale: string): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem('e7_locale', locale);
    document.cookie = `locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
    console.log('[i18n] Locale saved:', locale);
}

export function TranslationProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
    const [messages, setMessages] = useState<Messages>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Load locale on mount
    useEffect(() => {
        const savedLocale = getSavedLocale();
        console.log('[i18n] Loading saved locale:', savedLocale);
        setLocaleState(savedLocale);

        loadMessages(savedLocale).then((msgs) => {
            console.log('[i18n] Messages loaded:', Object.keys(msgs));
            setMessages(msgs);
            setIsLoaded(true);
        });
    }, []);

    // Update HTML lang attribute when locale changes (SEO improvement)
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.lang = locale;
        }
    }, [locale]);

    const setLocale = (newLocale: string) => {
        console.log('[i18n] setLocale called with:', newLocale);

        if (!SUPPORTED_LOCALES.includes(newLocale)) {
            console.error('[i18n] Invalid locale:', newLocale);
            return;
        }

        saveLocale(newLocale);
        setLocaleState(newLocale);

        loadMessages(newLocale).then((msgs) => {
            console.log('[i18n] New messages loaded for:', newLocale);
            setMessages(msgs);
        });
    };

    const t = (key: string, fallback?: string): string => {
        const value = getNestedValue(messages, key);
        return value ?? fallback ?? key;
    };

    // Show loading with video while loading translations
    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-e7-void flex items-center justify-center">
                <div className="text-center">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-32 h-32 mx-auto"
                    >
                        <source src="/videos/RasRun.mp4" type="video/mp4" />
                    </video>
                    <p className="text-gray-400 mt-2">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <TranslationContext.Provider value={{ locale, messages, t, setLocale }}>
            {children}
        </TranslationContext.Provider>
    );
}

export function useTranslations() {
    const context = useContext(TranslationContext);
    if (!context) {
        console.warn('[i18n] useTranslations called outside of TranslationProvider');
        return {
            locale: DEFAULT_LOCALE,
            messages: {},
            t: (key: string, fallback?: string) => fallback ?? key,
            setLocale: () => console.warn('[i18n] setLocale not available'),
        };
    }
    return context;
}
