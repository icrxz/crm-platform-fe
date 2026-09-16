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
import { Table, TableColumn } from '../../components/common/table';
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

  const columns: TableColumn<ContractorListItem>[] = [
    {
      key: 'company_name',
      header: 'Nome',
      skeletonWidth: 'w-28',
      render: (contractor) => contractor.company_name,
    },
    {
      key: 'legal_name',
      header: 'Razão social',
      skeletonWidth: 'w-40',
      render: (contractor) => contractor.legal_name,
    },
    {
      key: 'document',
      header: 'Documento',
      skeletonWidth: 'w-24',
      render: (contractor) => parseDocument(contractor.document),
    },
    {
      key: 'created_at',
      header: 'Data de criação',
      skeletonWidth: 'w-20',
      render: (contractor) => parseDateTime(contractor.created_at),
    },
    {
      key: 'status',
      header: 'Status',
      skeletonWidth: 'w-16',
      render: (contractor) => (
        <Pill
          text={contractor.active ? 'Ativo' : 'Inativo'}
          color={contractor.active ? 'success' : 'neutral'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      skeletonWidth: 'w-16',
      render: (contractor) => (
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
      ),
    },
  ];

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

        <Table
          columns={columns}
          data={contractors?.result}
          rowKey={(contractor) => contractor.contractor_id}
          onRowClick={(contractor) => handleRowClick(contractor.contractor_id)}
        />
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
