import Link from 'next/link';
import { TICKET_PRIORITIES, type TicketStats } from '@/lib/api/types';
import { PRIORITY_HUE, PRIORITY_LABELS } from '@/lib/tickets/palette';

/**
 * Priority is an ordered scale, not a set of unrelated categories, so this is one hue
 * stepped by urgency rather than four identity colours. One series means no legend box —
 * the card title already says what is plotted — and the value rides the tip of each bar.
 *
 * Bars are capped at 16px so the row keeps some air, with a 4px rounded data-end and a
 * square edge at the baseline.
 */
export function PriorityBreakdown({ stats }: { stats: TicketStats }) {
  const counts = TICKET_PRIORITIES.map((priority) => ({
    priority,
    count: stats.byPriority[priority] ?? 0,
  }));
  const max = Math.max(...counts.map((entry) => entry.count), 1);
  const total = counts.reduce((sum, entry) => sum + entry.count, 0);

  if (total === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">No tickets yet.</p>;
  }

  // Urgent first: the row a person scans for is the one that matters most.
  const ordered = [...counts].reverse();

  return (
    <ul className="grid gap-3">
      {ordered.map((entry) => (
        <li key={entry.priority}>
          <Link
            href={`/tickets?priority=${entry.priority}`}
            className="group grid grid-cols-[5rem_1fr_2.5rem] items-center gap-3"
          >
            <span className="text-muted-foreground text-sm group-hover:text-foreground">
              {PRIORITY_LABELS[entry.priority]}
            </span>

            <span className="flex h-4 items-center">
              <span
                className="h-4 transition-opacity group-hover:opacity-80"
                style={{
                  width: `${Math.max((entry.count / max) * 100, entry.count > 0 ? 2 : 0)}%`,
                  backgroundColor: PRIORITY_HUE[entry.priority],
                  borderStartEndRadius: 4,
                  borderEndEndRadius: 4,
                }}
              />
            </span>

            <span className="text-right text-sm font-medium tabular-nums">{entry.count}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
