import { AppHeader } from '@/components/layout/app-header';
import { Toaster } from '@/components/ui/sonner';
import { requireUser } from '@/lib/auth/dal';

/**
 * `requireUser` runs here so the header can show who is signed in, but it is not the
 * security boundary — layouts do not re-render on every navigation. Each page and server
 * action calls the data access layer itself.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader user={user} />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</div>
      <Toaster />
    </div>
  );
}
