'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchStats } from '@/lib/api/browser-client';
import type { TicketStats } from '@/lib/api/types';
import { PriorityBreakdown } from './priority-breakdown';
import { StatTiles } from './stat-tiles';
import { StatusBreakdown } from './status-breakdown';

const REFRESH_INTERVAL_MS = 60_000;

/**
 * This is the one place a query client genuinely earns its keep: the SLA sweeper runs on
 * the backend on its own schedule, so a breach count can change while nobody touched the
 * page. Server-rendered first, then polled.
 */
export function LiveStats({ initialData }: { initialData: TicketStats }) {
  const { data, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    initialData,
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

  return (
    <div className="grid gap-6">
      <StatTiles stats={data} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tickets by status</CardTitle>
            <CardDescription>Share of the whole queue</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusBreakdown stats={data} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tickets by priority</CardTitle>
            <CardDescription>Count per priority, most urgent first</CardDescription>
          </CardHeader>
          <CardContent>
            <PriorityBreakdown stats={data} />
          </CardContent>
        </Card>
      </div>

      <p className="text-muted-foreground text-xs" aria-live="polite">
        {isFetching ? 'Refreshing…' : <>Updated {new Date(dataUpdatedAt).toLocaleTimeString()}</>}
      </p>
    </div>
  );
}
