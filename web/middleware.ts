import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone()
    const hostname = request.headers.get('host') || ''

    // 1. Redirect www to non-www
    if (hostname.startsWith('www.')) {
        url.hostname = hostname.replace('www.', '')
        return NextResponse.redirect(url, { status: 301 })
    }

    // 2. Enforce HTTPS (only in production). Behind Vercel's proxy the original scheme
    // comes in x-forwarded-proto; local `next start` also sends "http", so local hosts are exempt.
    const forwardedProto = request.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '')
    const isLocalHost = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(hostname)
    if (process.env.NODE_ENV === 'production' && forwardedProto === 'http' && !isLocalHost) {
        url.protocol = 'https:'
        return NextResponse.redirect(url, { status: 301 })
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - any path with a file extension (images, fonts, videos in /public)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)',
    ],
}
