"use client";
import { parseDateTime } from '@/app/libs/date';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Customer } from '../../types/customer';
import { lusitana } from '../../ui/fonts';
import Modal from '../common/modal';
import CreateCustomerModal from './create-customer';
import { DeleteCustomerModal } from './delete-customer';
import EditCustomerModal from './edit-customer';
import CustomersSearchBar from './search-bar';

export default function CustomersTable({
  customers,
}: {
  customers: Customer[];
}) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [costumerID, setCostumerID] = useState("");
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
      <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
        Clientes
      </h1>

      <CustomersSearchBar setIsCreationModalOpen={setIsCreateModalOpen} setIsFilterModalOpen={setIsFilterModalOpen} />

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
                      Email
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Documento
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Data de criação
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {customers.map((customer) => (
                    <tr key={customer.customer_id} className="group">
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{`${customer.first_name} ${customer.last_name}`}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {customer.personal_contact?.email || '-'}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {customer.document}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {parseDateTime(customer.created_at)}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        <div className='flex gap-2'>
                          <button
                            className="text-green-500 hover:text-green-700"
                            onClick={() => handleRowClick(customer.customer_id)}>
                            <EyeIcon className="h-5 w-5" />
                          </button>

                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleEdit(customer.customer_id)}
                          >
                            <PencilIcon className='w-5 md:w-6' />
                          </button>

                          {customer.active &&
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDelete(customer.customer_id)}
                            >
                              <TrashIcon className='w-5 md:w-6' />
                            </button>
                          }
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

      {isFilterModalOpen && <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
        <div>
          Filtro
        </div>
      </Modal>}

      {isCreateModalOpen && <CreateCustomerModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />}

      {isEditModalOpen && <EditCustomerModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} customerID={costumerID} />}

      {isDeleteModalOpen && <DeleteCustomerModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} customerID={costumerID} />}
    </div>
  );
}
