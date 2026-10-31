import Image from 'next/image';
import { appendImageVersion } from '@/lib/heroImages';
import { CLASS_IMAGES } from '@/lib/heroAssets';

/** Tamaño de los banners `_su` del juego (algunos son más angostos: quedan centrados) */
export const BANNER_WIDTH = 436;
export const BANNER_HEIGHT = 206;

interface HeroBannerProps {
    src: string | null | undefined;
    alt: string;
    element: string;
    /** Clase del héroe: su ícono se muestra si todavía no hay imagen */
    heroClass?: string;
    priority?: boolean;
    className?: string;
}

/**
 * Retrato del héroe en su forma original (banner ancho), sin recortarlo a un cuadrado ni
 * agrandarlo: el contenedor no pasa de 436 px, el ancho real de la imagen. Antes se recortaba
 * el centro (206 px) y se estiraba a 240–480 px, por eso se veía borroso.
 *
 * Tamaño fijo (no `fill`): Next arma solo dos variantes (436 y 1080 px; la de 1080 sale del
 * mismo original). Con `fill` + `sizes` pedía hasta 8 anchos por héroe y gastaba la cuota.
 */
export function HeroBanner({ src, alt, element, heroClass, priority = false, className = '' }: HeroBannerProps) {
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
                    width={BANNER_WIDTH}
                    height={BANNER_HEIGHT}
                    priority={priority}
                    className="h-full w-full object-contain"
                />
            ) : heroClass && CLASS_IMAGES[heroClass] ? (
                <span className="flex h-full w-full items-center justify-center">
                    <Image src={CLASS_IMAGES[heroClass]} alt={alt} width={64} height={64} className="h-16 w-16 opacity-40" />
                </span>
            ) : null}
        </div>
    );
}
