`use server`;
import { unauthorizedRedirect } from '@/app/libs/auth-redirect';
import { removeDocumentSymbols } from '@/app/libs/parser';
import { getCurrentUser } from '@/app/libs/session';
import { CustomerListItem } from '@/app/types/customer-list-item';
import { SearchResponse } from '@/app/types/search_response';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import CustomersTable from '../../components/customers/table';
import { fetchCustomers } from '../../services/customers';

type CustomerPageParams = {
  searchParams: Promise<{
    documento?: string;
    page?: number;
  }>;
};

async function getData(
  document: string,
  page: number
): Promise<SearchResponse<CustomerListItem>> {
  let query = '';
  if (document) {
    const parsedDocument = removeDocumentSymbols(document);
    query = `document=${parsedDocument}`;
  }

  const { success, unauthorized, data } = await fetchCustomers(query, page);
  if (!success || !data) {
    if (unauthorized) {
      await unauthorizedRedirect();
    }
    return { result: [], paging: { limit: 10, offset: page * 10, total: 0 } };
  }

  const listItems = data.result.map(
    (c): CustomerListItem => ({
      customer_id: c.customer_id,
      first_name: c.first_name,
      last_name: c.last_name,
      email: c.personal_contact?.email,
      document: c.document,
      created_at: c.created_at,
      active: c.active,
    })
  );

  return { result: listItems, paging: data.paging };
}

export default async function Page({ searchParams }: CustomerPageParams) {
  const { documento, page } = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const data = await getData(documento || '', page || 1);

  return (
    <main>
      <Suspense fallback={<p>Carregando clientes...</p>}>
        <CustomersTable customers={data} initialPage={page} />
      </Suspense>
    </main>
  );
}
