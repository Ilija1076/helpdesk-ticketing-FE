'use client';

import { LogOut } from 'lucide-react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/auth/actions';

export function LogoutButton() {
  const [, action, pending] = useActionState(async () => {
    await logout();
  }, undefined);

  return (
    <form action={action}>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        <LogOut />
        {pending ? 'Signing out…' : 'Sign out'}
      </Button>
    </form>
  );
}
