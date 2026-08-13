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
import { roboto } from '../../ui/fonts';
import { Pagination } from '../common/pagination';
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
                    <th scope="col" className="px-3 py-5 font-medium">
                      Categoria
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
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {crmCase.category
                          ? caseCategoryMap[crmCase.category as CaseCategory] ||
                            crmCase.category
                          : '-'}
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

      <Pagination paging={cases?.paging} page={initialPage} />

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
    </div>
  );
}
