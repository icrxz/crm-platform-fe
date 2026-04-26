`use server`;
import UsersTable from '@/app/components/users/table';
import { fetchUsers } from '@/app/services/user';
import { getCurrentUser } from '@/app/libs/session';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

type UserPageParams = {
  searchParams: Promise<{
    query?: string;
    page?: number;
  }>;
};

export default async function Page({ searchParams }: UserPageParams) {
  const { query, page } = await searchParams;
  const session = await getCurrentUser();

  if (!session) {
    redirect('/login');
  }

  const { data: users } = await fetchUsers(
    (query || '') + '&role=operator&role=admin&role=admin_operator',
    page || 1
  );

  return (
    <main>
      <Suspense fallback={<p>Carregando usuários...</p>}>
        <UsersTable users={users} initialPage={page} />
      </Suspense>
    </main>
  );
}
