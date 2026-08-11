'use server';

import { revalidatePath } from 'next/cache';
import { ApiError, apiFetch } from '../api/server-client';
import { requireAgent } from '../auth/dal';
import { ALLOWED_TRANSITIONS, type Ticket, type UpdateTicketBody } from '../api/types';

export type UpdateResult = { ok: true } | { ok: false; message: string };

/**
 * Server actions are reachable as plain POSTs to whatever route they are used on, so the
 * agent check happens here rather than relying on proxy or on the UI hiding the controls.
 */
async function updateTicket(id: string, patch: UpdateTicketBody): Promise<UpdateResult> {
  await requireAgent();

  try {
    await apiFetch<Ticket>(`/tickets/${id}`, { method: 'PATCH', body: patch });
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, message: error.message };
    return { ok: false, message: 'Could not reach the server.' };
  }

  revalidatePath(`/tickets/${id}`);
  revalidatePath('/tickets');
  return { ok: true };
}

export async function changeStatus(
  id: string,
  from: Ticket['status'],
  to: Ticket['status'],
): Promise<UpdateResult> {
  // The backend enforces this too and answers with a 400; checking here turns an error
  // toast into a control the user never sees enabled.
  if (from !== to && !ALLOWED_TRANSITIONS[from].includes(to)) {
    return { ok: false, message: `Cannot move a ticket from ${from} to ${to}.` };
  }
  return updateTicket(id, { status: to });
}

export async function changePriority(
  id: string,
  priority: Ticket['priority'],
): Promise<UpdateResult> {
  // Changing priority swaps the SLA policy, so the backend restamps both deadlines.
  return updateTicket(id, { priority });
}

export async function changeAssignee(id: string, assigneeId: string | null): Promise<UpdateResult> {
  return updateTicket(id, { assigneeId });
}
