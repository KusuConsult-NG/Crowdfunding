import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for session cookie
    const sessionCookie = request.cookies.get('authjs.session-token') ||
        request.cookies.get('__Secure-authjs.session-token');

    const isAuthenticated = !!sessionCookie;

    // Protect dashboard routes
    if (pathname.startsWith('/dashboard')) {
        if (!isAuthenticated) {
            const url = new URL('/login', request.url);
            url.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(url);
        }
    }

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
        if (isAuthenticated) {
            const url = new URL('/dashboard', request.url);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup'],
};
