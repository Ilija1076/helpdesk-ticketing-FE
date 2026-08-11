import type { SlaClock, TicketSla } from '@/lib/api/types';
import { formatDateTime, formatDuration, slaState, type SlaState } from '@/lib/sla';

export function SlaPanel({ sla, now }: { sla: TicketSla; now: number }) {
  return (
    <div className="grid gap-4">
      <Clock label="First response" clock={sla.firstResponse} now={now} />
      <Clock label="Resolution" clock={sla.resolution} now={now} />

      <dl className="text-muted-foreground grid gap-1 border-t pt-3 text-xs">
        <div className="flex justify-between gap-2">
          <dt>Policy</dt>
          <dd className="text-foreground">{sla.policyName ?? 'None'}</dd>
        </div>
        {sla.pausedMinutes > 0 || sla.pausedAt ? (
          <div className="flex justify-between gap-2">
            <dt>Paused</dt>
            {/* The clock stops while a ticket waits on the customer, so elapsed
                wall-clock time and elapsed SLA time are not the same number. */}
            <dd className="text-foreground">
              {formatDuration(Math.round(sla.pausedMinutes))}
              {sla.pausedAt ? ' · running' : ''}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

function Clock({ label, clock, now }: { label: string; clock: SlaClock; now: number }) {
  const state = slaState(clock, now);

  return (
    <div className="grid gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <Value state={state} />
      </div>
      {clock.dueAt ? (
        <span className="text-muted-foreground text-xs">Due {formatDateTime(clock.dueAt)}</span>
      ) : (
        <span className="text-muted-foreground text-xs">No deadline set</span>
      )}
    </div>
  );
}

function Value({ state }: { state: SlaState }) {
  switch (state.kind) {
    case 'none':
      return <span className="text-muted-foreground text-sm">—</span>;
    case 'breached':
      return (
        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
          Breached {formatDateTime(state.at)}
        </span>
      );
    case 'met':
      return (
        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          Met {formatDateTime(state.at)}
        </span>
      );
    case 'overdue':
      return (
        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
          Overdue by {formatDuration(state.minutesOver)}
        </span>
      );
    case 'due':
      return (
        <span
          className={
            state.minutesLeft <= 60
              ? 'text-sm font-semibold text-amber-600 dark:text-amber-400'
              : 'text-sm font-semibold'
          }
        >
          {formatDuration(state.minutesLeft)} left
        </span>
      );
  }
}
