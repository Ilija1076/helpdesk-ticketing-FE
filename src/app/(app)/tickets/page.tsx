import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Pagination } from '@/components/tickets/pagination';
import { TicketFilters } from '@/components/tickets/ticket-filters';
import { TicketTable } from '@/components/tickets/ticket-table';
import { Skeleton } from '@/components/ui/skeleton';
import { listTickets } from '@/lib/api/tickets';
import {
  TICKET_PRIORITIES,
  TICKET_SORT_FIELDS,
  TICKET_STATUSES,
  type TicketListQuery,
} from '@/lib/api/types';
import { requireUser } from '@/lib/auth/dal';

export const metadata: Metadata = { title: 'Tickets · Helpdesk' };

type SearchParams = Record<string, string | string[] | undefined>;

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const isAgent = user.role === 'AGENT';

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{isAgent ? 'All tickets' : 'My tickets'}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isAgent
            ? 'Everything in the queue, with both SLA clocks.'
            : 'Tickets you have raised, with their SLA deadlines.'}
        </p>
      </div>

      <TicketFilters showQueueFilters={isAgent} />

      {/* Keyed on the query so a filter change swaps in the skeleton instead of
          leaving the previous page's rows on screen. */}
      <Suspense key={JSON.stringify(params)} fallback={<TableSkeleton />}>
        <TicketResults params={params} showRequester={isAgent} />
      </Suspense>
    </div>
  );
}

async function TicketResults({
  params,
  showRequester,
}: {
  params: SearchParams;
  showRequester: boolean;
}) {
  const { data, meta, fetchedAt } = await listTickets(parseQuery(params));

  return (
    <div className="grid gap-4">
      <TicketTable tickets={data} showRequester={showRequester} now={fetchedAt} />
      <Pagination meta={meta} searchParams={params} />
    </div>
  );
}

/**
 * Search params are user input, so every value is validated against the contract before it
 * reaches the API. Anything unrecognised is dropped rather than forwarded, which keeps a
 * hand-edited URL from turning into a 400 from the backend's ValidationPipe.
 */
function parseQuery(params: SearchParams): TicketListQuery {
  const query: TicketListQuery = { page: parsePage(params.page), pageSize: 20 };

  const statuses = parseEnumList(params.status, TICKET_STATUSES);
  if (statuses.length) query.status = statuses;

  const priorities = parseEnumList(params.priority, TICKET_PRIORITIES);
  if (priorities.length) query.priority = priorities;

  const search = single(params.search)?.trim();
  if (search) query.search = search.slice(0, 200);

  if (single(params.breached) === 'true') query.breached = true;
  if (single(params.unassigned) === 'true') query.unassigned = true;

  const [sortBy] = parseEnumList(params.sortBy, TICKET_SORT_FIELDS);
  if (sortBy) query.sortBy = sortBy;

  const sortOrder = single(params.sortOrder);
  if (sortOrder === 'asc' || sortOrder === 'desc') query.sortOrder = sortOrder;

  return query;
}

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | string[] | undefined): number {
  const page = Number(single(value));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseEnumList<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
): T[] {
  const raw = single(value);
  if (!raw) return [];

  const seen = new Set<T>();
  for (const entry of raw.split(',')) {
    const candidate = entry.trim() as T;
    if (allowed.includes(candidate)) seen.add(candidate);
  }
  return [...seen];
}

function TableSkeleton() {
  return (
    <div className="grid gap-2 rounded-lg border p-4">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
