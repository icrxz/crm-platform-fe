'use server';
import ContractorDetails from '@/app/components/contractors/details';
import { getContractorByID } from '@/app/services/contractors';
import { getCurrentUser } from '@/app/libs/session';
import { redirect } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ contractorID: string }>;
}) {
  const { contractorID } = await params;
  const session = await getCurrentUser();

  if (!session) {
    redirect('/login');
  }

  const contractor = await getContractorByID(contractorID);

  return (
    <main>
      {contractor?.data && <ContractorDetails contractor={contractor.data} />}
    </main>
  );
}
