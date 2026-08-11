import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { AuthUser } from '@/lib/api/types';
import { AppNav, type NavItem } from './app-nav';
import { UserMenu } from './user-menu';

export function AppHeader({ user }: { user: AuthUser }) {
  const items: NavItem[] =
    user.role === 'AGENT'
      ? [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/tickets', label: 'Queue' },
        ]
      : [{ href: '/tickets', label: 'My tickets' }];

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/tickets" className="flex items-center gap-2 font-semibold">
          Helpdesk
          {user.role === 'AGENT' ? (
            <Badge variant="secondary" className="font-normal">
              Agent
            </Badge>
          ) : null}
        </Link>

        <AppNav items={items} />

        <div className="ml-auto">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
