import { AlertTriangle, Inbox, Ticket, UserMinus } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import type { TicketStats } from '@/lib/api/types';
import { cn } from '@/lib/utils';

/**
 * A KPI row rather than a chart: four headline numbers whose job is to be read, not
 * compared to each other. Each tile links to the ticket list already filtered, so the
 * dashboard is a way into the queue rather than a dead end.
 */
export function StatTiles({ stats }: { stats: TicketStats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Tile
        label="Open"
        value={stats.open}
        href="/tickets?status=OPEN,IN_PROGRESS,WAITING_ON_CUSTOMER"
        icon={<Inbox className="size-4" />}
      />
      <Tile
        label="SLA breached"
        value={stats.breached}
        href="/tickets?breached=true"
        icon={<AlertTriangle className="size-4" />}
        // The only tile that earns a colour: it is the one number that means something
        // is wrong, and it ships an icon and a label so colour is never carrying it alone.
        critical={stats.breached > 0}
      />
      <Tile
        label="Unassigned"
        value={stats.unassigned}
        href="/tickets?unassigned=true"
        icon={<UserMinus className="size-4" />}
      />
      <Tile
        label="All tickets"
        value={stats.total}
        href="/tickets"
        icon={<Ticket className="size-4" />}
      />
    </div>
  );
}

function Tile({
  label,
  value,
  href,
  icon,
  critical = false,
}: {
  label: string;
  value: number;
  href: string;
  icon: React.ReactNode;
  critical?: boolean;
}) {
  return (
    <Card className="hover:bg-muted/40 p-0 transition-colors">
      <Link href={href} className="block p-4">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span style={critical ? { color: 'var(--viz-critical)' } : undefined}>{icon}</span>
          {label}
        </div>
        {/* Proportional figures: this is a standalone value, not a column. */}
        <p
          className={cn('mt-2 text-3xl font-semibold')}
          style={critical ? { color: 'var(--viz-critical)' } : undefined}
        >
          {value.toLocaleString('en-GB')}
        </p>
      </Link>
    </Card>
  );
}
