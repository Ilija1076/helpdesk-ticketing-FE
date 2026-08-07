import { redirect } from 'next/navigation';

/** The queue is the landing screen for both roles; the dashboard comes later. */
export default function HomePage() {
  redirect('/tickets');
}
