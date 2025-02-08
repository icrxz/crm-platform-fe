"use client";
import { SearchResponse } from '@/app/types/search_response';
import { User, UserRole } from '@/app/types/user';
import { EyeIcon } from '@heroicons/react/24/outline';
import { Pagination } from '@nextui-org/pagination';
import { useRouter } from 'next/navigation';
import { roboto } from '../../ui/fonts';

interface UsersTableProps {
  users?: SearchResponse<User>;
  initialPage?: number;
}

const roleMap: Record<UserRole, string> = {
  'operator': "Operador",
  'admin': "Administrador",
  'thavanna_admin': "Thavanna Admin",
  'admin_operator': "Administrador",
};

export default function UsersTable({
  users,
  initialPage = 1,
}: UsersTableProps) {
  const router = useRouter();

  function handleRowClick(userID: string) {
    router.push(`/users/${userID}`);
  }

  function handleChangePage(value: number) {
    router.push(`?page=${value}`);
  }

  return (
    <div className="w-full">
      <h1 className={`${roboto.className} mb-8 text-xl md:text-2xl`}>
        Usuários
      </h1>

      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">

              <table className="hidden min-w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Nome
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Username
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Cargo
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {users?.result.filter((user) => user.role != UserRole.THAVANNA_ADMIN).map((user) => (
                    <tr key={user.user_id} className="group">
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{`${user.first_name} ${user.last_name}`}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {user.username}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {roleMap[user.role]}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {user.active ? 'Ativo' : 'Inativo'}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        <div className='flex gap-2'>
                          <button
                            disabled={!user.active}
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => handleRowClick(user.user_id)}>
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-2'>
        <Pagination
          onChange={handleChangePage}
          siblings={3}
          showControls
          total={Math.ceil(Number((users?.paging.total || 1) / (users?.paging.limit || 1)))}
          page={Number(initialPage || 1)}
        />
      </div>

      {/* {isDeleteModalOpen && <DeletePartnerModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} partnerID={partnerID} />} */}
    </div>
  );
}
