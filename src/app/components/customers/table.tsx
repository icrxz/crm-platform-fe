'use client';
import { parseDateTime } from '@/app/libs/date';
import { parseDocument } from '@/app/libs/parser';
import { CustomerListItem } from '@/app/types/customer-list-item';
import { SearchResponse } from '@/app/types/search_response';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconButton } from '../common/icon-button';
import { ListItemCard, ListItemCardGroup } from '../common/list-item-card';
import { ListPageLayout } from '../common/list-page-layout';
import Modal from '../common/modal';
import { Pagination } from '../common/pagination';
import { Table, TableColumn } from '../common/table';
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

  const columns: TableColumn<CustomerListItem>[] = [
    {
      key: 'name',
      header: 'Nome',
      skeletonWidth: 'w-28',
      render: (customer) => `${customer.first_name} ${customer.last_name}`,
    },
    {
      key: 'email',
      header: 'Email',
      skeletonWidth: 'w-40',
      render: (customer) => customer.email || '-',
    },
    {
      key: 'document',
      header: 'Documento',
      skeletonWidth: 'w-24',
      render: (customer) => parseDocument(customer.document),
    },
    {
      key: 'created_at',
      header: 'Data de criação',
      skeletonWidth: 'w-20',
      render: (customer) => parseDateTime(customer.created_at),
    },
    {
      key: 'actions',
      header: 'Ações',
      skeletonWidth: 'w-16',
      render: (customer) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <IconButton
            color="info"
            icon={<PencilIcon className="h-5 w-5 md:h-6 md:w-6" />}
            onClick={() => handleEdit(customer.customer_id)}
          />

          {customer.active && (
            <IconButton
              color="error"
              icon={<TrashIcon className="h-5 w-5 md:h-6 md:w-6" />}
              onClick={() => handleDelete(customer.customer_id)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <ListPageLayout
        title="Clientes"
        searchBar={
          <CustomersSearchBar
            setIsCreationModalOpen={setIsCreateModalOpen}
            setIsFilterModalOpen={setIsFilterModalOpen}
          />
        }
        pagination={
          <Pagination paging={customers?.paging} page={initialPage} />
        }
        isEmpty={!customers?.result.length}
        emptyMessage="Nenhum cliente encontrado."
        onRefresh={() => router.refresh()}
      >
        <ListItemCardGroup>
          {customers?.result.map((customer) => (
            <ListItemCard
              key={customer.customer_id}
              onClick={() => handleRowClick(customer.customer_id)}
              title={`${customer.first_name} ${customer.last_name}`}
              fields={[
                { label: 'Email', value: customer.email || '-' },
                {
                  label: 'Documento',
                  value: parseDocument(customer.document),
                },
                {
                  label: 'Data de criação',
                  value: parseDateTime(customer.created_at),
                },
              ]}
              actions={
                <>
                  <IconButton
                    color="info"
                    icon={<PencilIcon className="h-5 w-5" />}
                    onClick={() => handleEdit(customer.customer_id)}
                  />
                  {customer.active && (
                    <IconButton
                      color="error"
                      icon={<TrashIcon className="h-5 w-5" />}
                      onClick={() => handleDelete(customer.customer_id)}
                    />
                  )}
                </>
              }
            />
          ))}
        </ListItemCardGroup>

        <Table
          columns={columns}
          data={customers?.result}
          rowKey={(customer) => customer.customer_id}
          onRowClick={(customer) => handleRowClick(customer.customer_id)}
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
    </>
  );
}
