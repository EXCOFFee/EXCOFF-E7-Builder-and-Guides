'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
    DEFAULT_LOCALE,
    isLocale,
    LEGACY_LOCALE_STORAGE_KEY,
    Locale,
    LOCALE_COOKIE,
    Messages,
} from '@/i18n/config';

interface TranslationContextType {
    locale: Locale;
    messages: Messages;
    t: (key: string, fallback?: string) => string;
    setLocale: (locale: string) => void;
    /** true mientras el servidor vuelve a renderizar con el idioma nuevo */
    isChangingLocale: boolean;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

function getNestedValue(obj: Messages, path: string): string | undefined {
    const value = path.split('.').reduce<unknown>(
        (current, key) => (current as Record<string, unknown> | undefined)?.[key],
        obj
    );
    return typeof value === 'string' ? value : undefined;
}

function saveLocale(locale: Locale): void {
    document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`;
    try {
        localStorage.setItem(LEGACY_LOCALE_STORAGE_KEY, locale);
    } catch {
        // localStorage bloqueado: la cookie alcanza
    }
}

/**
 * El idioma y los mensajes vienen del servidor (layout lee la cookie), así el HTML inicial
 * ya sale traducido. Cambiar de idioma guarda la cookie y vuelve a pedir el render al servidor.
 */
export function TranslationProvider({
    locale,
    messages,
    children,
}: {
    locale: Locale;
    messages: Messages;
    children: ReactNode;
}) {
    const router = useRouter();
    const [isChangingLocale, startTransition] = useTransition();

    const setLocale = useCallback(
        (newLocale: string) => {
            if (!isLocale(newLocale) || newLocale === locale) return;
            saveLocale(newLocale);
            startTransition(() => router.refresh());
        },
        [locale, router]
    );

    // Usuarios de antes de la cookie: el idioma solo estaba en localStorage
    useEffect(() => {
        if (document.cookie.includes(`${LOCALE_COOKIE}=`)) return;
        let saved: string | null = null;
        try {
            saved = localStorage.getItem(LEGACY_LOCALE_STORAGE_KEY);
        } catch {
            return;
        }
        if (isLocale(saved) && saved !== locale) setLocale(saved);
    }, [locale, setLocale]);

    const value = useMemo<TranslationContextType>(
        () => ({
            locale,
            messages,
            t: (key, fallback) => getNestedValue(messages, key) ?? fallback ?? key,
            setLocale,
            isChangingLocale,
        }),
        [locale, messages, setLocale, isChangingLocale]
    );

    return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslations(): TranslationContextType {
    const context = useContext(TranslationContext);
    if (!context) {
        return {
            locale: DEFAULT_LOCALE,
            messages: {},
            t: (key: string, fallback?: string) => fallback ?? key,
            setLocale: () => {},
            isChangingLocale: false,
        };
    }
    return context;
}
