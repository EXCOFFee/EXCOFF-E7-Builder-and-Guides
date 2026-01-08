'use client';

/**
 * Hero Image URL utility with cache-busting
 * Uses hour-based timestamp to ensure images refresh every hour
 * This helps with stale cached images after updates
 */

// Generate version based on current hour (refreshes cache hourly)
function getHourlyVersion(): string {
    const now = new Date();
    // Format: YYYYMMDDHH
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}`;
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
