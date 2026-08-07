export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">Helpdesk</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Ticketing with business-hours SLA tracking
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
