import { Metadata } from 'next';

import { removeDocumentSymbols } from '@/app/libs/parser';
import { getCurrentUser } from '@/app/libs/session';
import { Customer } from '@/app/types/customer';
import { SearchResponse } from '@/app/types/search_response';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import CustomersTable from '../../components/customers/table';
import { fetchCustomers } from '../../services/customers';

export const metadata: Metadata = {
  title: 'Clientes',
};

type CustomerPageParams = {
  searchParams?: {
    documento?: string;
    page?: number;
  };
};

async function getData(document: string, page: number): Promise<SearchResponse<Customer>> {
  let query = '';
  if (document) {
    const parsedDocument = removeDocumentSymbols(document)
    query = `document=${parsedDocument}`
  }

  const { success, unauthorized, data } = await fetchCustomers(query, page);
  if (!success || !data) {
    if (unauthorized) {
      redirect("/login");
    }
    return { result: [], paging: { limit: 10, offset: page * 10, total: 0 } };
  }

  const customers = data.result;

  return {
    result: customers,
    paging: data.paging,
  };
}

export default async function Page({ searchParams }: CustomerPageParams) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const data = await getData(searchParams?.documento || '', searchParams?.page || 1);

  return (
    <main>
      <Suspense fallback={<p>Carregando clientes...</p>}>
        <CustomersTable customers={data} initialPage={searchParams?.page} />
      </Suspense>
    </main>
  );
}
