'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface LightboxProps {
    images: string[];
    initialIndex?: number;
    onClose: () => void;
}

export function Lightbox({ images, initialIndex = 0, onClose }: LightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const next = () => {
        setCurrentIndex((currentIndex + 1) % images.length);
    };

    const prev = () => {
        setCurrentIndex((currentIndex - 1 + images.length) % images.length);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, onClose]);

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white text-4xl md:text-5xl 
                   w-12 h-12 flex items-center justify-center rounded-lg
                   hover:bg-white/10 transition-all duration-200 z-10"
                aria-label="Close lightbox"
            >
                ×
            </button>

            {/* Image container */}
            <div
                className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={images[currentIndex]}
                    alt={`Image ${currentIndex + 1} of ${images.length}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
            </div>

            {/* Navigation arrows - only show if multiple images */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            prev();
                        }}
                        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2
                       text-white/80 hover:text-white text-5xl md:text-6xl 
                       w-14 h-14 flex items-center justify-center rounded-lg
                       hover:bg-white/10 transition-all duration-200"
                        aria-label="Previous image"
                    >
                        ‹
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            next();
                        }}
                        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2
                       text-white/80 hover:text-white text-5xl md:text-6xl 
                       w-14 h-14 flex items-center justify-center rounded-lg
                       hover:bg-white/10 transition-all duration-200"
                        aria-label="Next image"
                    >
                        ›
                    </button>
                </>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 
                      bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-white text-sm font-medium">
                    {currentIndex + 1} / {images.length}
                </span>
            </div>
        </div>
    );
}
