'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { login, type AuthFormState } from '@/lib/auth/actions';
import { Field, FormError, SubmitButton } from './field';

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthFormState | undefined, FormData>(
    login,
    undefined,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your helpdesk account to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          {next ? <input type="hidden" name="next" value={next} /> : null}

          <FormError message={state?.message} />

          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            errors={state?.fieldErrors?.email}
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            errors={state?.fieldErrors?.password}
          />

          <SubmitButton pending={pending}>Sign in</SubmitButton>

          <p className="text-muted-foreground text-center text-sm">
            No account?{' '}
            <Link
              href="/register"
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
