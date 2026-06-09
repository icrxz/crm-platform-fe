import { NextRequest, NextResponse } from 'next/server';

const TV_UA_PATTERNS = [
  /\bAFT\b/i, // Amazon Fire TV / Fire Stick
  /\bFireTV\b/i, // Amazon Fire TV explicit
  /\bwebOS\b/i, // LG Smart TV
  /\bTizen\b/i, // Samsung Smart TV
  /\bSMART-TV\b/i, // Generic Smart TV
  /\bAppleTV\b/i, // Apple TV
  /\bRoku\b/i, // Roku
  /\bCrKey\b/i, // Chromecast with Google TV
  /\bGoogleTV\b/i, // Google TV
  /Android.*\bTV\b/i, // Android TV
];

function isTvDevice(userAgent: string): boolean {
  return TV_UA_PATTERNS.some((pattern) => pattern.test(userAgent));
}

export function middleware(req: NextRequest) {
  const jwt = req.cookies.get('jwt');
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === '/login';
  const isHomePage = pathname === '/home';
  const isTv = isTvDevice(req.headers.get('user-agent') ?? '');

  if (jwt && isLoginPage) {
    const destination = isTv ? '/tv/dashboards' : '/home';
    return NextResponse.redirect(new URL(destination, req.url));
  }

  if (jwt && isHomePage && isTv) {
    return NextResponse.redirect(new URL('/tv/dashboards', req.url));
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
    '/tv/:path*',
  ],
};
