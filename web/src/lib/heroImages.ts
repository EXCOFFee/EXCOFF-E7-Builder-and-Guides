/**
 * Versión en las URLs de imágenes para que el navegador y Vercel tomen las actualizadas.
 *
 * Ojo con la cuota de Vercel: cada URL distinta es una imagen nueva para optimizar. Antes la
 * versión cambiaba cada hora, así que todas las imágenes se volvían a optimizar cada hora.
 * Ahora cambia una vez por mes (lo mismo que dura el caché de Vercel, minimumCacheTTL = 31
 * días), o cuando se pasa el updated_at de la imagen. Las de CeciliaBot también la llevan:
 * apuntan a una rama de GitHub y el archivo de una ruta puede cambiar.
 */

// Versión por mes (YYYYMM) en UTC: el servidor y el navegador generan la misma URL,
// así la imagen renderizada en el servidor no cambia al hidratar ni se descarga dos veces
function getMonthlyVersion(): string {
    return new Date().toISOString().slice(0, 7).replace('-', '');
}

/**
 * URL de imagen con versión
 * @param imageUrl - The original image URL
 * @param updatedAt - updated_at de la imagen si se conoce (cambia la versión solo cuando cambia ella)
 */
export function appendImageVersion(imageUrl: string | null | undefined, updatedAt?: string): string {
    if (!imageUrl) return '';

    // "2026-01-08T10:30:00Z" -> "20260108103000"
    const version = updatedAt ? updatedAt.replace(/[-:TZ]/g, '').slice(0, 14) : getMonthlyVersion();
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}v=${version}`;
}
