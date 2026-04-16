'use server';
import CustomerDetails from '@/app/components/customers/details';
import { getCustomerByID } from '@/app/services/customers';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default async function Page({
  params,
}: {
  params: Promise<{ customerID: string }>;
}) {
  const { customerID } = await params;
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  const customer = await getCustomerByID(customerID);

  return (
    <main>
      <Suspense fallback={<p>Carregando cliente...</p>}>
        {customer?.data && <CustomerDetails customer={customer.data} />}
      </Suspense>
    </main>
  );
}
