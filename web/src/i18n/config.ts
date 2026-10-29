// Configuración de idiomas compartida entre servidor y cliente.

export const SUPPORTED_LOCALES = ['en', 'es', 'ko', 'ja', 'zh', 'pt'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** Cookie que el servidor lee para renderizar en el idioma del usuario. */
export const LOCALE_COOKIE = 'locale';
/** Clave anterior en localStorage; se migra a la cookie una sola vez. */
export const LEGACY_LOCALE_STORAGE_KEY = 'e7_locale';

export function isLocale(value: unknown): value is Locale {
    return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** Textos de UI + artefactos + glosario de un idioma (las skills van aparte, por héroe). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON anidado, se lee por clave con t()
export type Messages = Record<string, any>;

/** Textos traducidos de las skills de un héroe: S1, S2, S3... */
export type HeroSkillMessages = Record<string, { name?: string; description?: string; soulburn_effect?: string }>;
