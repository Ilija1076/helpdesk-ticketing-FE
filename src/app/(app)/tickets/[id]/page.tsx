import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PriorityBadge, StatusBadge } from '@/components/tickets/badges';
import { CommentThread } from '@/components/tickets/comment-thread';
import { SlaPanel } from '@/components/tickets/sla-panel';
import { TicketControls } from '@/components/tickets/ticket-controls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiError } from '@/lib/api/server-client';
import { getTicket, listComments } from '@/lib/api/tickets';
import { listUsers } from '@/lib/api/users';
import type { AuthUser } from '@/lib/api/types';
import { requireUser } from '@/lib/auth/dal';
import { formatDateTime } from '@/lib/sla';

export const metadata: Metadata = { title: 'Ticket · Helpdesk' };

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const { ticket, fetchedAt } = await getTicket(id).catch((error: unknown) => {
    // A client asking for someone else's ticket gets a 403 from the backend. Showing
    // "not found" rather than "forbidden" avoids confirming the ticket exists at all.
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  });

  const isAgent = user.role === 'AGENT';
  const [comments, agents] = await Promise.all([
    listComments(id),
    isAgent ? listUsers('AGENT') : Promise.resolve<AuthUser[]>([]),
  ]);

  return (
    <div className="grid gap-6">
      <div>
        <Link
          href="/tickets"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Back to tickets
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-6">
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground font-mono text-sm">{ticket.reference}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 className="text-2xl font-semibold">{ticket.title}</h1>
            <p className="text-muted-foreground text-sm">
              Raised by {ticket.requester.name} on {formatDateTime(ticket.createdAt)}
            </p>
          </div>

          <Card>
            <CardContent className="text-sm whitespace-pre-wrap">{ticket.description}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <CommentThread ticketId={ticket.id} user={user} initialData={comments} />
            </CardContent>
          </Card>
        </div>

        <aside className="grid h-fit gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SLA</CardTitle>
            </CardHeader>
            <CardContent>
              <SlaPanel sla={ticket.sla} now={fetchedAt} />
            </CardContent>
          </Card>

          {isAgent ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Manage</CardTitle>
              </CardHeader>
              <CardContent>
                <TicketControls ticket={ticket} agents={agents} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assigned to</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {ticket.assignee?.name ?? (
                  <span className="text-muted-foreground italic">Not yet assigned</span>
                )}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
