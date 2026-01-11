import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    let response = NextResponse.next();
    let theme = request.cookies.get('theme')?.value;

    // Check if the pathname is exactly "/"
    if (request.nextUrl.pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname = '/profiler';
        response = NextResponse.redirect(url)
    }
    if(!theme){
        response.cookies.set('theme', 'light',{
            sameSite: 'lax',
            path: '/',
            httpOnly: false,
            secure: false,
            maxAge: 60 * 60 * 24 * 365, // 1 year
        });
    }
    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
    ],
};
