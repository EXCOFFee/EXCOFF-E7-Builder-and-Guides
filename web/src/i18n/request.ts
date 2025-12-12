import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['en', 'es', 'ko', 'ja', 'zh', 'pt'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
    en: 'English',
    es: 'Español',
    ko: '한국어',
    ja: '日本語',
    zh: '中文',
    pt: 'Português',
};

export const defaultLocale: Locale = 'en';

export default getRequestConfig(async () => {
    // Get locale from cookie or use default
    const cookieStore = await cookies();
    const locale = (cookieStore.get('locale')?.value as Locale) || defaultLocale;

    let messages;
    try {
        messages = (await import(`../../messages/${locale}.json`)).default;
    } catch {
        // Fallback to English if locale file doesn't exist
        messages = (await import(`../../messages/en.json`)).default;
    }

    return {
        locale,
        messages,
    };
});
