import { Metadata } from 'next';

import { fetchCustomers } from '@/app/services/customers';
import CustomersTable from '@/app/components/customers/table';

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
  const query = searchParams?.query || '';

  const customers = await fetchCustomers(query);

  return (
    <main>
      <CustomersTable customers={customers} />
    </main>
  );
}
