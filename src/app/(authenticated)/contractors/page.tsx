import { Metadata } from 'next';

import ContractorsTable from '@/app/_components/contractors/table';
import { fetchContractors } from '@/app/_services/contractors';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Seguradoras',
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
    redirect("/login");
  }

  const query = searchParams?.query || '';

  const contractors = await fetchContractors(query);

  return (
    <main>
      <Suspense fallback={<p>Carregando seguradoras</p>}>
        <ContractorsTable contractors={contractors} />
      </Suspense>
    </main>
  );
}
