import 'server-only';
import { apiFetch } from './server-client';
import type { Comment, Paginated, Ticket, TicketListQuery, TicketStats } from './types';

/**
 * Array filters go over the wire comma-separated. The backend accepts both that and
 * repeated keys, but a single `status=OPEN,IN_PROGRESS` keeps the address bar readable,
 * and these filters are meant to be copied and shared.
 */
function toSearchParams(query: TicketListQuery): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length > 0) params.set(key, value.join(','));
    } else {
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * These two stamp `fetchedAt` alongside the payload. SLA countdowns are relative to when
 * the data was read, and reading the clock here rather than in a component keeps the render
 * pure — a component that called `Date.now()` itself would produce a different answer on
 * every re-render of the same data.
 */
export async function listTickets(
  query: TicketListQuery = {},
): Promise<Paginated<Ticket> & { fetchedAt: number }> {
  const page = await apiFetch<Paginated<Ticket>>(`/tickets${toSearchParams(query)}`);
  return { ...page, fetchedAt: Date.now() };
}

export async function getTicket(id: string): Promise<{ ticket: Ticket; fetchedAt: number }> {
  const ticket = await apiFetch<Ticket>(`/tickets/${id}`);
  return { ticket, fetchedAt: Date.now() };
}

export function listComments(ticketId: string): Promise<Paginated<Comment>> {
  return apiFetch<Paginated<Comment>>(`/tickets/${ticketId}/comments?pageSize=100`);
}

/** Agent-only on the backend; calling it as a client returns 403. */
export function getTicketStats(): Promise<TicketStats> {
  return apiFetch<TicketStats>('/tickets/stats');
}
