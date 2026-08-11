import type { Metadata } from 'next';
import { LiveStats } from '@/components/dashboard/live-stats';
import { getTicketStats } from '@/lib/api/tickets';
import { requireAgent } from '@/lib/auth/dal';

export const metadata: Metadata = { title: 'Dashboard · Helpdesk' };

export default async function DashboardPage() {
  // /tickets/stats is agent-only on the backend; clients are sent to their own view.
  await requireAgent();
  const stats = await getTicketStats();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Queue health at a glance. Every number opens the matching filter.
        </p>
      </div>

      <LiveStats initialData={stats} />
    </div>
  );
}
