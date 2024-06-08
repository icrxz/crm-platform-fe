import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log("entrou no middleware")
  const jwt = req.cookies.get('jwt');

  console.log("middleware jwt", jwt)
  if (!jwt) {
    console.log("foi pro fluxo do login do middleware")
    req.cookies.delete(["next-auth.csrf-token", "next-auth.session-token"])
    return NextResponse.redirect(new URL('/login', req.url))
  }

  console.log("continuou fluxo do middleware")
  return NextResponse.next();
}

export const config = {
  matcher: '/home',
};
