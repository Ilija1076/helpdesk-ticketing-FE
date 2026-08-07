import { LogoutButton } from '@/components/auth/logout-button';
import { requireUser } from '@/lib/auth/dal';

export default async function HomePage() {
  const user = await requireUser();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
            Signed in as {user.name}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {user.email} · {user.role}
          </p>
        </div>
        <LogoutButton />
      </div>

      <p className="mt-10 text-sm text-neutral-500 dark:text-neutral-400">
        Ticket list, detail and dashboard come next.
      </p>
    </main>
  );
}
