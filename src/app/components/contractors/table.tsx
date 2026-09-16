'use client';
import { parseDateTime } from '@/app/libs/date';
import { parseDocument } from '@/app/libs/parser';
import { ContractorListItem } from '@/app/types/contractor-list-item';
import { SearchResponse } from '@/app/types/search_response';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconButton } from '../../components/common/icon-button';
import {
  ListItemCard,
  ListItemCardGroup,
} from '../../components/common/list-item-card';
import { ListPageLayout } from '../../components/common/list-page-layout';
import Modal from '../../components/common/modal';
import { Pagination } from '../../components/common/pagination';
import { Pill } from '../../components/common/pill';
import ContractorsSearchBar from '../../components/contractors/search-bar';
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
    <>
      <ListPageLayout
        title="Seguradoras"
        searchBar={
          <ContractorsSearchBar
            setIsCreationModalOpen={setIsCreateModalOpen}
            setIsFilterModalOpen={setIsFilterModalOpen}
          />
        }
        pagination={
          <Pagination paging={contractors?.paging} page={initialPage} />
        }
        isEmpty={!contractors?.result.length}
        emptyMessage="Nenhuma seguradora encontrada."
        onRefresh={() => router.refresh()}
      >
        <ListItemCardGroup>
          {contractors?.result.map((contractor) => (
            <ListItemCard
              key={contractor.contractor_id}
              onClick={() => handleRowClick(contractor.contractor_id)}
              title={contractor.company_name}
              fields={[
                { label: 'Razão social', value: contractor.legal_name },
                {
                  label: 'Documento',
                  value: parseDocument(contractor.document),
                },
                {
                  label: 'Data de criação',
                  value: parseDateTime(contractor.created_at),
                },
                {
                  label: 'Status',
                  value: (
                    <Pill
                      text={contractor.active ? 'Ativo' : 'Inativo'}
                      color={contractor.active ? 'success' : 'neutral'}
                    />
                  ),
                },
              ]}
              actions={
                <>
                  <IconButton
                    color="info"
                    icon={<PencilIcon className="h-5 w-5" />}
                    onClick={() => handleEdit(contractor.contractor_id)}
                  />
                  {contractor.active && (
                    <IconButton
                      color="error"
                      icon={<TrashIcon className="h-5 w-5" />}
                      onClick={() => handleDelete(contractor.contractor_id)}
                    />
                  )}
                </>
              }
            />
          ))}
        </ListItemCardGroup>

        <table className="hidden min-w-full rounded-md text-gray-900 md:table">
          <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium sm:pl-6">
                Nome
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:pl-6">
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
                onClick={() => handleRowClick(contractor.contractor_id)}
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
                      icon={<PencilIcon className="h-5 w-5 md:h-6 md:w-6" />}
                      onClick={() => handleEdit(contractor.contractor_id)}
                    />

                    {contractor.active && (
                      <IconButton
                        color="error"
                        icon={<TrashIcon className="h-5 w-5 md:h-6 md:w-6" />}
                        onClick={() => handleDelete(contractor.contractor_id)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ListPageLayout>

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
    </>
  );
}
