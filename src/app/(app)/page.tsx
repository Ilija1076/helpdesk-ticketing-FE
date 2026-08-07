import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireUser } from '@/lib/auth/dal';

export default async function HomePage() {
  const user = await requireUser();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {user.name.split(' ')[0]}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {user.role === 'AGENT'
            ? 'Queue, SLA breaches and assignment live here.'
            : 'Raise a ticket and follow it through to resolution.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nothing here yet</CardTitle>
          <CardDescription>Ticket list, detail and dashboard come next.</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Signed in as {user.email}.
        </CardContent>
      </Card>
    </div>
  );
}
