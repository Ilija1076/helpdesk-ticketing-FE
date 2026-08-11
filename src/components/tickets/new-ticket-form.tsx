'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TICKET_PRIORITIES } from '@/lib/api/types';
import { createTicket, type CreateTicketState } from '@/lib/tickets/actions';
import { PRIORITY_LABELS } from '@/lib/tickets/palette';

export function NewTicketForm({ isAgent }: { isAgent: boolean }) {
  const [state, action, pending] = useActionState<CreateTicketState | undefined, FormData>(
    createTicket,
    undefined,
  );

  return (
    <form action={action} className="grid gap-5">
      {state?.message ? (
        <p role="alert" className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Short summary of the problem"
          aria-invalid={Boolean(state?.fieldErrors?.title)}
          aria-describedby={state?.fieldErrors?.title ? 'title-error' : undefined}
        />
        {state?.fieldErrors?.title ? (
          <p id="title-error" className="text-destructive text-xs">
            {state.fieldErrors.title.join(' ')}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={8}
          placeholder="What happened, what you expected, and anything you already tried."
          aria-invalid={Boolean(state?.fieldErrors?.description)}
          aria-describedby={state?.fieldErrors?.description ? 'description-error' : undefined}
        />
        {state?.fieldErrors?.description ? (
          <p id="description-error" className="text-destructive text-xs">
            {state.fieldErrors.description.join(' ')}
          </p>
        ) : null}
      </div>

      {isAgent ? (
        <div className="grid gap-2">
          <Label htmlFor="priority">Priority</Label>
          <Select name="priority" defaultValue="MEDIUM">
            <SelectTrigger id="priority" className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TICKET_PRIORITIES.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            Priority selects the SLA policy, which sets both deadlines.
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          An agent sets the priority when they triage this ticket, which is what decides its SLA
          deadlines.
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Creating…' : 'Create ticket'}
        </Button>
        <Button type="button" variant="ghost" asChild>
          <Link href="/tickets">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
