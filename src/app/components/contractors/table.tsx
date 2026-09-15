'use client';
import { parseDateTime } from '@/app/libs/date';
import { parseDocument } from '@/app/libs/parser';
import { ContractorListItem } from '@/app/types/contractor-list-item';
import { SearchResponse } from '@/app/types/search_response';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Modal from '../../components/common/modal';
import { IconButton } from '../../components/common/icon-button';
import { Pagination } from '../../components/common/pagination';
import { Pill } from '../../components/common/pill';
import ContractorsSearchBar from '../../components/contractors/search-bar';
import { roboto } from '../../ui/fonts';
import CreateContractorModal from './create-contractor';
import { DeleteContractorModal } from './delete-contractor';
import EditContractorModal from './edit-contractor';

interface ContractorsTableProps {
  contractors?: SearchResponse<ContractorListItem>;
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
  const [contractorID, setContractorID] = useState('');
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

  return (
    <div className="flex h-full w-full flex-col">
      <h1 className={`${roboto.className} mb-4 mt-4 text-xl md:text-2xl`}>
        Seguradoras
      </h1>

      <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto overflow-x-hidden">
        <div className="my-auto flex w-full flex-col gap-4">
          <ContractorsSearchBar
            setIsCreationModalOpen={setIsCreateModalOpen}
            setIsFilterModalOpen={setIsFilterModalOpen}
          />

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
                        <th
                          scope="col"
                          className="px-4 py-3 font-medium sm:pl-6"
                        >
                          Razão social
                        </th>
                        <th scope="col" className="px-3 py-3 font-medium">
                          Documento
                        </th>
                        <th scope="col" className="px-3 py-3 font-medium">
                          Data de criação
                        </th>
                        <th scope="col" className="px-3 py-3 font-medium">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-3 font-medium">
                          Ações
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 text-gray-900">
                      {contractors?.result.map((contractor) => (
                        <tr
                          key={contractor.contractor_id}
                          className="group cursor-pointer"
                          onClick={() =>
                            handleRowClick(contractor.contractor_id)
                          }
                        >
                          <td className="whitespace-nowrap bg-white py-3 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md group-hover:bg-gray-100 sm:pl-6">
                            <div className="flex items-center gap-3">
                              <p>{`${contractor.company_name}`}</p>
                            </div>
                          </td>
                          <td className="whitespace-nowrap bg-white py-3 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md group-hover:bg-gray-100 sm:pl-6">
                            <div className="flex items-center gap-3">
                              <p>{`${contractor.legal_name}`}</p>
                            </div>
                          </td>
                          <td className="whitespace-nowrap bg-white px-4 py-3 text-sm group-hover:bg-gray-100">
                            {parseDocument(contractor.document)}
                          </td>
                          <td className="whitespace-nowrap bg-white px-4 py-3 text-sm group-hover:bg-gray-100">
                            {parseDateTime(contractor.created_at)}
                          </td>
                          <td className="whitespace-nowrap bg-white px-4 py-3 text-sm group-hover:bg-gray-100">
                            <Pill
                              text={contractor.active ? 'Ativo' : 'Inativo'}
                              color={contractor.active ? 'success' : 'neutral'}
                            />
                          </td>
                          <td className="whitespace-nowrap bg-white px-4 py-3 text-sm group-hover:bg-gray-100">
                            <div
                              className="flex items-center gap-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <IconButton
                                color="info"
                                icon={
                                  <PencilIcon className="h-5 w-5 md:h-6 md:w-6" />
                                }
                                onClick={() =>
                                  handleEdit(contractor.contractor_id)
                                }
                              />

                              {contractor.active && (
                                <IconButton
                                  color="error"
                                  icon={
                                    <TrashIcon className="h-5 w-5 md:h-6 md:w-6" />
                                  }
                                  onClick={() =>
                                    handleDelete(contractor.contractor_id)
                                  }
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

          <Pagination paging={contractors?.paging} page={initialPage} />
        </div>
      </div>

      {isFilterModalOpen && (
        <Modal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
        >
          <div>Filtro</div>
        </Modal>
      )}

      {isCreateModalOpen && (
        <CreateContractorModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {isEditModalOpen && (
        <EditContractorModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          contractorID={contractorID}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteContractorModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          contractorID={contractorID}
        />
      )}
    </div>
  );
}
