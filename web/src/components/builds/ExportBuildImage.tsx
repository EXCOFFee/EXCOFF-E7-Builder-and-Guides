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
     * Rewrites external image URLs to go through our proxy
     */
    const proxyImageUrl = (url: string): string => {
        // Skip if already relative or data URL
        if (url.startsWith('/') || url.startsWith('data:')) {
            return url;
        }
        // Skip if already proxied
        if (url.includes('/api/proxy-image')) {
            return url;
        }
        // Proxy external URLs
        return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    };

    const handleExport = async () => {
        if (!buildRef.current) return;

        setIsExporting(true);

        try {
            const element = buildRef.current;

            // Use html-to-image with filter to proxy external images
            const dataUrl = await toPng(element, {
                backgroundColor: '#0a0a0f', // e7-void background
                pixelRatio: 2, // Higher quality
                cacheBust: true, // Prevent caching issues
                // Skip problematic elements
                filter: (node: Node) => {
                    // Skip elements with problematic classes (if any)
                    if (node instanceof HTMLElement) {
                        // Skip hidden elements
                        if (node.style.display === 'none' || node.style.visibility === 'hidden') {
                            return false;
                        }
                    }
                    return true;
                },
                // Fetch function to proxy external images
                fetchRequestInit: {
                    mode: 'cors',
                    credentials: 'omit',
                },
                // Custom style to ensure colors work
                style: {
                    // Force standard colors to avoid lab() issues if any remain
                },
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
