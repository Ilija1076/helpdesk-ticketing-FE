export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold">Helpdesk</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Ticketing with business-hours SLA tracking
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
