'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { ApiError, apiFetch } from '../api/server-client';
import { clearSession, getRefreshToken, setSession } from './session';
import { revokeRefreshToken, type TokenPair } from './tokens';

export type AuthFormState = {
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

/**
 * Mirrors RegisterDto on the backend. Duplicated rather than derived, because the generated
 * OpenAPI types carry no validation rules — only shapes.
 */
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(120),
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128),
});

export async function login(
  _state: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const result = await authenticate('/auth/login', parsed.data);
  if (!result.ok) return result.state;

  await setSession(result.tokens);
  // Outside the try/catch above on purpose: redirect() signals by throwing.
  redirect(safeNextPath(formData.get('next')));
}

export async function register(
  _state: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const result = await authenticate('/auth/register', parsed.data);
  if (!result.ok) return result.state;

  await setSession(result.tokens);
  redirect('/');
}

export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
  await clearSession();
  redirect('/login');
}

type AuthAttempt = { ok: true; tokens: TokenPair } | { ok: false; state: AuthFormState };

async function authenticate(path: string, body: unknown): Promise<AuthAttempt> {
  try {
    const tokens = await apiFetch<TokenPair>(path, { method: 'POST', body, anonymous: true });
    return { ok: true, tokens };
  } catch (error) {
    if (error instanceof ApiError) {
      // 401 on login, 409 on a duplicate email during register.
      return { ok: false, state: { message: error.message } };
    }
    return { ok: false, state: { message: 'Could not reach the server. Try again in a moment.' } };
  }
}

/**
 * The post-login target comes from a query string, so it has to be treated as untrusted:
 * only same-site absolute paths are allowed, never a full URL to somewhere else.
 */
function safeNextPath(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') return '/';
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}
