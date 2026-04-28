import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function unauthorizedRedirect() {
  const cookieStore = await cookies();
  cookieStore.delete('jwt');
  redirect('/login');
}
