import PaymentTable from '@/app/components/payments/table';
import { fetchTransactions } from '@/app/services/transactions';
import { TransactionItem } from '@/app/types/transaction';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Pagamentos',
};

async function getData(): Promise<TransactionItem[]> {
  const query = "type=OUTGOING";

  const { success, unauthorized, data: transactions } = await fetchTransactions(query);
  if (!success || !transactions) {
    if (unauthorized) {
      redirect("/login");
    }
    return [];
  }

  const groupedTransactions = transactions.reduce((transactionByCase: Record<string, TransactionItem>, transaction) => {
    transactionByCase[transaction.case_id] = {
      value: transactionByCase[transaction.case_id].value + transaction.value,
      case_id: transaction.case_id,
      created_at: transaction.created_at,
      status: transaction.status,
    };

    return transactionByCase;
  }, {});

  return Object.entries(groupedTransactions).map(([_, value]) => (value));
}


export default async function Page() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const payments = await getData();

  return (
    <main>
      <Suspense fallback={<p>Carregando pagamentos...</p>}>
        <PaymentTable transactions={payments || []} />
      </Suspense>
    </main>
  );
}
