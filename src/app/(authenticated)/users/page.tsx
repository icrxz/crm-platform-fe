import UsersTable from '@/app/components/users/table';
import { fetchUsers } from '@/app/services/user';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Usuários',
};

type UserPageParams = {
  searchParams?: {
    query?: string;
    page?: string;
  };
};


export default async function Page({ searchParams }: UserPageParams) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const query = searchParams?.query || '';
  const users = await fetchUsers(query);

  return (
    <main>
      <Suspense fallback={<p>Carregando usuários...</p>}>
        {users && <UsersTable users={users.data || []} />}
      </Suspense>
    </main>
  );
}
