import { Metadata } from 'next';

import { fetchCustomers } from '../../services/customers';
import CustomersTable from '../../components/customers/table';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

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
  const session = await getServerSession()

  if (!session) {
    // redirect("/login");
  }
  
  const query = searchParams?.query || '';

  const customers = await fetchCustomers(query);

  return (
    <main>
      <CustomersTable customers={customers} />
    </main>
  );
}
