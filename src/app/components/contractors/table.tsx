"use client";
import { parseDateTime } from '@/app/libs/date';
import { parseDocument } from '@/app/libs/parser';
import { SearchResponse } from '@/app/types/search_response';
import { EyeIcon } from '@heroicons/react/24/outline';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { Pagination } from '@nextui-org/pagination';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Modal from '../../components/common/modal';
import ContractorsSearchBar from '../../components/contractors/search-bar';
import { Contractor } from '../../types/contractor';
import { roboto } from '../../ui/fonts';
import CreateContractorModal from './create-contractor';
import { DeleteContractorModal } from './delete-contractor';
import EditContractorModal from './edit-contractor';

interface ContractorsTableProps {
  contractors?: SearchResponse<Contractor>;
  initialPage?: number;
}

export default function ContractorsTable({
  contractors,
  initialPage,
}: ContractorsTableProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contractorID, setContractorID] = useState("");
  const router = useRouter();

  function handleEdit(contractorID: string) {
    setContractorID(contractorID);
    setIsEditModalOpen(true);
  }

  function handleDelete(contractorID: string) {
    setContractorID(contractorID);
    setIsDeleteModalOpen(true);
  }

  function handleRowClick(partnerID: string) {
    router.push(`/contractors/${partnerID}`);
  }

  function handleChangePage(value: number) {
    router.push(`?page=${value}`);
  }

  return (
    <div className="w-full">
      <h1 className={`${roboto.className} mb-8 text-xl md:text-2xl`}>
        Seguradoras
      </h1>

      <ContractorsSearchBar setIsCreationModalOpen={setIsCreateModalOpen} setIsFilterModalOpen={setIsFilterModalOpen} />

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
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Razão social
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Documento
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Data de criação
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
                  {contractors?.result.map((contractor) => (
                    <tr
                      key={contractor.contractor_id}
                      className="group"
                    >
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{`${contractor.company_name}`}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{`${contractor.legal_name}`}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {parseDocument(contractor.document)}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {parseDateTime(contractor.created_at)}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {contractor.active ? 'Ativo' : 'Inativo'}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        <div className="flex items-center gap-3">
                          <button
                            className="text-green-500 hover:text-green-700"
                            onClick={() => handleRowClick(contractor.contractor_id)}>
                            <EyeIcon className="h-5 w-5" />
                          </button>

                          <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => handleEdit(contractor.contractor_id)}
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>

                          {contractor.active &&
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDelete(contractor.contractor_id)}
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

      <div className='mt-2'>
        <Pagination
          onChange={handleChangePage}
          siblings={3}
          showControls
          total={Math.ceil(Number((contractors?.paging.total || 1) / (contractors?.paging.limit || 1)))}
          initialPage={Number(initialPage || 1)}
        />
      </div>

      {isFilterModalOpen && <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
        <div>
          Filtro
        </div>
      </Modal>}

      {isCreateModalOpen && <CreateContractorModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />}

      {isEditModalOpen && <EditContractorModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} contractorID={contractorID} />}

      {isDeleteModalOpen && <DeleteContractorModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} contractorID={contractorID} />}
    </div>
  );
}
