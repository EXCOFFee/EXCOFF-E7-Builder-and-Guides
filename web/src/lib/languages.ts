// Idiomas de las builds y guías (filtro por idioma). Las etiquetas salen de messages/*.json
// (language.*); antes cada página tenía su propia lista con "All Languages" en inglés.

export const CONTENT_LANGUAGES = ['all', 'en', 'es', 'pt', 'ko', 'ja', 'zh'] as const;
export type ContentLanguage = (typeof CONTENT_LANGUAGES)[number];

/** Nombre del idioma (cada uno en su propio idioma; "all" traducido) */
export function languageLabel(code: string, t: (key: string, fallback: string) => string): string {
    const native: Record<string, string> = {
        en: 'English',
        es: 'Español',
        pt: 'Português',
        ko: '한국어',
        ja: '日本語',
        zh: '中文',
    };
    return code === 'all' ? t('language.all', 'All Languages') : native[code] ?? code;
}
