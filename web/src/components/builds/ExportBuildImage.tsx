'use client';

import { useState } from 'react';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/useTranslations';

interface ExportBuildImageProps {
    buildRef: React.RefObject<HTMLDivElement | null>;
    heroName: string;
    buildTitle: string;
}

/**
 * ExportBuildImage - Button to export build card as PNG image
 * Uses html-to-image to capture the build card element
 * Proxies external images through /api/proxy-image to bypass CORS
 */
export function ExportBuildImage({ buildRef, heroName, buildTitle }: ExportBuildImageProps) {
    const { t } = useTranslations();
    const [isExporting, setIsExporting] = useState(false);

    /**
     * Preload image through proxy and return data URL
     */
    const loadImageAsDataUrl = async (url: string): Promise<string> => {
        // Skip if already data URL or relative
        if (url.startsWith('data:') || url.startsWith('/')) {
            // For relative URLs, still need to proxy if they point to external
            if (url.startsWith('/') && !url.startsWith('/api/')) {
                return url;
            }
            return url;
        }

        try {
            // Use our proxy endpoint
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error('Failed to load');

            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.warn('Failed to proxy image:', url, error);
            return url; // Return original URL as fallback
        }
    };

    const handleExport = async () => {
        if (!buildRef.current) return;

        setIsExporting(true);

        try {
            const element = buildRef.current;

            // Step 1: Find all images in the element and preload them through proxy
            const images = element.querySelectorAll('img');
            const originalSources: Map<HTMLImageElement, string> = new Map();

            // Preload all external images through proxy
            await Promise.all(
                Array.from(images).map(async (img) => {
                    const src = img.src;
                    if (!src || src.startsWith('data:')) return;

                    // Store original src
                    originalSources.set(img, src);

                    // Check if it's an external image (not from our domain)
                    const isExternal = src.includes('hostingersite.com') ||
                        src.includes('googleusercontent.com') ||
                        src.includes('epic7db.com') ||
                        (src.startsWith('http') && !src.includes(window.location.hostname));

                    if (isExternal) {
                        try {
                            const dataUrl = await loadImageAsDataUrl(src);
                            img.src = dataUrl;
                        } catch (error) {
                            console.warn('Failed to preload image:', src, error);
                        }
                    }
                })
            );

            // Small delay to let browser update image sources
            await new Promise(resolve => setTimeout(resolve, 100));

            // Step 2: Export the element with all images now inlined
            const dataUrl = await toPng(element, {
                backgroundColor: '#0a0a0f',
                pixelRatio: 2,
                cacheBust: true,
                imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIBNVYlKAAAAABJRU5ErkJggg==',
                filter: (node) => {
                    if (node instanceof HTMLScriptElement) return false;
                    if (node instanceof HTMLStyleElement) return false;
                    return true;
                },
            });

            // Step 3: Restore original image sources
            originalSources.forEach((originalSrc, img) => {
                img.src = originalSrc;
            });

            // Download the image
            const link = document.createElement('a');
            const filename = `${heroName.toLowerCase().replace(/\s+/g, '-')}-${buildTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
            link.download = filename;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Failed to export build image:', error);
            alert(t('builds.exportError', 'Error al exportar la imagen. Por favor intenta de nuevo.'));
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20 flex items-center gap-2"
        >
            {isExporting ? (
                t('builds.exporting', 'Exportando...')
            ) : (
                t('builds.exportImage', 'Exportar Imagen')
            )}
        </Button>
    );
}

