'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { register, type AuthFormState } from '@/lib/auth/actions';
import { Field, FormError, SubmitButton } from './field';

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthFormState | undefined, FormData>(
    register,
    undefined,
  );

  return (
    <form
      action={action}
      className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
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

      <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
        Already registered?{' '}
        <Link href="/login" className="font-medium text-neutral-900 dark:text-neutral-50">
          Sign in
        </Link>
      </p>
    </form>
  );
}
