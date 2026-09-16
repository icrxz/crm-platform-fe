'use client';
import { parseDocument } from '@/app/libs/parser';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PartnerListItem } from '@/app/types/partner-list-item';
import { SearchResponse } from '@/app/types/search_response';
import { IconButton } from '../common/icon-button';
import { ListItemCard, ListItemCardGroup } from '../common/list-item-card';
import { ListPageLayout } from '../common/list-page-layout';
import { Pagination } from '../common/pagination';
import { Pill } from '../common/pill';
import { Table, TableColumn } from '../common/table';
import CreatePartnerModal from './create-partner';
import { DeletePartnerModal } from './delete-partner';
import EditPartnerModal from './edit-partner';
import PartnersSearchBar from './search-bar';

interface PartnersTableProps {
  partners?: SearchResponse<PartnerListItem>;
  initialPage?: number;
}

export default function PartnersTable({
  partners,
  initialPage = 1,
}: PartnersTableProps) {
  const router = useRouter();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [partnerID, setPartnerID] = useState('');

  function handlePartnerEdit(partnerID: string) {
    setPartnerID(partnerID);
    setIsEditModalOpen(true);
  }

  function handlePartnerDelete(partnerID: string) {
    setPartnerID(partnerID);
    setIsDeleteModalOpen(true);
  }

  function handleRowClick(partnerID: string) {
    router.push(`/partners/${partnerID}`);
  }

  const columns: TableColumn<PartnerListItem>[] = [
    {
      key: 'name',
      header: 'Nome',
      skeletonWidth: 'w-28',
      render: (partner) => `${partner.first_name} ${partner.last_name}`,
    },
    {
      key: 'type',
      header: 'Tipo',
      skeletonWidth: 'w-20',
      render: (partner) => partner.partner_type,
    },
    {
      key: 'document',
      header: 'Documento',
      skeletonWidth: 'w-24',
      render: (partner) => parseDocument(partner.document) || '-',
    },
    {
      key: 'city',
      header: 'Cidade',
      skeletonWidth: 'w-20',
      render: (partner) => partner.city,
    },
    {
      key: 'state',
      header: 'Estado',
      skeletonWidth: 'w-16',
      render: (partner) => partner.state,
    },
    {
      key: 'status',
      header: 'Status',
      skeletonWidth: 'w-16',
      render: (partner) => (
        <Pill
          text={partner.active ? 'Ativo' : 'Inativo'}
          color={partner.active ? 'success' : 'neutral'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      skeletonWidth: 'w-16',
      render: (partner) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <IconButton
            size="sm"
            color="info"
            icon={<PencilIcon className="h-5 w-5" />}
            onClick={() => handlePartnerEdit(partner.partner_id)}
          />

          {partner.active && (
            <IconButton
              size="sm"
              color="error"
              icon={<TrashIcon className="h-5 w-5" />}
              onClick={() => handlePartnerDelete(partner.partner_id)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <ListPageLayout
        title="Técnicos"
        searchBar={
          <PartnersSearchBar setIsCreationModalOpen={setIsCreateModalOpen} />
        }
        pagination={<Pagination paging={partners?.paging} page={initialPage} />}
        isEmpty={!partners?.result.length}
        emptyMessage="Nenhum técnico encontrado."
        onRefresh={() => router.refresh()}
      >
        <ListItemCardGroup>
          {partners?.result.map((partner) => (
            <ListItemCard
              key={partner.partner_id}
              onClick={() => handleRowClick(partner.partner_id)}
              title={`${partner.first_name} ${partner.last_name}`}
              fields={[
                { label: 'Tipo', value: partner.partner_type },
                {
                  label: 'Documento',
                  value: parseDocument(partner.document) || '-',
                },
                { label: 'Cidade', value: partner.city },
                { label: 'Estado', value: partner.state },
                {
                  label: 'Status',
                  value: (
                    <Pill
                      text={partner.active ? 'Ativo' : 'Inativo'}
                      color={partner.active ? 'success' : 'neutral'}
                    />
                  ),
                },
              ]}
              actions={
                <>
                  <IconButton
                    color="info"
                    icon={<PencilIcon className="h-5 w-5" />}
                    onClick={() => handlePartnerEdit(partner.partner_id)}
                  />
                  {partner.active && (
                    <IconButton
                      color="error"
                      icon={<TrashIcon className="h-5 w-5" />}
                      onClick={() => handlePartnerDelete(partner.partner_id)}
                    />
                  )}
                </>
              }
            />
          ))}
        </ListItemCardGroup>

        <Table
          columns={columns}
          data={partners?.result}
          rowKey={(partner) => partner.partner_id}
          onRowClick={(partner) => handleRowClick(partner.partner_id)}
        />
      </ListPageLayout>

      {isCreateModalOpen && (
        <CreatePartnerModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {isEditModalOpen && (
        <EditPartnerModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          partnerID={partnerID}
        />
      )}

      {isDeleteModalOpen && (
        <DeletePartnerModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          partnerID={partnerID}
        />
      )}
    </>
  );
}
