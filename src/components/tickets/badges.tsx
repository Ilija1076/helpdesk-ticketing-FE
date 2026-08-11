import { Badge } from '@/components/ui/badge';
import type { SlaClock, TicketPriority, TicketStatus } from '@/lib/api/types';
import { formatDateTime, formatDuration, slaState, type SlaState } from '@/lib/sla';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  WAITING_ON_CUSTOMER: 'Waiting on customer',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const STATUS_STYLES: Record<TicketStatus, string> = {
  OPEN: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  IN_PROGRESS: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  WAITING_ON_CUSTOMER: 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300',
  RESOLVED: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  CLOSED: 'border-border bg-muted text-muted-foreground',
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge variant="outline" className={cn('font-medium', STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  LOW: 'border-border bg-muted text-muted-foreground',
  MEDIUM: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  HIGH: 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300',
  URGENT: 'border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300',
};

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <Badge variant="outline" className={cn('font-medium', PRIORITY_STYLES[priority])}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}

/** One SLA clock — either first response or resolution. */
export function SlaBadge({ clock, label, now }: { clock: SlaClock; label: string; now: number }) {
  const state = slaState(clock, now);

  if (state.kind === 'none') {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  const { className, text, title } = describe(state, label);

  return (
    <span className={cn('text-xs font-medium whitespace-nowrap', className)} title={title}>
      {text}
    </span>
  );
}

function describe(
  state: Exclude<SlaState, { kind: 'none' }>,
  label: string,
): { className: string; text: string; title: string } {
  switch (state.kind) {
    case 'breached':
      return {
        className: 'text-red-600 dark:text-red-400',
        text: 'Breached',
        title: `${label} breached at ${formatDateTime(state.at)}`,
      };
    case 'met':
      return {
        className: 'text-emerald-600 dark:text-emerald-400',
        text: 'Met',
        title: `${label} met at ${formatDateTime(state.at)}`,
      };
    case 'overdue':
      return {
        className: 'text-red-600 dark:text-red-400',
        // Past the deadline, but the sweeper has not stamped it yet.
        text: `Overdue ${formatDuration(state.minutesOver)}`,
        title: `${label} was due ${formatDateTime(state.dueAt)}`,
      };
    case 'due': {
      const urgent = state.minutesLeft <= 60;
      return {
        className: urgent
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-muted-foreground font-normal',
        text: formatDuration(state.minutesLeft),
        title: `${label} due ${formatDateTime(state.dueAt)}`,
      };
    }
  }
}
