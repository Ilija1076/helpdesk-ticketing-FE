import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { PaginationMeta } from '@/lib/api/types';

export function Pagination({
  meta,
  searchParams,
}: {
  meta: PaginationMeta;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (meta.totalPages <= 1) return null;

  const first = (meta.page - 1) * meta.pageSize + 1;
  const last = Math.min(meta.page * meta.pageSize, meta.total);

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-muted-foreground text-sm">
        {first}–{last} of {meta.total}
      </p>
      <div className="flex gap-2">
        <PageLink searchParams={searchParams} page={meta.page - 1} disabled={meta.page <= 1}>
          Previous
        </PageLink>
        <PageLink
          searchParams={searchParams}
          page={meta.page + 1}
          disabled={meta.page >= meta.totalPages}
        >
          Next
        </PageLink>
      </div>
    </div>
  );
}

function PageLink({
  page,
  disabled,
  searchParams,
  children,
}: {
  page: number;
  disabled: boolean;
  searchParams: Record<string, string | string[] | undefined>;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <Button variant="outline" size="sm" disabled>
        {children}
      </Button>
    );
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') params.set(key, value);
  }
  params.set('page', String(page));

  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={`/tickets?${params.toString()}`} scroll={false}>
        {children}
      </Link>
    </Button>
  );
}
