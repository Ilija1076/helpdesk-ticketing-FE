import { LogoutButton } from '@/components/auth/logout-button';
import { Badge } from '@/components/ui/badge';
import { requireUser } from '@/lib/auth/dal';

export default async function HomePage() {
  const user = await requireUser();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Signed in as {user.name}</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
            {user.email}
            <Badge variant="secondary">{user.role}</Badge>
          </p>
        </div>
        <LogoutButton />
      </div>

      <p className="text-muted-foreground mt-10 text-sm">
        Ticket list, detail and dashboard come next.
      </p>
    </main>
  );
}
