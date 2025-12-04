import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

export async function middleware(request: NextRequest) {
    const session = await auth();
    const { pathname } = request.nextUrl;

    // Protect dashboard routes
    if (pathname.startsWith('/dashboard')) {
        if (!session) {
            const url = new URL('/login', request.url);
            return NextResponse.redirect(url);
        }
    }

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
        if (session) {
            const url = new URL('/dashboard', request.url);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup'],
};
