"use client";
import { parseDateTime } from '@/app/libs/date';
import { parseDocument, parseToCurrency } from '@/app/libs/parser';
import { SearchResponse } from '@/app/types/search_response';
import { CheckIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Pagination } from '@nextui-org/pagination';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TransactionItem, TransactionStatus } from '../../types/transaction';
import { roboto } from '../../ui/fonts';
import { ConfirmPaymentModal } from './confirm-payment';
import { EditPaymentModal } from './edit-payment';

interface PaymentTableProps {
  transactions: SearchResponse<TransactionItem>;
  initialPage?: number;
}

const transactionStatusTranslate: Record<string, string> = {
  [TransactionStatus.PENDING]: "Pendente",
};

export default function PaymentTable({
  transactions,
  initialPage,
}: PaymentTableProps) {
  const router = useRouter();
  const [isConfirmPaymentModal, setIsConfirmPaymentModal] = useState(false);
  const [isEditPaymentModal, setIsEditPaymentModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem>();

  function handleRowClick(paymentID: string) {
    router.push(`/payments/${paymentID}`);
  }

  function handleChangePage(value: number) {
    router.push(`?page=${value}`);
  }

  function handleConfirmPayment(transaction: TransactionItem) {
    setSelectedTransaction(transaction);
    setIsConfirmPaymentModal(true);
  }

  function handleEditPayment(transaction: TransactionItem) {
    setSelectedTransaction(transaction);
    setIsEditPaymentModal(true);
  }

  return (
    <div className="w-full">
      <h1 className={`${roboto.className} mb-8 text-xl md:text-2xl`}>
        Pagamentos
      </h1>

      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">

              <table className="hidden min-w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Caso
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Técnico
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      PIX
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      MO
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Deslocamento
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Peças
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Total
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Data de criação
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {transactions?.result.map((transaction) => (
                    <tr key={transaction.case_id} className="group">
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{transaction.external_reference}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{transaction.partner_name}</p>
                        </div>
                      </td>
                      <td className="whitespace-pre-wrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{transaction.partner_account}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {parseToCurrency(transaction.mo.value)}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {parseToCurrency(transaction.transport.value)}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {parseToCurrency(transaction.parts.value)}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {parseToCurrency(transaction.total)}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {transactionStatusTranslate[transaction.status]}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {parseDateTime(transaction.created_at)}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        <div className='flex gap-2'>
                          {transaction.status == TransactionStatus.PENDING &&
                            <>
                              <button
                                className="text-green-500 hover:text-green-700"
                                onClick={() => handleConfirmPayment(transaction)}
                              >
                                <CheckIcon className='w-5 md:w-6' />
                              </button>

                              <button
                                className="text-blue-600 hover:text-blue-900"
                                onClick={() => handleEditPayment(transaction)}
                              >
                                <PencilIcon className='w-5 md:w-6' />
                              </button>
                            </>
                          }
                        </div>
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
          total={Math.ceil(Number((transactions?.paging.total || 1) / (transactions?.paging.limit || 1)))}
          page={Number(initialPage || 1)}
        />
      </div>

      {isConfirmPaymentModal && <ConfirmPaymentModal
        isOpen={isConfirmPaymentModal}
        onClose={() => setIsConfirmPaymentModal(false)}
        caseId={selectedTransaction?.case_id || ''}
      />}

      {isEditPaymentModal && <EditPaymentModal
        isOpen={isEditPaymentModal}
        onClose={() => setIsEditPaymentModal(false)} transaction={selectedTransaction} />}
    </div>
  );
}
