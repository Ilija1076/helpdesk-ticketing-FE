import { NextResponse, type NextRequest } from 'next/server';
import { ApiError, apiFetch } from '@/lib/api/server-client';
import { getCurrentUser } from '@/lib/auth/dal';
import type { Comment, CreateCommentBody, Paginated } from '@/lib/api/types';

/**
 * Backend-for-frontend. The access token lives in an httpOnly cookie, so the browser cannot
 * call NestJS directly — TanStack Query talks to this route instead and the token is
 * attached server-side.
 *
 * Route handlers are public entry points, so each one re-checks the session rather than
 * trusting that proxy already did.
 */

export async function GET(_request: NextRequest, ctx: RouteContext<'/api/tickets/[id]/comments'>) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;

  try {
    // The backend already hides internal notes from clients, and caps pageSize at 100.
    const comments = await apiFetch<Paginated<Comment>>(`/tickets/${id}/comments?pageSize=100`);
    return NextResponse.json(comments);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest, ctx: RouteContext<'/api/tickets/[id]/comments'>) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  const payload = (await request.json().catch(() => null)) as CreateCommentBody | null;

  if (!payload || typeof payload.body !== 'string' || payload.body.trim().length === 0) {
    return NextResponse.json({ message: 'A comment body is required.' }, { status: 400 });
  }

  // Only agents may leave internal notes; never take the client's word for this flag.
  const isInternal = user.role === 'AGENT' && payload.isInternal === true;

  try {
    const comment = await apiFetch<Comment>(`/tickets/${id}/comments`, {
      method: 'POST',
      body: { body: payload.body.trim(), isInternal },
    });
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }
  return NextResponse.json({ message: 'Could not reach the server.' }, { status: 502 });
}
