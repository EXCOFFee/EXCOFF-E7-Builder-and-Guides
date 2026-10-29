import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, HeroSkillMessages, isLocale, Locale, LOCALE_COOKIE, Messages } from './config';

/** Idioma elegido por el usuario (cookie); sin cookie, inglés. */
export async function getLocale(): Promise<Locale> {
    const value = (await cookies()).get(LOCALE_COOKIE)?.value;
    return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** UI + artefactos + glosario. Se serializan en cada página, por eso las skills no van acá. */
export async function getMessages(locale: Locale): Promise<Messages> {
    const [main, artifacts, glossary] = await Promise.all([
        import(`../../messages/${locale}.json`),
        import(`../../messages/artifacts/${locale}.json`),
        import(`../../messages/glossary/${locale}.json`),
    ]);
    return { ...main.default, artifacts: artifacts.default, glossary: glossary.default };
}

/** Skills traducidas de un solo héroe (el archivo completo pesa ~450 KB por idioma). */
export async function getHeroSkillMessages(locale: Locale, heroName: string): Promise<HeroSkillMessages | null> {
    const skills = (await import(`../../messages/skills/${locale}.json`)).default as Record<
        string,
        { skills?: HeroSkillMessages }
    >;
    return skills[heroName]?.skills ?? null;
}
