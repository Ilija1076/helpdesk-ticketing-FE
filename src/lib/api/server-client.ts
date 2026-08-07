import 'server-only';
import { API_BASE_URL } from '../env';
import { getAccessToken } from '../auth/session';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiFetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  /** Skip the Authorization header, for the login and register calls. */
  anonymous?: boolean;
};

/**
 * Server-side call into NestJS. The access token comes from the httpOnly cookie, which
 * `proxy.ts` has already refreshed if it was close to expiring — so there is no retry loop
 * here on purpose. A 401 at this point means the session is genuinely gone, and the caller
 * should bounce the user to /login rather than quietly re-authenticating.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, anonymous, headers, ...init } = options;

  const requestHeaders = new Headers(headers);
  if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
  }
  if (!anonymous) {
    const token = await getAccessToken();
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: requestHeaders,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    // Ticket data is per-user and changes constantly; nothing here is safe to cache.
    cache: 'no-store',
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(payload, response.statusText), payload);
  }

  return payload as T;
}

function errorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const { message } = payload as { message: unknown };
    // Nest's ValidationPipe returns an array of messages, one per failed constraint.
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  return fallback;
}
