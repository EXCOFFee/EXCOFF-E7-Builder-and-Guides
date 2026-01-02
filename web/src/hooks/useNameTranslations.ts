import { useLocale } from 'next-intl';

// Import hero translations for each locale
import heroKo from '../../messages/heroes/ko.json';
import heroJa from '../../messages/heroes/ja.json';
import heroZh from '../../messages/heroes/zh.json';

// Import artifact translations for each locale
import artifactKo from '../../messages/artifacts/ko.json';
import artifactJa from '../../messages/artifacts/ja.json';
import artifactZh from '../../messages/artifacts/zh.json';

type HeroTranslations = Record<string, string>;
type ArtifactTranslations = Record<string, string>;

const heroTranslations: Record<string, HeroTranslations> = {
    ko: heroKo,
    ja: heroJa,
    zh: heroZh,
};

const artifactTranslations: Record<string, ArtifactTranslations> = {
    ko: artifactKo,
    ja: artifactJa,
    zh: artifactZh,
};

/**
 * Hook to translate hero names based on current locale
 * For Asian languages (ko, ja, zh), returns translated names
 * For other languages (en, es, pt), returns original English names
 */
export function useHeroTranslations() {
    const locale = useLocale();

    const translateHeroName = (englishName: string): string => {
        // Only translate for Asian languages
        if (locale === 'ko' || locale === 'ja' || locale === 'zh') {
            const translations = heroTranslations[locale];
            if (translations && translations[englishName]) {
                return translations[englishName];
            }
        }
        // Return original name for en, es, pt or if no translation found
        return englishName;
    };

    const translateArtifactName = (englishName: string): string => {
        // Only translate for Asian languages
        if (locale === 'ko' || locale === 'ja' || locale === 'zh') {
            const translations = artifactTranslations[locale];
            if (translations && translations[englishName]) {
                return translations[englishName];
            }
        }
        // Return original name for en, es, pt or if no translation found
        return englishName;
    };

    return {
        translateHeroName,
        translateArtifactName,
        locale,
        isAsianLocale: locale === 'ko' || locale === 'ja' || locale === 'zh',
    };
}

// Non-hook version for use in server components or contexts where hooks aren't available
export function getHeroTranslation(englishName: string, locale: string): string {
    if (locale === 'ko' || locale === 'ja' || locale === 'zh') {
        const translations = heroTranslations[locale];
        if (translations && translations[englishName]) {
            return translations[englishName];
        }
    }
    return englishName;
}

export function getArtifactTranslation(englishName: string, locale: string): string {
    if (locale === 'ko' || locale === 'ja' || locale === 'zh') {
        const translations = artifactTranslations[locale];
        if (translations && translations[englishName]) {
            return translations[englishName];
        }
    }
    return englishName;
}
