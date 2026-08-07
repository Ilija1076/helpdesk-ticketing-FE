/**
 * Shared between `proxy.ts` (which writes cookies onto a NextResponse) and the route
 * handlers (which write them through `next/headers`), so this module must not import
 * `server-only` — proxy runs outside that boundary.
 */
export const ACCESS_COOKIE = 'hd_access';
export const REFRESH_COOKIE = 'hd_refresh';

type CookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  expires?: Date;
};

export function cookieOptions(expires?: Date): CookieOptions {
  return {
    httpOnly: true,
    // Plain http on localhost during development, https everywhere else.
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    ...(expires ? { expires } : {}),
  };
}

/**
 * Reads `exp` out of a JWT without verifying it. The backend is the only party that
 * verifies this token; here we just need to know when to refresh, so an unverified read
 * of the expiry is enough — a forged `exp` only makes us refresh at the wrong time.
 */
export function accessTokenExpiry(token: string): Date | null {
  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    const json = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      exp?: number;
    };
    return typeof json.exp === 'number' ? new Date(json.exp * 1000) : null;
  } catch {
    return null;
  }
}

/** Refresh a little before the token actually dies, so an in-flight request can't age out. */
const EXPIRY_SKEW_MS = 60_000;

export function isAccessTokenStale(token: string | undefined): boolean {
  if (!token) return true;
  const expiry = accessTokenExpiry(token);
  if (!expiry) return true;
  return expiry.getTime() - EXPIRY_SKEW_MS <= Date.now();
}
