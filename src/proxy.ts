import { NextResponse, type NextRequest } from 'next/server';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  cookieOptions,
  isAccessTokenStale,
} from './lib/auth/cookies';
import { refreshTokens } from './lib/auth/tokens';

/**
 * Renamed from Middleware in Next.js 16 — same execution slot, new file name.
 *
 * This is where the access token gets renewed. It has to happen here rather than inside a
 * Server Component, because a component render cannot write cookies; only proxy, route
 * handlers and server actions can. Refreshing up front means everything downstream can
 * assume the access cookie is valid.
 *
 * These are optimistic checks only. Proxy never asks the backend who the user is, so every
 * page and server action still verifies through the data access layer.
 */

const PUBLIC_PATHS = ['/login', '/register'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  // No refresh token means no session worth reviving.
  if (!refreshToken) {
    if (isPublicPath) return NextResponse.next();
    return redirectToLogin(request);
  }

  if (!isAccessTokenStale(accessToken)) {
    return isPublicPath ? redirectHome(request) : NextResponse.next();
  }

  const tokens = await refreshTokens(refreshToken);

  if (!tokens) {
    // Rejected, reused or the backend is down — drop the session and start over.
    const response = isPublicPath ? NextResponse.next() : redirectToLogin(request);
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  // Update the incoming request so this same render sees the new token, then hand the
  // rotated pair back to the browser.
  request.cookies.set(ACCESS_COOKIE, tokens.accessToken);
  request.cookies.set(REFRESH_COOKIE, tokens.refreshToken);

  const response = isPublicPath
    ? redirectHome(request)
    : NextResponse.next({ request: { headers: request.headers } });

  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions());
  response.cookies.set(
    REFRESH_COOKIE,
    tokens.refreshToken,
    cookieOptions(new Date(tokens.refreshTokenExpiresAt)),
  );

  return response;
}

function redirectToLogin(request: NextRequest) {
  const url = new URL('/login', request.nextUrl);
  // Send the user back where they were headed once they are through the login form.
  if (request.nextUrl.pathname !== '/') {
    url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
  }
  return NextResponse.redirect(url);
}

function redirectHome(request: NextRequest) {
  return NextResponse.redirect(new URL('/', request.nextUrl));
}

export const config = {
  matcher: [
    /*
     * Everything except Next.js internals and static assets. Auth runs on all real routes,
     * including the POSTs that server actions ride on.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
