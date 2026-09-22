'use client';
import { CaseListItem } from '@/app/types/case-list-item';
import { SearchResponse } from '@/app/types/search_response';
import { UserRole } from '@/app/types/user';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import {
  CaseFilters,
  getStoredCaseFilters,
  setStoredCaseFilters,
} from '../../libs/case-filters-storage';
import { parseDateTime } from '../../libs/date';
import { caseCategoryMap, caseStatusMap, CaseCategory } from '../../types/case';
import { getDefaultCaseStatuses } from '../../utils/case_status';
import { adminRoles } from '../../utils/roles';
import { ListItemCard, ListItemCardGroup } from '../common/list-item-card';
import { ListPageLayout } from '../common/list-page-layout';
import { Pagination } from '../common/pagination';
import { Table, TableColumn } from '../common/table';
import { CreateCaseBatchModal } from './batch-form-modal';
import CreateCaseModal from './create-case';
import { FilterModal } from './filter-modal';
import CasesSearchBar from './search-bar';

interface CasesTableProps {
  cases: SearchResponse<CaseListItem>;
  initialPage?: number;
  userRole?: UserRole;
}

export default function CasesTable({
  cases,
  initialPage,
  userRole,
}: CasesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isAdmin = userRole !== undefined && adminRoles.includes(userRole);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);

  function handleApplyFilters(filters: CaseFilters) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('status');
    params.delete('contractor_id');
    params.delete('category');
    params.delete('advance_requested');
    filters.status?.forEach((value) => params.append('status', value));
    filters.contractorId?.forEach((value) =>
      params.append('contractor_id', value)
    );
    filters.category?.forEach((value) => params.append('category', value));
    if (filters.advanceRequested) params.set('advance_requested', 'true');
    params.set('page', '1');

    setStoredCaseFilters({
      ...getStoredCaseFilters(),
      status: filters.status,
      contractorId: filters.contractorId,
      category: filters.category,
      advanceRequested: filters.advanceRequested,
    });
    router.push(pathname + '?' + params.toString());
    setIsFilterModalOpen(false);
  }

  const columns: TableColumn<CaseListItem>[] = [
    {
      key: 'external_reference',
      header: 'Sinistro',
      skeletonWidth: 'w-20',
      render: (crmCase) => (
        <Link
          className="text-blue-500 hover:text-blue-700"
          href={`/cases/${crmCase.case_id}`}
        >
          {crmCase.external_reference}
        </Link>
      ),
    },
    {
      key: 'customer',
      header: 'Cliente',
      skeletonWidth: 'w-32',
      render: (crmCase) =>
        `${crmCase.customer_first_name || '-'} ${crmCase.customer_last_name || ''}`,
    },
    {
      key: 'city',
      header: 'Cidade',
      skeletonWidth: 'w-24',
      render: (crmCase) => crmCase.customer_city || '-',
    },
    {
      key: 'contractor',
      header: 'Seguradora',
      skeletonWidth: 'w-28',
      render: (crmCase) => crmCase.contractor_company_name || '-',
    },
    {
      key: 'category',
      header: 'Categoria',
      skeletonWidth: 'w-16',
      render: (crmCase) =>
        crmCase.category
          ? caseCategoryMap[crmCase.category as CaseCategory] ||
            crmCase.category
          : '-',
    },
    {
      key: 'partner',
      header: 'Técnico',
      skeletonWidth: 'w-20',
      render: (crmCase) =>
        crmCase.partner_first_name ? (
          crmCase.partner_id ? (
            <Link
              className="text-blue-500 hover:text-blue-700"
              href={`/partners/${crmCase.partner_id}`}
            >
              {crmCase.partner_first_name}
            </Link>
          ) : (
            crmCase.partner_first_name
          )
        ) : (
          '-'
        ),
    },
    {
      key: 'status',
      header: 'Status',
      skeletonWidth: 'w-20',
      render: (crmCase) => caseStatusMap[crmCase.status],
    },
    {
      key: 'due_date',
      header: 'Vencimento',
      skeletonWidth: 'w-20',
      render: (crmCase) => parseDateTime(crmCase.due_date, 'dd/MM/yyyy'),
    },
  ];

  return (
    <>
      <ListPageLayout
        title="Casos"
        searchBar={
          <CasesSearchBar
            setIsCreationModalOpen={setIsCreateModalOpen}
            setIsFilterModalOpen={setIsFilterModalOpen}
            setIsCreationBatchModalOpen={setIsCreateBatchModalOpen}
          />
        }
        pagination={<Pagination paging={cases?.paging} page={initialPage} />}
        isEmpty={cases.result.length === 0}
        emptyMessage="Nenhum caso encontrado."
        onRefresh={() => router.refresh()}
      >
        <ListItemCardGroup>
          {cases.result.map((crmCase) => (
            <ListItemCard
              key={crmCase.case_id}
              title={
                <Link
                  className="text-blue-500 hover:text-blue-700"
                  href={`/cases/${crmCase.case_id}`}
                >
                  {crmCase.external_reference}
                </Link>
              }
              fields={[
                {
                  label: 'Cliente',
                  value: `${crmCase.customer_first_name || '-'} ${crmCase.customer_last_name || ''}`,
                },
                { label: 'Cidade', value: crmCase.customer_city || '-' },
                {
                  label: 'Seguradora',
                  value: crmCase.contractor_company_name || '-',
                },
                {
                  label: 'Categoria',
                  value: crmCase.category
                    ? caseCategoryMap[crmCase.category as CaseCategory] ||
                      crmCase.category
                    : '-',
                },
                {
                  label: 'Técnico',
                  value: crmCase.partner_first_name ? (
                    crmCase.partner_id ? (
                      <Link
                        className="text-blue-500 hover:text-blue-700"
                        href={`/partners/${crmCase.partner_id}`}
                      >
                        {crmCase.partner_first_name}
                      </Link>
                    ) : (
                      crmCase.partner_first_name
                    )
                  ) : (
                    '-'
                  ),
                },
                { label: 'Status', value: caseStatusMap[crmCase.status] },
                {
                  label: 'Vencimento',
                  value: parseDateTime(crmCase.due_date, 'dd/MM/yyyy'),
                },
              ]}
            />
          ))}
        </ListItemCardGroup>

        <Table
          columns={columns}
          data={cases.result}
          rowKey={(crmCase) => crmCase.case_id}
        />
      </ListPageLayout>

      {isFilterModalOpen && (
        <FilterModal
          isModalOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={handleApplyFilters}
          initialStatus={
            searchParams.has('status')
              ? searchParams.getAll('status')
              : getDefaultCaseStatuses(isAdmin)
          }
          initialContractorId={searchParams.getAll('contractor_id')}
          initialCategory={
            searchParams.has('category')
              ? searchParams.getAll('category')
              : Object.values(CaseCategory)
          }
          initialAdvanceRequested={
            searchParams.get('advance_requested') === 'true'
          }
          userRole={userRole}
        />
      )}

      {isCreateModalOpen && (
        <CreateCaseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {isCreateBatchModalOpen && (
        <CreateCaseBatchModal
          isOpen={isCreateBatchModalOpen}
          onClose={() => setIsCreateBatchModalOpen(false)}
        />
      )}
    </>
  );
}
