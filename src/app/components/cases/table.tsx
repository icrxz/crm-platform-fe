'use client';
import { CaseListItem } from '@/app/types/case-list-item';
import { SearchResponse } from '@/app/types/search_response';
import { Pagination } from '@heroui/pagination';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import {
  CaseFilters,
  getStoredCaseFilters,
  setStoredCaseFilters,
} from '../../libs/case-filters-storage';
import { parseDateTime } from '../../libs/date';
import { caseStatusMap } from '../../types/case';
import { defaultCaseStatuses } from '../../utils/case_status';
import { roboto } from '../../ui/fonts';
import { CreateCaseBatchModal } from './batch-form-modal';
import CreateCaseModal from './create-case';
import { FilterModal } from './filter-modal';
import CasesSearchBar from './search-bar';

interface CasesTableProps {
  cases: SearchResponse<CaseListItem>;
  initialPage?: number;
}

export default function CasesTable({ cases, initialPage }: CasesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);

  function handleChangePage(value: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', value.toString());

    router.push(pathname + '?' + params.toString());
  }

  function handleApplyFilters(filters: CaseFilters) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('status');
    params.delete('contractor_id');
    filters.status?.forEach((value) => params.append('status', value));
    filters.contractorId?.forEach((value) =>
      params.append('contractor_id', value)
    );
    params.set('page', '1');

    setStoredCaseFilters({
      ...getStoredCaseFilters(),
      status: filters.status,
      contractorId: filters.contractorId,
    });
    router.push(pathname + '?' + params.toString());
    setIsFilterModalOpen(false);
  }

  return (
    <div className="w-full">
      <h1 className={`${roboto.className} mb-8 text-xl md:text-2xl`}>Casos</h1>

      <CasesSearchBar
        setIsCreationModalOpen={setIsCreateModalOpen}
        setIsFilterModalOpen={setIsFilterModalOpen}
        setIsCreationBatchModalOpen={setIsCreateBatchModalOpen}
      />

      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              <table className="hidden min-w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Sinistro
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Cliente
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Cidade
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Seguradora
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Técnico
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Estado
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Vencimento
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {cases.result.map((crmCase) => (
                    <tr key={crmCase.case_id} className="group">
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-blue-500 underline group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <Link href={`/cases/${crmCase.case_id}`}>
                            {crmCase.external_reference}
                          </Link>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{`${crmCase.customer_first_name || '-'} ${crmCase.customer_last_name || ''}`}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {crmCase.customer_city || '-'}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {crmCase.contractor_company_name || '-'}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {crmCase.partner_first_name || '-'}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {caseStatusMap[crmCase.status]}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {parseDateTime(crmCase.due_date, 'dd/MM/yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <Pagination
          onChange={handleChangePage}
          siblings={3}
          showControls
          total={Math.ceil(
            Number((cases?.paging.total || 1) / (cases?.paging.limit || 1))
          )}
          page={Number(initialPage || 1)}
        />
      </div>

      {isFilterModalOpen && (
        <FilterModal
          isModalOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={handleApplyFilters}
          initialStatus={
            searchParams.has('status')
              ? searchParams.getAll('status')
              : defaultCaseStatuses
          }
          initialContractorId={searchParams.getAll('contractor_id')}
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
    </div>
  );
}
