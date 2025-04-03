`use server`;
import PaymentTable from '@/app/components/payments/table';
import { fetchCases } from '@/app/services/cases';
import { getPartnerByID } from '@/app/services/partners';
import { fetchTransactions } from '@/app/services/transactions';
import { Partner } from '@/app/types/partner';
import { SearchResponse } from '@/app/types/search_response';
import { TransactionItem, TransactionStatus, TransactionType } from '@/app/types/transaction';
import { getServerSession } from 'next-auth';
import { signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function getData(page: number): Promise<SearchResponse<TransactionItem>> {
  const query = "type=OUTGOING";

  const { success, unauthorized, data: transactions } = await fetchTransactions(query);
  if (!success || !transactions) {
    if (unauthorized) {
      redirect("/login");
    }
    return { result: [], paging: { limit: 10, offset: page * 10, total: 0 } };
  }

  const casesInReceipt = await fetchCases(`status=Receipt`, page).then((resp) => {
    if (resp.unauthorized) {
      signOut();
    }
    return resp.data || { result: [], paging: { limit: 10, offset: page * 10, total: 0 } };
  });


  const outgoingCasesTransactions = await Promise.all(casesInReceipt.result.map(async (caseItem): Promise<TransactionItem> => {
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
      total: transactionVal,
      partner_document: (partner as Partner)?.document,
      partner_name: `${(partner as Partner).first_name} ${(partner as Partner).last_name}`,
      mo: {
        transaction_id: outgoingTransactions.filter((t) => t.description === "MO")[0]?.transaction_id || "",
        value: outgoingTransactions.filter((t) => t.description === "MO")[0]?.value || 0,
      },
      transport: {
        transaction_id: outgoingTransactions.filter((t) => t.description === "Deslocamento Técnico")[0]?.transaction_id || "",
        value: outgoingTransactions.filter((t) => t.description === "Deslocamento Técnico")[0]?.value || 0,
      },
      parts: {
        transaction_id: outgoingTransactions.filter((t) => t.description === "Peças técnico")[0]?.transaction_id || "",
        value: outgoingTransactions.filter((t) => t.description === "Peças técnico")[0]?.value || 0,
      },
    } as TransactionItem;
  }));

  return {
    result: outgoingCasesTransactions,
    paging: casesInReceipt.paging,
  };
}

type TransactionPageParams = {
  searchParams?: {
    query?: string;
    page?: number;
  };
};

export default async function Page({ searchParams }: TransactionPageParams) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const payments = await getData(searchParams?.page || 1);

  return (
    <main>
      <Suspense fallback={<p>Carregando pagamentos...</p>}>
        <PaymentTable transactions={payments || []} />
      </Suspense>
    </main>
  );
}
