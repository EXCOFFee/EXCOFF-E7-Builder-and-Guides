'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
    images: string[];
    title?: string;
}

export function ImageGallery({ images, title = 'Imágenes' }: ImageGalleryProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (expandedIndex === null) return;
        if (e.key === 'Escape') setExpandedIndex(null);
        if (e.key === 'ArrowLeft') handlePrev(e as unknown as React.MouseEvent);
        if (e.key === 'ArrowRight') handleNext(e as unknown as React.MouseEvent);
    };

    return (
        <div className="mb-6">
            <h3 className="text-e7-gold font-semibold mb-2">📷 {title}</h3>
            <p className="text-xs text-gray-400 mb-3 italic">
                💡 Haz clic en una imagen para verla en tamaño completo
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((img, idx) => (
                    <div
                        key={idx}
                        className="relative aspect-video rounded-lg overflow-hidden bg-e7-void cursor-pointer group hover:ring-2 hover:ring-e7-gold/50 transition-all"
                        onClick={() => {
                            setExpandedIndex(idx);
                            setCurrentIndex(idx);
                        }}
                    >
                        <Image
                            src={img}
                            alt={`Imagen ${idx + 1}`}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 text-white text-sm bg-black/50 px-3 py-1 rounded-full transition-opacity">
                                🔍 Ver completa
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de imagen expandida */}
            {expandedIndex !== null && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
                    onClick={() => setExpandedIndex(null)}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                >
                    {/* Botón cerrar */}
                    <button
                        className="absolute top-4 right-4 text-white text-4xl hover:text-e7-gold z-10"
                        onClick={() => setExpandedIndex(null)}
                    >
                        ✕
                    </button>

                    {/* Navegación */}
                    {images.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-e7-gold z-10 bg-black/50 w-16 h-16 rounded-full flex items-center justify-center"
                                onClick={handlePrev}
                            >
                                ‹
                            </button>
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-e7-gold z-10 bg-black/50 w-16 h-16 rounded-full flex items-center justify-center"
                                onClick={handleNext}
                            >
                                ›
                            </button>
                        </>
                    )}

                    {/* Imagen */}
                    <div className="relative w-[90vw] h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={images[currentIndex]}
                            alt={`Imagen ${currentIndex + 1}`}
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </div>

                    {/* Contador */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
                            {currentIndex + 1} / {images.length}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
