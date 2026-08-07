import { API_BASE_URL } from '../env';
import type { AuthResponse } from '../api/types';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: AuthResponse['user'];
};

/**
 * The backend rotates the refresh token on every use and treats a second use of an already
 * rotated token as theft — it revokes the whole family. A page request plus its prefetch can
 * easily hit proxy twice at once, so concurrent refreshes of the same token must collapse
 * into one call. Keyed by the token being spent; the entry is dropped as soon as it settles.
 *
 * This is per-process, which is all a single Next.js server needs. Behind multiple instances
 * the backend's reuse detection would still be reachable, and the fix belongs there rather
 * than in a shared cache here.
 */
const inFlight = new Map<string, Promise<TokenPair | null>>();

export async function refreshTokens(refreshToken: string): Promise<TokenPair | null> {
  const existing = inFlight.get(refreshToken);
  if (existing) return existing;

  const pending = requestRefresh(refreshToken).finally(() => {
    inFlight.delete(refreshToken);
  });

  inFlight.set(refreshToken, pending);
  return pending;
}

async function requestRefresh(refreshToken: string): Promise<TokenPair | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    if (!response.ok) return null;
    return (await response.json()) as TokenPair;
  } catch {
    // Backend unreachable. Treated the same as a rejected token: the caller sends the
    // user to /login rather than rendering a half-authenticated page.
    return null;
  }
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });
  } catch {
    // Logout clears our cookies regardless; a failed revoke only leaves a token that
    // expires on its own.
  }
}
