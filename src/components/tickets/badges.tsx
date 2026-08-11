import { Badge } from '@/components/ui/badge';
import type { SlaClock, TicketPriority, TicketStatus } from '@/lib/api/types';
import { formatDateTime, formatDuration, slaState, type SlaState } from '@/lib/sla';
import { PRIORITY_HUE, PRIORITY_LABELS, STATUS_HUE, STATUS_LABELS } from '@/lib/tickets/palette';
import { cn } from '@/lib/utils';

/**
 * The dot carries the colour, the text stays in ink. A light categorical hue is illegible
 * as text on the surface, and this way the badge reads the same in both themes without a
 * second set of text colours.
 */
function Dot({ hue }: { hue: string }) {
  return (
    <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ backgroundColor: hue }} />
  );
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge variant="outline" className="gap-1.5 font-medium">
      <Dot hue={STATUS_HUE[status]} />
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <Badge variant="outline" className="gap-1.5 font-medium">
      <Dot hue={PRIORITY_HUE[priority]} />
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
