'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TICKET_PRIORITIES, TICKET_STATUSES } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  WAITING_ON_CUSTOMER: 'Waiting',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const SEARCH_DEBOUNCE_MS = 350;

export function TicketFilters({ showQueueFilters }: { showQueueFilters: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  // Tracks whether the user is the one changing the box, so that navigating with the
  // back button still updates it without firing another navigation.
  const typing = useRef(false);

  useEffect(() => {
    if (!typing.current) return;

    const timer = setTimeout(() => {
      typing.current = false;
      apply({ search: search || null, page: null });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (typing.current) return;
    setSearch(searchParams.get('search') ?? '');
  }, [searchParams]);

  function apply(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(changes)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function toggleInList(key: string, value: string) {
    const current = (searchParams.get(key) ?? '').split(',').filter(Boolean);
    const next = current.includes(value)
      ? current.filter((entry) => entry !== value)
      : [...current, value];

    // Any filter change invalidates the current page number.
    apply({ [key]: next.length ? next.join(',') : null, page: null });
  }

  function toggleFlag(key: string) {
    apply({ [key]: searchParams.get(key) === 'true' ? null : 'true', page: null });
  }

  const activeStatuses = (searchParams.get('status') ?? '').split(',').filter(Boolean);
  const activePriorities = (searchParams.get('priority') ?? '').split(',').filter(Boolean);
  const hasFilters = Array.from(searchParams.keys()).some((key) => key !== 'page');

  return (
    <div className={cn('grid gap-3', pending && 'opacity-70')}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => {
              typing.current = true;
              setSearch(event.target.value);
            }}
            placeholder="Search title and description…"
            className="pl-8"
            aria-label="Search tickets"
          />
        </div>

        {showQueueFilters ? (
          <>
            <FilterToggle
              active={searchParams.get('breached') === 'true'}
              onClick={() => toggleFlag('breached')}
            >
              Breached
            </FilterToggle>
            <FilterToggle
              active={searchParams.get('unassigned') === 'true'}
              onClick={() => toggleFlag('unassigned')}
            >
              Unassigned
            </FilterToggle>
          </>
        ) : null}

        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              startTransition(() => {
                router.push(pathname, { scroll: false });
              })
            }
          >
            <X />
            Clear
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TICKET_STATUSES.map((status) => (
          <ChipToggle
            key={status}
            active={activeStatuses.includes(status)}
            onClick={() => toggleInList('status', status)}
          >
            {STATUS_LABELS[status]}
          </ChipToggle>
        ))}
        <span className="bg-border mx-1 w-px self-stretch" aria-hidden />
        {TICKET_PRIORITIES.map((priority) => (
          <ChipToggle
            key={priority}
            active={activePriorities.includes(priority)}
            onClick={() => toggleInList('priority', priority)}
          >
            {priority[0] + priority.slice(1).toLowerCase()}
          </ChipToggle>
        ))}
      </div>
    </div>
  );
}

function ChipToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}>
      <Badge
        variant={active ? 'default' : 'outline'}
        className="cursor-pointer font-normal transition-colors"
      >
        {children}
      </Badge>
    </button>
  );
}

function FilterToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? 'default' : 'outline'}
      size="sm"
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
