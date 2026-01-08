'use client';

/**
 * Hero Image URL utility with cache-busting
 * Version is updated when images are changed to force browser cache refresh
 * Increment IMAGE_VERSION when updating hero images
 */
export const IMAGE_VERSION = '20260108'; // YYYYMMDD format - increment when images change

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
    return `${url}?v=${IMAGE_VERSION}`;
}

/**
 * Get hero image URL from image_url field with cache-busting
 */
export function appendImageVersion(imageUrl: string | null | undefined): string {
    if (!imageUrl) return '';
    // Check if URL already has query params
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}v=${IMAGE_VERSION}`;
}
