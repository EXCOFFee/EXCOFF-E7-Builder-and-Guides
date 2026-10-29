import Image from 'next/image';
import { appendImageVersion } from '@/lib/heroImages';

/** Tamaño de los banners `_su` del juego (algunos son más angostos: quedan centrados) */
export const BANNER_WIDTH = 436;
export const BANNER_HEIGHT = 206;

interface HeroBannerProps {
    src: string | null | undefined;
    alt: string;
    element: string;
    /** `sizes` de la imagen: el ancho con que se muestra (nunca más que BANNER_WIDTH) */
    sizes: string;
    priority?: boolean;
    className?: string;
}

/**
 * Retrato del héroe en su forma original (banner ancho), sin recortarlo a un cuadrado ni
 * agrandarlo: el contenedor no pasa de 436 px, el ancho real de la imagen. Antes se recortaba
 * el centro (206 px) y se estiraba a 240–480 px, por eso se veía borroso.
 */
export function HeroBanner({ src, alt, element, sizes, priority = false, className = '' }: HeroBannerProps) {
    return (
        <div
            data-element={element}
            className={`hero-sheet relative aspect-[436/206] w-full max-w-[436px] overflow-hidden ${className}`}
            style={{ background: 'radial-gradient(ellipse at 50% 70%, color-mix(in srgb, var(--el) 28%, transparent), transparent 75%), var(--color-night)' }}
        >
            {src ? (
                <Image
                    src={appendImageVersion(src)}
                    alt={alt}
                    fill
                    sizes={sizes}
                    priority={priority}
                    className="object-contain"
                />
            ) : null}
        </div>
    );
}
