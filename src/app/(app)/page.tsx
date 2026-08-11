import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/dal';

/** Agents land on queue health; clients land on their own tickets. */
export default async function HomePage() {
  const user = await requireUser();
  redirect(user.role === 'AGENT' ? '/dashboard' : '/tickets');
}
