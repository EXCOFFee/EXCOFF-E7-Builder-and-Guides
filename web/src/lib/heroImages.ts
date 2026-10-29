/**
 * Versión en las URLs de imágenes para que el navegador y Vercel tomen las actualizadas.
 *
 * Ojo con la cuota de Vercel: cada URL distinta es una imagen nueva para optimizar. Antes la
 * versión cambiaba cada hora, así que todas las imágenes se volvían a optimizar cada hora.
 * Ahora: las de CeciliaBot (GitHub) no llevan versión (una ruta no cambia de contenido) y las
 * del servidor propio cambian una vez por día, o cuando se pasa su updated_at.
 */

// Versión por día (YYYYMMDD) en UTC: el servidor y el navegador generan la misma URL,
// así la imagen renderizada en el servidor no cambia al hidratar ni se descarga dos veces
function getDailyVersion(): string {
    return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

/** Imágenes de repositorios públicos: cada ruta es un archivo fijo, no hace falta versión */
function isImmutableSource(url: string): boolean {
    return url.startsWith('https://raw.githubusercontent.com/');
}

/**
 * Get hero image URL with cache-busting version
 */
export function getHeroImageUrl(
    heroCodeOrSlug: string,
    size: 's' | 'l' = 's',
    apiUrl: string = ''
): string {
    const baseUrl = apiUrl || (process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '');
    const url = `${baseUrl}/images/heroes/${heroCodeOrSlug}_${size}.png`;
    return `${url}?v=${getDailyVersion()}`;
}

/**
 * Get image URL with cache-busting version
 * @param imageUrl - The original image URL
 * @param updatedAt - Optional updated_at timestamp from API for more precise cache invalidation
 */
export function appendImageVersion(imageUrl: string | null | undefined, updatedAt?: string): string {
    if (!imageUrl) return '';
    if (isImmutableSource(imageUrl)) return imageUrl;

    // updated_at si se conoce; si no, la versión del día
    let version: string;
    if (updatedAt) {
        // Use timestamp from updated_at (e.g., "2026-01-08T10:30:00Z" -> "20260108103000")
        version = updatedAt.replace(/[-:TZ]/g, '').slice(0, 14);
    } else {
        version = getDailyVersion();
    }

    // Check if URL already has query params
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}v=${version}`;
}
