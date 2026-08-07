'use client';

import { useActionState } from 'react';
import { logout } from '@/lib/auth/actions';

export function LogoutButton() {
  const [, action, pending] = useActionState(async () => {
    await logout();
  }, undefined);

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        {pending ? 'Signing out…' : 'Sign out'}
      </button>
    </form>
  );
}
