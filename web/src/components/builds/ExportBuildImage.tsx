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

            // Clone the element to avoid modifying the original
            const clone = element.cloneNode(true) as HTMLElement;
            clone.style.position = 'absolute';
            clone.style.left = '-9999px';
            clone.style.top = '-9999px';
            document.body.appendChild(clone);

            // Find all images and convert external ones to data URLs
            const images = clone.querySelectorAll('img');
            const imagePromises: Promise<void>[] = [];

            images.forEach((img) => {
                const src = img.getAttribute('src');
                if (src && (src.includes('hostingersite.com') || src.includes('epic7db.com'))) {
                    // Remove query params for cleaner proxy URL
                    const cleanSrc = src.split('?')[0];
                    const promise = loadImageAsDataUrl(cleanSrc).then((dataUrl) => {
                        img.setAttribute('src', dataUrl);
                    });
                    imagePromises.push(promise);
                }
            });

            // Wait for all images to be converted
            await Promise.all(imagePromises);

            // Now export the clone with data URLs
            const dataUrl = await toPng(clone, {
                backgroundColor: '#0a0a0f',
                pixelRatio: 2,
                cacheBust: true,
            });

            // Clean up the clone
            document.body.removeChild(clone);

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

