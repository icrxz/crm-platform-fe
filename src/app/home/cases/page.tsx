import { Metadata } from 'next';

import { fetchCases } from '../../services/cases';
import CasesTable from '../../components/cases/table';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

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
      <CasesTable cases={cases} />
    </main>
  );
}
