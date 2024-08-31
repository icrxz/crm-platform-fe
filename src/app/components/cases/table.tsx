"use client";
import { SearchResponse } from '@/app/types/search_response';
import { Pagination } from '@nextui-org/pagination';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { parseDateTime } from '../../libs/date';
import { CaseFull, caseStatusMap } from '../../types/case';
import { roboto } from '../../ui/fonts';
import Modal from '../common/modal';
import CreateCaseModal from './create-case';
import CasesSearchBar from './search-bar';
import { CreateCaseBatchModal } from './batch-form-modal';

interface CasesTableProps {
  cases: SearchResponse<CaseFull>;
  initialPage?: number;
}

export default function CasesTable({ cases, initialPage }: CasesTableProps) {
  const router = useRouter();

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);

  function handleChangePage(value: number) {
    router.push(`?page=${value}`);
  }

  return (
    <div className="w-full">
      <h1 className={`${roboto.className} mb-8 text-xl md:text-2xl`}>
        Casos
      </h1>

      <CasesSearchBar setIsCreationModalOpen={setIsCreateModalOpen} setIsFilterModalOpen={setIsFilterModalOpen} setIsCreationBatchModalOpen={setIsCreateBatchModalOpen} />

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
                      Status
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Vencimento
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {cases.result.map((crmCase) => (
                    <tr
                      key={crmCase.case_id}
                      className="group"
                    >
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <Link href={`/cases/${crmCase.case_id}`}>
                            {crmCase.external_reference}
                          </Link>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{`${crmCase.customer?.first_name} ${crmCase.customer?.last_name}`}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {crmCase.customer?.shipping.city || ''}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {crmCase.contractor?.company_name || ''}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {crmCase.partner?.first_name || ''}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {caseStatusMap[crmCase.status]}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {parseDateTime(crmCase.due_date, "dd/MM/yyyy")}
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
          total={Math.ceil(Number((cases?.paging.total || 1) / (cases?.paging.limit || 1)))}
          initialPage={Number(initialPage || 1)}
        />
      </div>

      {isFilterModalOpen && <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
        <div>
          Filtro
        </div>
      </Modal>}

      {isCreateModalOpen && <CreateCaseModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />}

      {isCreateBatchModalOpen && <CreateCaseBatchModal isOpen={isCreateBatchModalOpen} onClose={() => setIsCreateBatchModalOpen(false)} />}
    </div>
  );
}
