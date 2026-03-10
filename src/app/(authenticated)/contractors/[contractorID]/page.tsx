'use server';
import ContractorDetails from '@/app/components/contractors/details';
import { getContractorByID } from '@/app/services/contractors';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default async function Page({
  params,
}: {
  params: Promise<{ contractorID: string }>;
}) {
  const { contractorID } = await params;
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  const contractor = await getContractorByID(contractorID);

  return (
    <main>
      <Suspense fallback={<p>Carregando seguradora...</p>}>
        {contractor?.data && <ContractorDetails contractor={contractor.data} />}
      </Suspense>
    </main>
  );
}
