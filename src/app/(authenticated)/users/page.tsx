`use server`;
import UsersTable from '@/app/components/users/table';
import { fetchUsers } from '@/app/services/user';
import { getCurrentUser } from '@/app/libs/session';
import { UserListItem } from '@/app/types/user-list-item';
import { adminRoles } from '@/app/utils/roles';
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

  if (!adminRoles.includes(session.role)) {
    redirect('/home');
  }

  const { data: usersData } = await fetchUsers(
    (query || '') + '&role=operator&role=admin&role=admin_operator',
    page || 1
  );

  const users = usersData
    ? {
        result: usersData.result.map(
          (u): UserListItem => ({
            user_id: u.user_id,
            username: u.username,
            first_name: u.first_name,
            last_name: u.last_name,
            email: u.email,
            role: u.role,
            active: u.active,
          })
        ),
        paging: usersData.paging,
      }
    : undefined;

  return (
    <main>
      <Suspense fallback={<p>Carregando usuários...</p>}>
        <UsersTable users={users} initialPage={page} />
      </Suspense>
    </main>
  );
}
