import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Ticket } from '@/lib/api/types';
import { formatDateTime } from '@/lib/sla';
import { PriorityBadge, SlaBadge, StatusBadge } from './badges';

export function TicketTable({
  tickets,
  showRequester,
  now,
}: {
  tickets: Ticket[];
  showRequester: boolean;
  /** One instant for the whole table, so no two rows disagree about the countdown. */
  now: number;
}) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center">
        <p className="font-medium">No tickets match these filters</p>
        <p className="text-muted-foreground mt-1 text-sm">Clear a filter or widen the search.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-24">Ref</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-36">Status</TableHead>
            <TableHead className="w-24">Priority</TableHead>
            {showRequester ? <TableHead className="w-44">Requester</TableHead> : null}
            <TableHead className="w-40">Assignee</TableHead>
            <TableHead className="w-28">Response</TableHead>
            <TableHead className="w-28">Resolution</TableHead>
            <TableHead className="w-32">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-mono text-xs">
                <Link href={`/tickets/${ticket.id}`} className="hover:underline">
                  {ticket.reference}
                </Link>
              </TableCell>
              <TableCell className="max-w-xs">
                <Link href={`/tickets/${ticket.id}`} className="font-medium hover:underline">
                  {ticket.title}
                </Link>
              </TableCell>
              <TableCell>
                <StatusBadge status={ticket.status} />
              </TableCell>
              <TableCell>
                <PriorityBadge priority={ticket.priority} />
              </TableCell>
              {showRequester ? (
                <TableCell className="text-muted-foreground truncate text-sm">
                  {ticket.requester.name}
                </TableCell>
              ) : null}
              <TableCell className="text-muted-foreground truncate text-sm">
                {ticket.assignee?.name ?? <span className="italic">Unassigned</span>}
              </TableCell>
              <TableCell>
                <SlaBadge clock={ticket.sla.firstResponse} label="First response" now={now} />
              </TableCell>
              <TableCell>
                <SlaBadge clock={ticket.sla.resolution} label="Resolution" now={now} />
              </TableCell>
              <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                {formatDateTime(ticket.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
