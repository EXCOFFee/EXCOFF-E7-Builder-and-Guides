/**
 * Translates artifact names using the translations from messages/artifacts/{locale}.json
 * 
 * Usage:
 * import { useArtifactTranslation } from '@/lib/artifactTranslation';
 * const { translateArtifact } = useArtifactTranslation();
 * <span>{translateArtifact(artifact.name)}</span>
 */

import { useTranslations } from '@/hooks/useTranslations';

export function useArtifactTranslation() {
    const { messages } = useTranslations();

    /**
     * Translate an artifact name to the current locale
     * Falls back to the original name if no translation is found
     */
    const translateArtifact = (artifactName: string): string => {
        if (!artifactName) return artifactName;

        // Get artifact translations from messages
        const artifactTranslations = messages?.artifacts || {};

        // Try to find translation by exact name match
        if (artifactTranslations[artifactName]) {
            return artifactTranslations[artifactName];
        }

        // Fallback to original name
        return artifactName;
    };

    return { translateArtifact };
}

/**
 * Helper function for non-React contexts (requires messages to be passed)
 */
export function translateArtifactName(
    artifactName: string,
    artifactTranslations: Record<string, string>
): string {
    if (!artifactName) return artifactName;
    return artifactTranslations[artifactName] || artifactName;
}
