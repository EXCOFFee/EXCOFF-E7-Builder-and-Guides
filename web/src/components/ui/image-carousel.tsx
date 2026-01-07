'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Lightbox } from './Lightbox';
import { useTranslations } from '@/hooks/useTranslations';

interface ImageCarouselProps {
    images: string[];
    title?: string;
}

export function ImageCarousel({ images, title }: ImageCarouselProps) {
    const { t } = useTranslations();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    const openLightbox = () => {
        setLightboxOpen(true);
    };

    if (!images || images.length === 0) return null;

    return (
        <div className="mb-6">
            {title && (
                <h3 className="text-e7-gold font-semibold mb-2 uppercase tracking-wider">
                    {title}
                </h3>
            )}
            <p className="text-xs text-gray-400 mb-3 italic">
                {t('builds.clickToViewFull', 'Click on image to view full size')}
            </p>

            {/* Main Image */}
            <div className="relative mb-3">
                <div
                    className="relative w-full aspect-video rounded-lg overflow-hidden bg-e7-void cursor-pointer group"
                    onClick={openLightbox}
                >
                    <Image
                        src={images[currentIndex]}
                        alt={`${t('builds.image', 'Image')} ${currentIndex + 1}`}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                        priority
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-sm bg-black/50 px-4 py-2 rounded-full transition-opacity">
                            {t('builds.viewFull', 'View full size')}
                        </span>
                    </div>
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                            aria-label={t('builds.previous', 'Previous')}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); goToNext(); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                            aria-label={t('builds.next', 'Next')}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 px-3 py-1 rounded-full text-xs text-white">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative flex-shrink-0 w-20 h-14 rounded overflow-hidden transition-all ${idx === currentIndex
                                ? 'ring-2 ring-e7-gold opacity-100'
                                : 'opacity-60 hover:opacity-100'
                                }`}
                        >
                            <Image
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Dot Indicators */}
            {images.length > 1 && images.length <= 10 && (
                <div className="flex justify-center gap-2 mt-3">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex
                                ? 'bg-e7-gold w-4'
                                : 'bg-gray-500 hover:bg-gray-400'
                                }`}
                            aria-label={`${t('builds.goToImage', 'Go to image')} ${idx + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <Lightbox
                    images={images}
                    initialIndex={currentIndex}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </div>
    );
}
