"use client";
import { parseDateTime } from '@/app/libs/date';
import { parseDocument, parseToCurrency } from '@/app/libs/parser';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TransactionItem, TransactionStatus } from '../../types/transaction';
import { roboto } from '../../ui/fonts';
import { ConfirmPaymentModal } from './confirm-payment';

interface PaymentTableProps {
  transactions: TransactionItem[];
}

const transactionStatusTranslate: Record<string, string> = {
  [TransactionStatus.PENDING]: "Pendente",
};

export default function PaymentTable({
  transactions,
}: PaymentTableProps) {
  const router = useRouter();
  const [isConfirmPaymentModal, setIsConfirmPaymentModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);

  function handleRowClick(paymentID: string) {
    router.push(`/payments/${paymentID}`);
  }

  function handleConfirmPayment(transaction: TransactionItem) {
    setSelectedTransaction(transaction);
    setIsConfirmPaymentModal(true);
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
                      Documento
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Valor
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
                  {transactions.map((transaction) => (
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
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{transaction.partner_document && parseDocument(transaction.partner_document)}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {parseToCurrency(transaction.value)}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {transactionStatusTranslate[transaction.status]}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {parseDateTime(transaction.created_at)}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        <div className='flex gap-2'>
                          {/* <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => handleRowClick(transaction.case_id)}>
                            <EyeIcon className="h-5 w-5" />
                          </button> */}

                          {transaction.status == TransactionStatus.PENDING &&
                            <button
                              className="text-green-500 hover:text-green-700"
                              onClick={() => handleConfirmPayment(transaction)}
                            >
                              <CheckIcon className='w-5 md:w-6' />
                            </button>
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

      {isConfirmPaymentModal && <ConfirmPaymentModal
        isOpen={isConfirmPaymentModal}
        onClose={() => setIsConfirmPaymentModal(false)}
        caseId={selectedTransaction?.case_id || ''}
      />}
    </div>
  );
}
