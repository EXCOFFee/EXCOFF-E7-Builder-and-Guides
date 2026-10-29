/**
 * Hero Image URL utility with cache-busting
 * Uses hour-based timestamp to ensure images refresh every hour
 * This helps with stale cached images after updates
 */

// Versión por hora (YYYYMMDDHH) en UTC: el servidor y el navegador generan la misma URL,
// así la imagen renderizada en el servidor no cambia al hidratar ni se descarga dos veces
function getHourlyVersion(): string {
    return new Date().toISOString().slice(0, 13).replace(/[-T]/g, '');
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
    return `${url}?v=${getHourlyVersion()}`;
}

/**
 * Get image URL with cache-busting version
 * @param imageUrl - The original image URL
 * @param updatedAt - Optional updated_at timestamp from API for more precise cache invalidation
 */
export function appendImageVersion(imageUrl: string | null | undefined, updatedAt?: string): string {
    if (!imageUrl) return '';

    // Use updated_at timestamp if provided, otherwise use hourly version
    let version: string;
    if (updatedAt) {
        // Use timestamp from updated_at (e.g., "2026-01-08T10:30:00Z" -> "20260108103000")
        version = updatedAt.replace(/[-:TZ]/g, '').slice(0, 14);
    } else {
        version = getHourlyVersion();
    }

    // Check if URL already has query params
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}v=${version}`;
}
