'use client';
import { parseDateTime } from '@/app/libs/date';
import { parseDocument } from '@/app/libs/parser';
import { CustomerListItem } from '@/app/types/customer-list-item';
import { SearchResponse } from '@/app/types/search_response';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { roboto } from '../../ui/fonts';
import { IconButton } from '../common/icon-button';
import Modal from '../common/modal';
import { Pagination } from '../common/pagination';
import CreateCustomerModal from './create-customer';
import { DeleteCustomerModal } from './delete-customer';
import EditCustomerModal from './edit-customer';
import CustomersSearchBar from './search-bar';

interface CustomersTableProps {
  customers?: SearchResponse<CustomerListItem>;
  initialPage?: number;
}

export default function CustomersTable({
  customers,
  initialPage,
}: CustomersTableProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [costumerID, setCostumerID] = useState('');
  const router = useRouter();

  function handleEdit(costumerID: string) {
    setCostumerID(costumerID);
    setIsEditModalOpen(true);
  }

  function handleDelete(costumerID: string) {
    setCostumerID(costumerID);
    setIsDeleteModalOpen(true);
  }

  function handleRowClick(costumerID: string) {
    router.push(`/customers/${costumerID}`);
  }

  return (
    <div className="w-full">
      <h1 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
        Clientes
      </h1>

      <CustomersSearchBar
        setIsCreationModalOpen={setIsCreateModalOpen}
        setIsFilterModalOpen={setIsFilterModalOpen}
      />

      <div className="mt-4 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              <table className="hidden min-w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium sm:pl-6">
                      Nome
                    </th>
                    <th scope="col" className="px-3 py-3 font-medium">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3 font-medium">
                      Documento
                    </th>
                    <th scope="col" className="px-3 py-3 font-medium">
                      Data de criação
                    </th>
                    <th scope="col" className="px-3 py-3 font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {customers?.result.map((customer) => (
                    <tr
                      key={customer.customer_id}
                      className="group cursor-pointer"
                      onClick={() => handleRowClick(customer.customer_id)}
                    >
                      <td className="whitespace-nowrap bg-white py-3 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md group-hover:bg-gray-100 sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{`${customer.first_name} ${customer.last_name}`}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-3 text-sm group-hover:bg-gray-100">
                        {customer.email || '-'}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-3 text-sm group-hover:bg-gray-100">
                        {parseDocument(customer.document)}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-3 text-sm group-hover:bg-gray-100">
                        {parseDateTime(customer.created_at)}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-3 text-sm group-hover:bg-gray-100">
                        <div
                          className="flex gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconButton
                            color="info"
                            icon={
                              <PencilIcon className="h-5 w-5 md:h-6 md:w-6" />
                            }
                            onClick={() => handleEdit(customer.customer_id)}
                          />

                          {customer.active && (
                            <IconButton
                              color="error"
                              icon={
                                <TrashIcon className="h-5 w-5 md:h-6 md:w-6" />
                              }
                              onClick={() => handleDelete(customer.customer_id)}
                            />
                          )}
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

      <Pagination paging={customers?.paging} page={initialPage} />

      {isFilterModalOpen && (
        <Modal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
        >
          <div>Filtro</div>
        </Modal>
      )}

      {isCreateModalOpen && (
        <CreateCustomerModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {isEditModalOpen && (
        <EditCustomerModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          customerID={costumerID}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteCustomerModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          customerID={costumerID}
        />
      )}
    </div>
  );
}
