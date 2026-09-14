import { redirect } from 'next/navigation';

export function unauthorizedRedirect(): never {
  redirect('/api/auth/clear-session');
}
