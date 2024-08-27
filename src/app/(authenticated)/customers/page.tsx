import { Metadata } from 'next';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import CustomersTable from '../../components/customers/table';
import { fetchCustomers } from '../../services/customers';

export const metadata: Metadata = {
  title: 'Clientes',
};

type CustomerPageParams = {
  searchParams?: {
    query?: string;
    page?: number;
  };
};

export default async function Page({ searchParams }: CustomerPageParams) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const query = searchParams?.query || '';
  const { data: customers } = await fetchCustomers(query, (searchParams?.page || 1));

  return (
    <main>
      <Suspense fallback={<p>Carregando clientes...</p>}>
        <CustomersTable customers={customers} initialPage={searchParams?.page} />
      </Suspense>
    </main>
  );
}
