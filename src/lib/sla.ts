import type { SlaClock, Ticket } from './api/types';

export type SlaState =
  | { kind: 'none' }
  | { kind: 'met'; at: Date }
  | { kind: 'breached'; at: Date }
  | { kind: 'overdue'; dueAt: Date }
  | { kind: 'due'; dueAt: Date; minutesLeft: number };

/**
 * `overdue` and `breached` are deliberately different states. The backend stamps
 * `breachedAt` from a BullMQ job that sweeps on an interval, so a ticket can be past its
 * deadline for up to one scan before it is formally marked. Showing that gap as "breached"
 * would claim something the API has not recorded yet.
 */
export function slaState(clock: SlaClock): SlaState {
  if (clock.breachedAt) return { kind: 'breached', at: new Date(clock.breachedAt) };
  if (clock.metAt) return { kind: 'met', at: new Date(clock.metAt) };
  if (!clock.dueAt) return { kind: 'none' };

  const dueAt = new Date(clock.dueAt);
  const minutesLeft = Math.round((dueAt.getTime() - Date.now()) / 60_000);

  return minutesLeft <= 0 ? { kind: 'overdue', dueAt } : { kind: 'due', dueAt, minutesLeft };
}

export function isBreached(ticket: Ticket): boolean {
  return Boolean(ticket.sla.firstResponse.breachedAt ?? ticket.sla.resolution.breachedAt);
}

/**
 * Compact duration for table cells: "4h 20m", "3d 2h", "12m". Deliberately not
 * `Intl.RelativeTimeFormat`, which rounds to a single unit and would show a deadline
 * 90 minutes out as "in 2 hours".
 */
export function formatDuration(totalMinutes: number): string {
  const minutes = Math.abs(totalMinutes);

  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const rest = minutes % 60;
    return rest ? `${hours}h ${rest}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const restHours = hours % 24;
  return restHours ? `${days}d ${restHours}h` : `${days}d`;
}

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Belgrade',
});

/**
 * Pinned to the backend's business calendar timezone rather than the viewer's. An SLA
 * deadline means nothing without the working hours it was computed against, so showing it
 * in some other zone would be actively misleading.
 */
export function formatDateTime(value: string | Date): string {
  return dateTimeFormat.format(typeof value === 'string' ? new Date(value) : value);
}
