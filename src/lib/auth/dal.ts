import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { ApiError, apiFetch } from '../api/server-client';
import type { AuthUser } from '../api/types';

/**
 * Every authorization decision goes through here rather than through `proxy.ts`. Proxy only
 * looks at cookies; this asks the backend who the caller actually is. Server actions in
 * particular must call it themselves — a proxy matcher change can silently stop covering
 * them, since they are POSTs to whatever route they live on.
 *
 * `cache` dedupes the /auth/me call across one render pass, so a layout and three
 * components asking for the user cost a single request.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  try {
    return await apiFetch<AuthUser>('/auth/me');
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      return null;
    }
    throw error;
  }
});

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

/**
 * Agent-only areas. Next's `forbidden()` would be the natural fit but it is still behind the
 * experimental `authInterrupts` flag, so clients are sent to their own view instead.
 */
export async function requireAgent(): Promise<AuthUser> {
  const user = await requireUser();
  if (user.role !== 'AGENT') redirect('/');
  return user;
}
