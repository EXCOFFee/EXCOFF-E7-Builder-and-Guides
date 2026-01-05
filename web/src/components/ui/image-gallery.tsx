'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Lightbox } from './Lightbox';

interface ImageGalleryProps {
    images: string[];
    title?: string;
}

export function ImageGallery({ images, title = 'Imágenes' }: ImageGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const openLightbox = (index: number) => {
        setSelectedIndex(index);
        setLightboxOpen(true);
    };

    return (
        <div className="mb-6">
            <h3 className="text-e7-gold font-semibold mb-2">{title}</h3>
            <p className="text-xs text-gray-400 mb-3 italic">
                Haz clic en una imagen para verla en tamaño completo
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((img, idx) => (
                    <div
                        key={idx}
                        className="relative aspect-video rounded-lg overflow-hidden bg-e7-void cursor-pointer group hover:ring-2 hover:ring-e7-gold/50 transition-all"
                        onClick={() => openLightbox(idx)}
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
