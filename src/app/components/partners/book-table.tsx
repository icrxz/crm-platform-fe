import Link from 'next/link';
import { parseDateTime, ONLY_DATE_PATTERN } from '@/app/libs/date';
import { parseToCurrency } from '@/app/libs/parser';
import { PartnerBookCaseItem } from '@/app/types/partner-book-item';
import { SearchResponse } from '@/app/types/search_response';
import { ListItemCard, ListItemCardGroup } from '../common/list-item-card';
import { Table, TableColumn } from '../common/table';

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

  const columns: TableColumn<PartnerBookCaseItem>[] = [
    {
      key: 'created_at',
      header: 'Data',
      skeletonWidth: 'w-20',
      render: (crmCase) => parseDateTime(crmCase.created_at),
    },
    {
      key: 'city',
      header: 'Cidade',
      skeletonWidth: 'w-20',
      render: (crmCase) => crmCase.customer_city || '-',
    },
    {
      key: 'customer',
      header: 'Segurado',
      skeletonWidth: 'w-28',
      render: (crmCase) => {
        const isDuplicate = duplicateDocuments.has(
          crmCase.customer_document || ''
        );
        return (
          <span className={isDuplicate ? 'text-red-500' : ''}>
            {crmCase.customer_first_name
              ? `${crmCase.customer_first_name} ${crmCase.customer_last_name}`
              : '-'}
          </span>
        );
      },
    },
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
      key: 'type',
      header: 'Serviço',
      skeletonWidth: 'w-12',
      render: (crmCase) => serviceTypeMap[crmCase.type] || '-',
    },
    {
      key: 'payment_total',
      header: 'Valor a pagar',
      skeletonWidth: 'w-16',
      render: (crmCase) => parseToCurrency(crmCase.payment_total),
    },
    {
      key: 'payment_status',
      header: 'Status',
      skeletonWidth: 'w-16',
      render: (crmCase) => (
        <span
          className={`font-medium ${paymentStatusClassMap[crmCase.payment_status]}`}
        >
          {paymentStatusMap[crmCase.payment_status]}
        </span>
      ),
    },
    {
      key: 'paid_at',
      header: 'Data de pagamento',
      skeletonWidth: 'w-20',
      render: (crmCase) =>
        crmCase.paid_at
          ? parseDateTime(crmCase.paid_at, ONLY_DATE_PATTERN)
          : '-',
    },
  ];

  return (
    <div className="mt-6 rounded-md bg-gray-50 p-2">
      <ListItemCardGroup>
        {(cases?.result || []).map((crmCase) => {
          const isDuplicate = duplicateDocuments.has(
            crmCase.customer_document || ''
          );

          return (
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
                { label: 'Data', value: parseDateTime(crmCase.created_at) },
                { label: 'Cidade', value: crmCase.customer_city || '-' },
                {
                  label: 'Segurado',
                  value: (
                    <span className={isDuplicate ? 'text-red-500' : ''}>
                      {crmCase.customer_first_name
                        ? `${crmCase.customer_first_name} ${crmCase.customer_last_name}`
                        : '-'}
                    </span>
                  ),
                },
                {
                  label: 'Serviço',
                  value: serviceTypeMap[crmCase.type] || '-',
                },
                {
                  label: 'Valor a pagar',
                  value: parseToCurrency(crmCase.payment_total),
                },
                {
                  label: 'Status',
                  value: (
                    <span
                      className={`font-medium ${paymentStatusClassMap[crmCase.payment_status]}`}
                    >
                      {paymentStatusMap[crmCase.payment_status]}
                    </span>
                  ),
                },
                {
                  label: 'Data de pagamento',
                  value: crmCase.paid_at
                    ? parseDateTime(crmCase.paid_at, ONLY_DATE_PATTERN)
                    : '-',
                },
              ]}
            />
          );
        })}
      </ListItemCardGroup>

      <Table
        columns={columns}
        data={cases?.result}
        rowKey={(crmCase) => crmCase.case_id}
      />
    </div>
  );
}
