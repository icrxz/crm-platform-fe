import { Metadata } from 'next';

import { fetchCases } from '@/app/_services/cases';
import CasesTable from '@/app/_components/cases/table';

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
  const query = searchParams?.query || '';

  const cases = await fetchCases(query);

  return (
    <main>
      <CasesTable cases={cases} />
    </main>
  );
}
