'use client';
import clsx from 'clsx';
import { UserListItem } from '@/app/types/user-list-item';
import { UserRole } from '@/app/types/user';
import { SearchResponse } from '@/app/types/search_response';
import { roleLabels } from '@/app/utils/roles';
import { useRouter } from 'next/navigation';
import { roboto } from '../../ui/fonts';
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

  return (
    <div className="flex h-full w-full flex-col">
      <h1 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
        Usuários
      </h1>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto">
        <div className="flex w-full flex-col gap-4">
          <div className="flow-root">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
                  <table className="hidden min-w-full rounded-md text-gray-900 md:table">
                    <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 font-medium sm:pl-6"
                        >
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
                      {users?.result
                        .filter((user) => user.role != UserRole.THAVANNA_ADMIN)
                        .map((user) => (
                          <tr
                            key={user.user_id}
                            className={clsx(
                              'group',
                              user.active && 'cursor-pointer'
                            )}
                            onClick={() =>
                              user.active && handleRowClick(user.user_id)
                            }
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
                </div>
              </div>
            </div>
          </div>

          <Pagination paging={users?.paging} page={initialPage} />
        </div>
      </div>

      {/* {isDeleteModalOpen && <DeletePartnerModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} partnerID={partnerID} />} */}
    </div>
  );
}
