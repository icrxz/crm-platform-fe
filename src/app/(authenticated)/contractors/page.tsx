import { Metadata } from 'next';

import { getCurrentUser } from '@/app/libs/session';
import { signOut } from 'next-auth/react';
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
  const session = await getCurrentUser();
  if (!session) {
    signOut();
  }

  const query = searchParams?.query || '';

  const contractors = await fetchContractors(query);

  return (
    <main>
      <Suspense fallback={<p>Carregando seguradoras...</p>}>
        <ContractorsTable contractors={contractors.data?.result || []} />
      </Suspense>
    </main>
  );
}
