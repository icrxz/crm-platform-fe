import { Metadata } from 'next';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import ContractorsTable from '../../components/contractors/table';
import { fetchContractors } from '../../services/contractors';

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
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const query = searchParams?.query || '';

  const contractors = await fetchContractors(query);

  return (
    <main>
      <Suspense fallback={<p>Carregando seguradoras...</p>}>
        <ContractorsTable contractors={contractors.data || []} />
      </Suspense>
    </main>
  );
}
