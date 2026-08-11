'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ALLOWED_TRANSITIONS,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type AuthUser,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from '@/lib/api/types';
import { changeAssignee, changePriority, changeStatus } from '@/lib/tickets/actions';

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  WAITING_ON_CUSTOMER: 'Waiting on customer',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const UNASSIGNED = '__unassigned__';

export function TicketControls({ ticket, agents }: { ticket: Ticket; agents: AuthUser[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; message?: string }>, success: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(success);
        router.refresh();
      } else {
        toast.error(result.message ?? 'Update failed');
      }
    });
  }

  const closed = ticket.status === 'CLOSED';

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={ticket.status}
          disabled={pending || closed}
          onValueChange={(next) =>
            run(
              () => changeStatus(ticket.id, ticket.status, next as TicketStatus),
              `Status changed to ${STATUS_LABELS[next as TicketStatus]}`,
            )
          }
        >
          <SelectTrigger id="status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TICKET_STATUSES.map((status) => (
              <SelectItem
                key={status}
                value={status}
                // Mirrors the backend's transition table: a closed ticket is terminal,
                // and not every move is legal from every state.
                disabled={
                  status !== ticket.status && !ALLOWED_TRANSITIONS[ticket.status].includes(status)
                }
              >
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {closed ? (
          <p className="text-muted-foreground text-xs">A closed ticket cannot be reopened.</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={ticket.priority}
          disabled={pending || closed}
          onValueChange={(next) =>
            run(
              () => changePriority(ticket.id, next as TicketPriority),
              'Priority changed — SLA deadlines restamped',
            )
          }
        >
          <SelectTrigger id="priority" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TICKET_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority[0] + priority.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="assignee">Assignee</Label>
        <Select
          value={ticket.assignee?.id ?? UNASSIGNED}
          disabled={pending || closed}
          onValueChange={(next) =>
            run(
              () => changeAssignee(ticket.id, next === UNASSIGNED ? null : next),
              next === UNASSIGNED ? 'Ticket unassigned' : 'Assignee updated',
            )
          }
        >
          <SelectTrigger id="assignee" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
