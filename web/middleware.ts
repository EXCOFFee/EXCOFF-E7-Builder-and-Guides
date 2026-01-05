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

    // 2. Enforce HTTPS (only in production)
    if (
        process.env.NODE_ENV === 'production' &&
        url.protocol === 'http:' &&
        !hostname.includes('localhost')
    ) {
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
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
