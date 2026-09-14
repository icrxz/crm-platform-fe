'use server';
import CustomerDetails from '@/app/components/customers/details';
import { getCustomerByID } from '@/app/services/customers';
import { getCurrentUser } from '@/app/libs/session';
import { redirect } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ customerID: string }>;
}) {
  const { customerID } = await params;
  const session = await getCurrentUser();

  if (!session) {
    redirect('/login');
  }

  const customer = await getCustomerByID(customerID);

  return (
    <main>
      {customer?.data && <CustomerDetails customer={customer.data} />}
    </main>
  );
}
