import PaymentTable from '@/app/components/payments/table';
import { fetchCases } from '@/app/services/cases';
import { getPartnerByID } from '@/app/services/partners';
import { fetchTransactions } from '@/app/services/transactions';
import { Partner } from '@/app/types/partner';
import { TransactionItem, TransactionStatus, TransactionType } from '@/app/types/transaction';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { signOut } from 'next-auth/react';
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

  const casesInReceipt = await fetchCases(`status=Receipt`).then((resp) => {
    if (resp.unauthorized) {
      signOut();
    }
    return resp.data || [];
  });


  const outgoingCasesTransactions = await Promise.all(casesInReceipt.map(async (caseItem): Promise<TransactionItem> => {
    const partner = caseItem.partner_id && await getPartnerByID(caseItem.partner_id).then((resp) => {
      if (resp.unauthorized) {
        signOut();
      }
      return resp.data || null;
    });

    const transactions = await fetchTransactions(`case_id=${caseItem.case_id}`).then((resp) => {
      if (resp.unauthorized) {
        signOut();
      }
      return resp.data || [];
    });

    const outgoingTransactions = transactions.filter((transaction) => transaction.type === TransactionType.OUTGOING) || [];
    const transactionVal = outgoingTransactions.reduce((acc, transaction) => acc + transaction.value, 0);

    return {
      case_id: caseItem.case_id,
      external_reference: caseItem.external_reference,
      created_at: caseItem.updated_at,
      status: TransactionStatus.PENDING,
      value: transactionVal,
      partner_document: (partner as Partner).document,
      partner_name: `${(partner as Partner).first_name} ${(partner as Partner).last_name}`,
    } as TransactionItem;
  }));

  return outgoingCasesTransactions;
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
