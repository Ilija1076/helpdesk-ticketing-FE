'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { register, type AuthFormState } from '@/lib/auth/actions';
import { Field, FormError, SubmitButton } from './field';

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthFormState | undefined, FormData>(
    register,
    undefined,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>New accounts start with the client role.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <FormError message={state?.message} />

          <Field label="Name" name="name" autoComplete="name" errors={state?.fieldErrors?.name} />
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
            autoComplete="new-password"
            errors={state?.fieldErrors?.password}
          />

          <SubmitButton pending={pending}>Create account</SubmitButton>

          <p className="text-muted-foreground text-center text-sm">
            Already registered?{' '}
            <Link
              href="/login"
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
