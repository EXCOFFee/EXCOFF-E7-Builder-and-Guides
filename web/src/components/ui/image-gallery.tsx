'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Lightbox } from './Lightbox';
import { useTranslations } from '@/hooks/useTranslations';

interface ImageGalleryProps {
    images: string[];
    title?: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
    const { t } = useTranslations();
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const openLightbox = (index: number) => {
        setSelectedIndex(index);
        setLightboxOpen(true);
    };

    const displayTitle = title || t('common.images', 'Images');

    return (
        <div className="mb-6">
            <h3 className="text-xl font-display font-semibold text-transparent bg-clip-text bg-gradient-to-r from-e7-text-gold to-e7-gold mb-3">
                {displayTitle}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
                {t('common.clickImage', 'Click on an image to view full size')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {images.map((img, idx) => (
                    <div
                        key={idx}
                        className="relative aspect-video rounded-xl overflow-hidden bg-e7-void cursor-pointer group hover:ring-2 hover:ring-e7-gold/50 transition-all shadow-lg"
                        onClick={() => openLightbox(idx)}
                    >
                        <Image
                            src={img}
                            alt={`${t('common.image', 'Image')} ${idx + 1}`}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 text-white text-base font-medium bg-black/60 px-4 py-2 rounded-full transition-opacity">
                                {t('common.viewFull', 'View full size')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <Lightbox
                    images={images}
                    initialIndex={selectedIndex}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </div>
    );
}
