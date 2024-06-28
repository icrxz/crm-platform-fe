"use client";
import { CheckIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { TransactionItem, TransactionStatus } from '../../types/transaction';
import { lusitana } from '../../ui/fonts';

interface PaymentTableProps {
  transactions: TransactionItem[];
}

export default function PaymentTable({
  transactions,
}: PaymentTableProps) {
  const router = useRouter();

  function handleRowClick(paymentID: string) {
    router.push(`/payments/${paymentID}`);
  }

  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
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
                    <th scope="col" className="px-3 py-5 font-medium">
                      Valor
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Data de criação
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {transactions.map((transaction) => (
                    <tr key={transaction.case_id} className="group">
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{transaction.case_id}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {transaction.value}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {transaction.status}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {transaction.created_at}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        <div className='flex gap-2'>
                          <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => handleRowClick(transaction.case_id)}>
                            <EyeIcon className="h-5 w-5" />
                          </button>

                          {transaction.status == TransactionStatus.PENDING &&
                            <button
                              className="text-green-500 hover:text-green-700"
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

      {/* {isDeleteModalOpen && <DeletePartnerModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} partnerID={partnerID} />} */}
    </div>
  );
}
