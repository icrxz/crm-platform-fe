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
    page?: number;
  };
};


export default async function Page({ searchParams }: UserPageParams) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const query = searchParams?.query || '';
  const { data: users } = await fetchUsers(query+'&role=operator&role=admin&role=admin_operator', (searchParams?.page || 1));

  return (
    <main>
      <Suspense fallback={<p>Carregando usuários...</p>}>
        <UsersTable users={users} initialPage={searchParams?.page} />
      </Suspense>
    </main>
  );
}
