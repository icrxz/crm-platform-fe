"use server";
import { Metadata } from 'next';

import { fetchContractors } from '@/app/_services/contractors';
import ContractorsTable from '@/app/_components/contractors/table';

export const metadata: Metadata = {
  title: 'Contratantes',
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

  const contractors = await fetchContractors(query);

  return (
    <main>
      <ContractorsTable contractors={contractors} />
    </main>
  );
}
