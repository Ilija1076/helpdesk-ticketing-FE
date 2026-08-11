import type { Comment, CreateCommentBody, Paginated, TicketStats } from './types';

/**
 * Browser-side calls go to this app's own /api routes, never to NestJS. Cookies ride along
 * automatically because it is a same-origin request.
 */
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (response.status === 401) {
    // Matched in the query client's retry rule, and by the thread's redirect-to-login.
    throw new Error('Session expired');
  }

  const payload: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : 'Request failed';
    throw new Error(message);
  }

  return payload as T;
}

export function fetchComments(ticketId: string): Promise<Paginated<Comment>> {
  return request<Paginated<Comment>>(`/api/tickets/${ticketId}/comments`);
}

export function postComment(ticketId: string, body: CreateCommentBody): Promise<Comment> {
  return request<Comment>(`/api/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function fetchStats(): Promise<TicketStats> {
  return request<TicketStats>('/api/stats');
}
