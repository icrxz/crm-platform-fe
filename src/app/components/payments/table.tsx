'use client';
import { parseDateTime } from '@/app/libs/date';
import { parseDocument, parseToCurrency } from '@/app/libs/parser';
import { SearchResponse } from '@/app/types/search_response';
import { CheckIcon, PencilIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TransactionItem, TransactionStatus } from '../../types/transaction';
import { IconButton } from '../common/icon-button';
import { ListItemCard, ListItemCardGroup } from '../common/list-item-card';
import { ListPageLayout } from '../common/list-page-layout';
import { Pagination } from '../common/pagination';
import { Table, TableColumn } from '../common/table';
import { ConfirmPaymentModal } from './confirm-payment';
import { EditPaymentModal } from './edit-payment';
import { Partner } from '@/app/types/partner';
import PaymentsSearchBar from './search-bar';

interface PaymentTableProps {
  transactions: SearchResponse<TransactionItem>;
  initialPage?: number;
  partners?: Partner[];
}

const transactionStatusTranslate: Record<string, string> = {
  [TransactionStatus.PENDING]: 'Pendente',
};

export default function PaymentTable({
  transactions,
  initialPage,
  partners,
}: PaymentTableProps) {
  const router = useRouter();
  const [isConfirmPaymentModal, setIsConfirmPaymentModal] = useState(false);
  const [isEditPaymentModal, setIsEditPaymentModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionItem>();

  function handleConfirmPayment(transaction: TransactionItem) {
    setSelectedTransaction(transaction);
    setIsConfirmPaymentModal(true);
  }

  function handleEditPayment(transaction: TransactionItem) {
    setSelectedTransaction(transaction);
    setIsEditPaymentModal(true);
  }

  const columns: TableColumn<TransactionItem>[] = [
    {
      key: 'external_reference',
      header: 'Sinistro',
      skeletonWidth: 'w-20',
      render: (transaction) => (
        <Link
          className="text-blue-500 hover:text-blue-700"
          href={`/cases/${transaction.case_id}`}
        >
          {transaction.external_reference}
        </Link>
      ),
    },
    {
      key: 'customer',
      header: 'Segurado',
      skeletonWidth: 'w-28',
      render: (transaction) =>
        transaction.customer_first_name
          ? `${transaction.customer_first_name} ${transaction.customer_last_name || ''}`.trim()
          : '-',
    },
    {
      key: 'partner',
      header: 'Técnico',
      skeletonWidth: 'w-24',
      render: (transaction) =>
        transaction.partner_id ? (
          <Link
            className="text-blue-500 hover:text-blue-700"
            href={`/partners/${transaction.partner_id}`}
          >
            {transaction.partner_name}
          </Link>
        ) : (
          transaction.partner_name
        ),
    },
    {
      key: 'pix',
      header: 'PIX',
      className: 'whitespace-pre-wrap',
      skeletonWidth: 'w-24',
      render: (transaction) => transaction.partner_account,
    },
    {
      key: 'mo',
      header: 'MO',
      skeletonWidth: 'w-12',
      render: (transaction) => parseToCurrency(transaction.mo.value),
    },
    {
      key: 'transport',
      header: 'Deslocamento',
      skeletonWidth: 'w-16',
      render: (transaction) => parseToCurrency(transaction.transport.value),
    },
    {
      key: 'parts',
      header: 'Peças',
      skeletonWidth: 'w-12',
      render: (transaction) => parseToCurrency(transaction.parts.value),
    },
    {
      key: 'total',
      header: 'Total',
      skeletonWidth: 'w-16',
      render: (transaction) => parseToCurrency(transaction.total),
    },
    {
      key: 'status',
      header: 'Status',
      skeletonWidth: 'w-16',
      render: (transaction) => transactionStatusTranslate[transaction.status],
    },
    {
      key: 'created_at',
      header: 'Data de criação',
      skeletonWidth: 'w-20',
      render: (transaction) => parseDateTime(transaction.created_at),
    },
    {
      key: 'actions',
      header: 'Ações',
      skeletonWidth: 'w-16',
      render: (transaction) => (
        <div className="flex gap-2">
          {transaction.status == TransactionStatus.PENDING && (
            <>
              <IconButton
                size="sm"
                color="success"
                icon={<CheckIcon className="h-5 w-5" />}
                onClick={() => handleConfirmPayment(transaction)}
              />

              <IconButton
                size="sm"
                color="info"
                icon={<PencilIcon className="h-5 w-5" />}
                onClick={() => handleEditPayment(transaction)}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <ListPageLayout
        title="Pagamentos"
        searchBar={<PaymentsSearchBar partners={partners} />}
        pagination={
          <Pagination paging={transactions?.paging} page={initialPage} />
        }
        isEmpty={!transactions?.result.length}
        emptyMessage="Nenhum pagamento encontrado."
        onRefresh={() => router.refresh()}
      >
        {/* density="compact" below: 11 columns don't fit at 1280px even with
            reduced padding (px-2 vs. px-4 on every other table) — accepted
            tradeoff, the table keeps horizontal scroll (from
            ListPageLayout's overflow-x-auto) to reach the last columns. */}
        <ListItemCardGroup>
          {transactions?.result.map((transaction) => (
            <ListItemCard
              key={transaction.case_id}
              title={
                <Link
                  className="text-blue-500 hover:text-blue-700"
                  href={`/cases/${transaction.case_id}`}
                >
                  {transaction.external_reference}
                </Link>
              }
              fields={[
                {
                  label: 'Segurado',
                  value: transaction.customer_first_name
                    ? `${transaction.customer_first_name} ${transaction.customer_last_name || ''}`.trim()
                    : '-',
                },
                {
                  label: 'Técnico',
                  value: transaction.partner_id ? (
                    <Link
                      className="text-blue-500 hover:text-blue-700"
                      href={`/partners/${transaction.partner_id}`}
                    >
                      {transaction.partner_name}
                    </Link>
                  ) : (
                    transaction.partner_name
                  ),
                },
                { label: 'PIX', value: transaction.partner_account },
                { label: 'MO', value: parseToCurrency(transaction.mo.value) },
                {
                  label: 'Deslocamento',
                  value: parseToCurrency(transaction.transport.value),
                },
                {
                  label: 'Peças',
                  value: parseToCurrency(transaction.parts.value),
                },
                { label: 'Total', value: parseToCurrency(transaction.total) },
                {
                  label: 'Status',
                  value: transactionStatusTranslate[transaction.status],
                },
                {
                  label: 'Data de criação',
                  value: parseDateTime(transaction.created_at),
                },
              ]}
              actions={
                transaction.status == TransactionStatus.PENDING && (
                  <>
                    <IconButton
                      color="success"
                      icon={<CheckIcon className="h-5 w-5" />}
                      onClick={() => handleConfirmPayment(transaction)}
                    />
                    <IconButton
                      color="info"
                      icon={<PencilIcon className="h-5 w-5" />}
                      onClick={() => handleEditPayment(transaction)}
                    />
                  </>
                )
              }
            />
          ))}
        </ListItemCardGroup>

        <Table
          columns={columns}
          data={transactions?.result}
          rowKey={(transaction) => transaction.case_id}
          density="compact"
        />
      </ListPageLayout>

      {isConfirmPaymentModal && (
        <ConfirmPaymentModal
          isOpen={isConfirmPaymentModal}
          onClose={() => setIsConfirmPaymentModal(false)}
          caseId={selectedTransaction?.case_id || ''}
        />
      )}

      {isEditPaymentModal && (
        <EditPaymentModal
          isOpen={isEditPaymentModal}
          onClose={() => setIsEditPaymentModal(false)}
          transaction={selectedTransaction}
        />
      )}
    </>
  );
}
