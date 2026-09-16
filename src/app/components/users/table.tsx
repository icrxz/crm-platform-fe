'use client';
import { UserListItem } from '@/app/types/user-list-item';
import { UserRole } from '@/app/types/user';
import { SearchResponse } from '@/app/types/search_response';
import { roleLabels } from '@/app/utils/roles';
import { useRouter } from 'next/navigation';
import { ListItemCard, ListItemCardGroup } from '../common/list-item-card';
import { ListPageLayout } from '../common/list-page-layout';
import { Pagination } from '../common/pagination';
import { Pill } from '../common/pill';
import { Table, TableColumn } from '../common/table';

interface UsersTableProps {
  users?: SearchResponse<UserListItem>;
  initialPage?: number;
}

export default function UsersTable({
  users,
  initialPage = 1,
}: UsersTableProps) {
  const router = useRouter();

  function handleRowClick(userID: string) {
    router.push(`/users/${userID}`);
  }

  const visibleUsers = users?.result.filter(
    (user) => user.role != UserRole.THAVANNA_ADMIN
  );

  const columns: TableColumn<UserListItem>[] = [
    {
      key: 'name',
      header: 'Nome',
      skeletonWidth: 'w-28',
      render: (user) => `${user.first_name} ${user.last_name}`,
    },
    {
      key: 'username',
      header: 'Username',
      skeletonWidth: 'w-24',
      render: (user) => user.username,
    },
    {
      key: 'email',
      header: 'Email',
      skeletonWidth: 'w-40',
      render: (user) => user.email,
    },
    {
      key: 'role',
      header: 'Cargo',
      skeletonWidth: 'w-20',
      render: (user) => roleLabels[user.role],
    },
    {
      key: 'status',
      header: 'Status',
      skeletonWidth: 'w-16',
      render: (user) => (
        <Pill
          text={user.active ? 'Ativo' : 'Inativo'}
          color={user.active ? 'success' : 'neutral'}
        />
      ),
    },
  ];

  return (
    <ListPageLayout
      title="Usuários"
      pagination={<Pagination paging={users?.paging} page={initialPage} />}
      isEmpty={!visibleUsers?.length}
      emptyMessage="Nenhum usuário encontrado."
      onRefresh={() => router.refresh()}
    >
      <ListItemCardGroup>
        {visibleUsers?.map((user) => (
          <ListItemCard
            key={user.user_id}
            onClick={
              user.active ? () => handleRowClick(user.user_id) : undefined
            }
            title={`${user.first_name} ${user.last_name}`}
            fields={[
              { label: 'Username', value: user.username },
              { label: 'Email', value: user.email },
              { label: 'Cargo', value: roleLabels[user.role] },
              {
                label: 'Status',
                value: (
                  <Pill
                    text={user.active ? 'Ativo' : 'Inativo'}
                    color={user.active ? 'success' : 'neutral'}
                  />
                ),
              },
            ]}
          />
        ))}
      </ListItemCardGroup>

      <Table
        columns={columns}
        data={visibleUsers}
        rowKey={(user) => user.user_id}
        onRowClick={(user) => handleRowClick(user.user_id)}
        isRowClickable={(user) => user.active}
      />
    </ListPageLayout>
  );
}
