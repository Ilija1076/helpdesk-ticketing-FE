import { z } from 'zod';
import { TICKET_PRIORITIES, type CreateTicketBody, type Role } from '../api/types';

/**
 * Mirrors CreateTicketDto's constraints, which the generated types do not carry — OpenAPI
 * describes shapes, not validation rules.
 */
export const createTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Give the ticket a title of at least 5 characters.')
    .max(200, 'Keep the title under 200 characters.'),
  description: z
    .string()
    .trim()
    .min(10, 'Describe the problem in at least 10 characters.')
    .max(10_000, 'Keep the description under 10,000 characters.'),
  priority: z.enum(TICKET_PRIORITIES).optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

/**
 * Priority decides which SLA policy stamps the deadlines, so setting it is triage — an
 * agent's call. The backend would accept it from a client too, which is exactly why the
 * field is dropped here rather than merely hidden in the form: a hidden input is not a
 * rule. Kept pure and separate from the server action so it can be tested without a session.
 */
export function buildCreateTicketBody(role: Role, input: CreateTicketInput): CreateTicketBody {
  const body: CreateTicketBody = {
    title: input.title,
    description: input.description,
  };

  if (role === 'AGENT' && input.priority) {
    body.priority = input.priority;
  }

  return body;
}
