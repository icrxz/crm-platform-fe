import { Metadata } from 'next';

import { fetchCases } from '../../services/cases';
import CasesTable from '../../components/cases/table';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Casos',
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

  const cases = await fetchCases(query);

  return (
    <main>
      <Suspense fallback={<p>carregando casos...</p>} >
        <CasesTable cases={cases} />
      </Suspense>
    </main>
  );
}
