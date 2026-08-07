'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { login, type AuthFormState } from '@/lib/auth/actions';
import { Field, FormError, SubmitButton } from './field';

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthFormState | undefined, FormData>(
    login,
    undefined,
  );

  return (
    <form
      action={action}
      className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
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

      <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
        No account?{' '}
        <Link href="/register" className="font-medium text-neutral-900 dark:text-neutral-50">
          Register
        </Link>
      </p>
    </form>
  );
}
