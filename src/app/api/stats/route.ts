import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/api/server-client';
import { getTicketStats } from '@/lib/api/tickets';
import { getCurrentUser } from '@/lib/auth/dal';

/**
 * Polled by the dashboard so the numbers move without the agent reloading. The agent check
 * is repeated here rather than left to proxy — a route handler is a public entry point.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'AGENT') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  try {
    return NextResponse.json(await getTicketStats());
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: 'Could not reach the server.' }, { status: 502 });
  }
}
