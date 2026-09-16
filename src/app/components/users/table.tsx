'use client';
import clsx from 'clsx';
import { UserListItem } from '@/app/types/user-list-item';
import { UserRole } from '@/app/types/user';
import { SearchResponse } from '@/app/types/search_response';
import { roleLabels } from '@/app/utils/roles';
import { useRouter } from 'next/navigation';
import { ListItemCard, ListItemCardGroup } from '../common/list-item-card';
import { ListPageLayout } from '../common/list-page-layout';
import { Pagination } from '../common/pagination';
import { Pill } from '../common/pill';

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

  return (
    <ListPageLayout
      title="Usuários"
      pagination={<Pagination paging={users?.paging} page={initialPage} />}
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

      <table className="hidden min-w-full rounded-md text-gray-900 md:table">
        <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium sm:pl-6">
              Nome
            </th>
            <th scope="col" className="px-3 py-3 font-medium">
              Username
            </th>
            <th scope="col" className="px-3 py-3 font-medium">
              Email
            </th>
            <th scope="col" className="px-3 py-3 font-medium">
              Cargo
            </th>
            <th scope="col" className="px-3 py-3 font-medium">
              Status
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 text-gray-900">
          {visibleUsers?.map((user) => (
            <tr
              key={user.user_id}
              className={clsx('group', user.active && 'cursor-pointer')}
              onClick={() => user.active && handleRowClick(user.user_id)}
            >
              <td
                className={clsx(
                  'whitespace-nowrap bg-white py-3 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6',
                  user.active && 'group-hover:bg-gray-100'
                )}
              >
                <div className="flex items-center gap-3">
                  <p>{`${user.first_name} ${user.last_name}`}</p>
                </div>
              </td>
              <td
                className={clsx(
                  'whitespace-nowrap bg-white px-4 py-3 text-sm',
                  user.active && 'group-hover:bg-gray-100'
                )}
              >
                {user.username}
              </td>
              <td
                className={clsx(
                  'whitespace-nowrap bg-white px-4 py-3 text-sm',
                  user.active && 'group-hover:bg-gray-100'
                )}
              >
                {user.email}
              </td>
              <td
                className={clsx(
                  'whitespace-nowrap bg-white px-4 py-3 text-sm',
                  user.active && 'group-hover:bg-gray-100'
                )}
              >
                {roleLabels[user.role]}
              </td>
              <td
                className={clsx(
                  'whitespace-nowrap bg-white px-4 py-3 text-sm',
                  user.active && 'group-hover:bg-gray-100'
                )}
              >
                <Pill
                  text={user.active ? 'Ativo' : 'Inativo'}
                  color={user.active ? 'success' : 'neutral'}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ListPageLayout>
  );
}
