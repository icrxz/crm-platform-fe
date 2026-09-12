import Link from 'next/link';
import { parseDateTime, ONLY_DATE_PATTERN } from '@/app/libs/date';
import { parseToCurrency } from '@/app/libs/parser';
import { PartnerBookCaseItem } from '@/app/types/partner-book-item';
import { SearchResponse } from '@/app/types/search_response';

interface PartnerBookTableProps {
  cases: SearchResponse<PartnerBookCaseItem>;
}

const serviceTypeMap: Record<string, string> = {
  repair: 'Rep',
  inspection: 'Vist',
};

const paymentStatusMap: Record<PartnerBookCaseItem['payment_status'], string> =
  {
    paid: 'Pago',
    pending: 'Pendente',
  };

const paymentStatusClassMap: Record<
  PartnerBookCaseItem['payment_status'],
  string
> = {
  paid: 'text-green-600',
  pending: 'text-gray-500',
};

export default function PartnerBookTable({ cases }: PartnerBookTableProps) {
  const documentCounts = (cases?.result || []).reduce<Record<string, number>>(
    (acc, c) => {
      const doc = c.customer_document;
      if (doc) acc[doc] = (acc[doc] || 0) + 1;
      return acc;
    },
    {}
  );

  const duplicateDocuments = new Set(
    Object.entries(documentCounts)
      .filter(([, count]) => count > 1)
      .map(([doc]) => doc)
  );

  return (
    <div className="mt-6 overflow-x-auto rounded-md bg-gray-50 p-2">
      <table className="hidden min-w-full table-auto rounded-md text-gray-900 md:table">
        <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
          <tr>
            <th scope="col" className="py-5 font-medium sm:pl-6">
              Data
            </th>
            <th scope="col" className="py-5 font-medium sm:pl-6">
              Cidade
            </th>
            <th scope="col" className="py-5 font-medium sm:pl-6">
              Segurado
            </th>
            <th scope="col" className="py-5 font-medium sm:pl-6">
              Sinistro
            </th>
            <th scope="col" className="py-5 font-medium sm:pl-6">
              Serviço
            </th>
            <th scope="col" className="py-5 font-medium sm:pl-6">
              Valor a pagar
            </th>
            <th scope="col" className="py-5 font-medium sm:pl-6">
              Status
            </th>
            <th scope="col" className="py-5 font-medium sm:pl-6">
              Data de pagamento
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 text-gray-900">
          {(cases?.result || []).map((crmCase) => {
            const isDuplicate = duplicateDocuments.has(
              crmCase.customer_document || ''
            );
            return (
              <tr key={crmCase.case_id} className="group">
                <td className="whitespace-nowrap bg-white px-4 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                  {parseDateTime(crmCase.created_at)}
                </td>
                <td className="whitespace-nowrap bg-white py-5 pl-6 text-sm">
                  {crmCase.customer_city || '-'}
                </td>
                <td
                  className={
                    'whitespace-nowrap bg-white py-5 pl-6 text-sm' +
                    (isDuplicate ? ' text-red-500' : '')
                  }
                >
                  {crmCase.customer_first_name
                    ? `${crmCase.customer_first_name} ${crmCase.customer_last_name}`
                    : '-'}
                </td>
                <td className="whitespace-nowrap bg-white py-5 pl-6 text-sm text-blue-500 underline">
                  <Link href={`/cases/${crmCase.case_id}`}>
                    {crmCase.external_reference}
                  </Link>
                </td>
                <td className="whitespace-nowrap bg-white py-5 pl-6 text-sm">
                  {serviceTypeMap[crmCase.type] || '-'}
                </td>
                <td className="whitespace-nowrap bg-white py-5 pl-6 text-sm">
                  {parseToCurrency(crmCase.payment_total)}
                </td>
                <td
                  className={
                    'whitespace-nowrap bg-white py-5 pl-6 text-sm font-medium ' +
                    paymentStatusClassMap[crmCase.payment_status]
                  }
                >
                  {paymentStatusMap[crmCase.payment_status]}
                </td>
                <td className="whitespace-nowrap bg-white py-5 pl-6 text-sm">
                  {crmCase.paid_at
                    ? parseDateTime(crmCase.paid_at, ONLY_DATE_PATTERN)
                    : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
