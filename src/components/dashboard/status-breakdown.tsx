import Link from 'next/link';
import { TICKET_STATUSES, type TicketStats, type TicketStatus } from '@/lib/api/types';
import { STATUS_HUE, STATUS_LABELS } from '@/lib/tickets/palette';

/**
 * Part-to-whole across five classes, so a single stacked bar rather than five bars or a
 * pie. Laid out horizontally because "Waiting on customer" has no short form worth
 * inventing.
 *
 * Separation between segments is a 2px gap in the surface colour, not a stroke — a border
 * would add ink that is not data. The legend below carries every label and count, which is
 * also what makes the light-mode palette safe: three of these hues sit under 3:1 against
 * the card, so the numbers must be readable without decoding the fill.
 */
export function StatusBreakdown({ stats }: { stats: TicketStats }) {
  const counts = TICKET_STATUSES.map((status) => ({
    status,
    count: stats.byStatus[status] ?? 0,
  }));
  const total = counts.reduce((sum, entry) => sum + entry.count, 0);

  if (total === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">No tickets yet.</p>;
  }

  const present = counts.filter((entry) => entry.count > 0);

  return (
    <div className="grid gap-4">
      <div className="flex h-6 w-full gap-[2px] overflow-hidden">
        {present.map((entry, index) => (
          <Segment
            key={entry.status}
            status={entry.status}
            count={entry.count}
            total={total}
            first={index === 0}
            last={index === present.length - 1}
          />
        ))}
      </div>

      <ul className="grid gap-1.5 sm:grid-cols-2">
        {counts.map((entry) => (
          <li key={entry.status}>
            <Link
              href={`/tickets?status=${entry.status}`}
              className="hover:bg-muted/60 -mx-1.5 flex items-center gap-2 rounded px-1.5 py-1 text-sm"
            >
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: STATUS_HUE[entry.status] }}
              />
              <span className="text-muted-foreground">{STATUS_LABELS[entry.status]}</span>
              <span className="ml-auto font-medium tabular-nums">{entry.count}</span>
              <span className="text-muted-foreground w-10 text-right text-xs tabular-nums">
                {Math.round((entry.count / total) * 100)}%
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Segment({
  status,
  count,
  total,
  first,
  last,
}: {
  status: TicketStatus;
  count: number;
  total: number;
  first: boolean;
  last: boolean;
}) {
  const share = (count / total) * 100;

  return (
    <Link
      href={`/tickets?status=${status}`}
      title={`${STATUS_LABELS[status]}: ${count} of ${total}`}
      className="group relative block h-full"
      style={{
        width: `${share}%`,
        backgroundColor: STATUS_HUE[status],
        // 4px rounded data-ends on the outer edges only; interior joins stay square.
        borderTopLeftRadius: first ? 4 : 0,
        borderBottomLeftRadius: first ? 4 : 0,
        borderTopRightRadius: last ? 4 : 0,
        borderBottomRightRadius: last ? 4 : 0,
      }}
    >
      <span className="sr-only">
        {STATUS_LABELS[status]}: {count}
      </span>
      <span className="bg-popover text-popover-foreground pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 rounded border px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {STATUS_LABELS[status]} · {count} ({Math.round(share)}%)
      </span>
    </Link>
  );
}
