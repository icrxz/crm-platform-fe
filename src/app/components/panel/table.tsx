"use client";
import { SearchResponse } from '@/app/types/search_response';

import { parseDateTime } from '../../libs/date';
import { CaseFull } from '../../types/case';
import { parseToCurrency } from '@/app/libs/parser';
import { TransactionType } from '@/app/types/transaction';

interface ControlPanelTableProps {
  cases: SearchResponse<CaseFull>;
}

export default function ControlPanelTable({ cases }: ControlPanelTableProps) {
  return (
    <div className="w-full">
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">

              <table className="hidden min-w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="py-5 font-medium sm:pl-6">
                      Data
                    </th>
                    <th scope="col" className="py-5 font-medium sm:pl-6">
                      Cidade
                    </th>
                    <th scope="col" className="py-5 font-medium sm:pl-6">
                      Técnico
                    </th>
                    <th scope="col" className="py-5 font-medium sm:pl-6">
                      Senha
                    </th>
                    <th scope="col" className="py-5 font-medium sm:pl-6">
                      Seguradora
                    </th>
                    <th scope="col" className="py-5 font-medium sm:pl-6">
                      Mão de obra Técnico
                    </th>
                    <th scope="col" className="py-5 font-medium sm:pl-6">
                      Deslocamento Técnico
                    </th>
                    <th scope="col" className="py-5 font-medium sm:pl-6">
                      Peças Técnico
                    </th>
                    <th scope="col" className="py-5 font-medium sm:pl-6">
                      Mão de obra Seguradora
                    </th>
                    <th scope="col" className="py-5 font-medium sm:pl-6">
                      Deslocamento Seguradora
                    </th>
                    <th scope="col" className="py-5 font-medium sm:pl-6">
                      Peças Seguradora
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {cases?.result?.map((crmCase) => (
                    <tr
                      key={crmCase.case_id}
                      className="group"
                    >
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {parseDateTime(crmCase?.created_at || '')}
                      </td>
                      <td className="whitespace-nowrap bg-white pl-6 py-5 text-sm">
                        {crmCase.customer?.shipping.city || '-'}
                      </td>
                      <td className="whitespace-nowrap bg-white pl-6 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {crmCase.partner?.first_name || '-'}
                      </td>
                      <td className="whitespace-nowrap bg-white pl-6 py-5 text-sm">
                        {crmCase.external_reference || '-'}
                      </td>
                      <td className="whitespace-nowrap bg-white pl-6 py-5 text-sm">
                        {crmCase.contractor?.company_name || '-'}
                      </td>
                      <td className="whitespace-nowrap bg-white pl-6 py-5 text-sm">
                        {parseToCurrency(crmCase.transactions?.find((tr) => tr.type === TransactionType.OUTGOING && tr.description === 'MO')?.value || 0)}
                      </td>
                      <td className="whitespace-nowrap bg-white pl-6 py-5 text-sm">
                        {parseToCurrency(crmCase.transactions?.find((tr) => tr.type === TransactionType.OUTGOING && tr.description === 'Deslocamento Técnico')?.value || 0)}
                      </td>
                      <td className="whitespace-nowrap bg-white pl-6 py-5 text-sm">
                        {parseToCurrency(crmCase.transactions?.find((tr) => tr.type === TransactionType.OUTGOING && tr.description === 'Peças técnico')?.value || 0)}
                      </td>
                      <td className="whitespace-nowrap bg-white pl-6 py-5 text-sm">
                        {parseToCurrency(crmCase.transactions?.find((tr) => tr.type === TransactionType.INCOMING && tr.description === 'Cobrado seguradora')?.value || 0)}
                      </td>
                      <td className="whitespace-nowrap bg-white pl-6 py-5 text-sm">
                        {parseToCurrency(crmCase.transactions?.find((tr) => tr.type === TransactionType.INCOMING && tr.description === 'Deslocamento')?.value || 0)}
                      </td>
                      <td className="whitespace-nowrap bg-white pl-6 py-5 text-sm">
                        {parseToCurrency(crmCase.transactions?.find((tr) => tr.type === TransactionType.INCOMING && tr.description === 'Peças')?.value || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
