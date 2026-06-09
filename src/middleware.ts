import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const jwt = req.cookies.get('jwt');
  const isLoginPage = req.nextUrl.pathname === '/login';

  if (jwt && isLoginPage) {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  if (!jwt && !isLoginPage) {
    req.cookies.delete(['next-auth.csrf-token', 'next-auth.session-token']);
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/home/:path*',
    '/panel/:path*',
    '/cases/:path*',
    '/contractors/:path*',
    '/customers/:path*',
    '/partners/:path*',
    '/payments/:path*',
    '/users/:path*',
  ],
};
