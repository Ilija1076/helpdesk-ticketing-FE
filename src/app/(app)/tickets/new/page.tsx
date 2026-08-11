import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { NewTicketForm } from '@/components/tickets/new-ticket-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireUser } from '@/lib/auth/dal';

export const metadata: Metadata = { title: 'New ticket · Helpdesk' };

/**
 * Sits at /tickets/new, which Next resolves ahead of /tickets/[id] because a static
 * segment always beats a dynamic one.
 */
export default async function NewTicketPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-6">
      <Link
        href="/tickets"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        Back to tickets
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Raise a ticket</CardTitle>
          <CardDescription>The SLA clock starts as soon as this is submitted.</CardDescription>
        </CardHeader>
        <CardContent>
          <NewTicketForm isAgent={user.role === 'AGENT'} />
        </CardContent>
      </Card>
    </div>
  );
}
