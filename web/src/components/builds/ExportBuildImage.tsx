'use client';

import { useState } from 'react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/useTranslations';

interface ExportBuildImageProps {
    buildRef: React.RefObject<HTMLDivElement | null>;
    heroName: string;
    buildTitle: string;
}

/**
 * ExportBuildImage - Button to export build card as PNG image
 * Uses html2canvas to capture the build card element
 */
export function ExportBuildImage({ buildRef, heroName, buildTitle }: ExportBuildImageProps) {
    const { t } = useTranslations();
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!buildRef.current) return;

        setIsExporting(true);

        try {
            // Clone the element to avoid modifying the original
            const element = buildRef.current;

            // Configure html2canvas with improved settings for cross-origin images
            const canvas = await html2canvas(element, {
                backgroundColor: '#0a0a0f', // e7-void background
                scale: 2, // Higher quality
                useCORS: true, // Allow cross-origin images
                allowTaint: false, // Don't allow tainted canvas
                logging: false,
                imageTimeout: 15000, // Longer timeout for images
                onclone: (clonedDoc) => {
                    // Find all images in the cloned document and add crossorigin attribute
                    const images = clonedDoc.querySelectorAll('img');
                    images.forEach((img) => {
                        img.crossOrigin = 'anonymous';
                    });
                },
            });

            // Convert to PNG and download
            const link = document.createElement('a');
            const filename = `${heroName.toLowerCase().replace(/\s+/g, '-')}-${buildTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Failed to export build image:', error);
            alert(t('builds.exportError', 'Failed to export image. Please try again.'));
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
                t('builds.exporting', 'Exporting...')
            ) : (
                t('builds.exportImage', 'Export Image')
            )}
        </Button>
    );
}
