import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: /api/proxy-image
 * 
 * Proxies external images to bypass CORS restrictions for html-to-image export.
 * This allows the frontend to fetch images from external domains (Hostinger, epic7db, etc.)
 * without CORS blocking the canvas export.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        // Validate URL to prevent SSRF attacks
        const parsedUrl = new URL(imageUrl);
        const allowedHosts = [
            'moccasin-sparrow-217730.hostingersite.com',
            'epic7db.com',
            'ceciliabot.github.io',
            'excoffe7.com',
            'www.excoffe7.com',
            'lh3.googleusercontent.com', // Google user avatars
            'googleusercontent.com',
        ];

        // Check if it's from an allowed host
        const isAllowedHost = allowedHosts.some(host => parsedUrl.hostname.includes(host)) ||
            parsedUrl.hostname.includes('hostingersite.com');

        if (!isAllowedHost) {
            // Still allow if it's a known image extension
            const isImage = /\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i.test(parsedUrl.pathname);
            if (!isImage) {
                return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
            }
        }

        // Fetch the image from the external source
        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'EXCOFF-E7-Hub/1.0',
                'Accept': 'image/*',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch image: ${response.status}` },
                { status: response.status }
            );
        }

        // Get the image data
        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/png';

        // Return the image with permissive CORS headers
        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
            },
        });
    } catch (error) {
        console.error('Proxy image error:', error);
        return NextResponse.json(
            { error: 'Failed to proxy image' },
            { status: 500 }
        );
    }
}
