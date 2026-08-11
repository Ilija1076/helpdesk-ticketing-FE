import type { TicketPriority, TicketStatus } from '../api/types';

/**
 * One source of truth for status and priority colour, shared by the badges and the
 * dashboard charts so the same status is never two different colours in the same app.
 * The values themselves live in globals.css, where the light and dark steps are declared;
 * see the comment there for how they were validated.
 */

/** Categorical identity slots, assigned in fixed order — not chosen to "mean" anything. */
export const STATUS_HUE: Record<TicketStatus, string> = {
  OPEN: 'var(--viz-1)',
  IN_PROGRESS: 'var(--viz-2)',
  WAITING_ON_CUSTOMER: 'var(--viz-3)',
  RESOLVED: 'var(--viz-4)',
  CLOSED: 'var(--viz-5)',
};

/** Ordered scale, so a single hue stepped by urgency rather than five unrelated ones. */
export const PRIORITY_HUE: Record<TicketPriority, string> = {
  LOW: 'var(--viz-seq-1)',
  MEDIUM: 'var(--viz-seq-2)',
  HIGH: 'var(--viz-seq-3)',
  URGENT: 'var(--viz-seq-4)',
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  WAITING_ON_CUSTOMER: 'Waiting on customer',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};
