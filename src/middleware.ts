import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const jwt = req.cookies.get('jwt');

  if (!jwt) {
    req.cookies.delete(["next-auth.csrf-token", "next-auth.session-token"]);
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home',
    '/cases',
    '/contractors',
    '/customers',
    '/partners',
    '/payments',
    '/users',
  ]
};
