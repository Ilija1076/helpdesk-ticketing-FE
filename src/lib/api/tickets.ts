import 'server-only';
import { apiFetch } from './server-client';
import type { Paginated, Ticket, TicketListQuery, TicketStats } from './types';

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

export function listTickets(query: TicketListQuery = {}): Promise<Paginated<Ticket>> {
  return apiFetch<Paginated<Ticket>>(`/tickets${toSearchParams(query)}`);
}

export function getTicket(id: string): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${id}`);
}

/** Agent-only on the backend; calling it as a client returns 403. */
export function getTicketStats(): Promise<TicketStats> {
  return apiFetch<TicketStats>('/tickets/stats');
}
