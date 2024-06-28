import { Metadata } from 'next';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import CustomersTable from '../../components/customers/table';
import { fetchCustomers } from '../../services/customers';

export const metadata: Metadata = {
  title: 'Clientes',
};

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const query = searchParams?.query || '';

  const customers = await fetchCustomers(query);

  return (
    <main>
      <Suspense fallback={<p>Carregando clientes...</p>}>
        <CustomersTable customers={customers.data || []} />
      </Suspense>
    </main>
  );
}
