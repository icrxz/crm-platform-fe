import { Metadata } from 'next';

import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import PartnersTable from '@/app/components/partners/table';
import { fetchPartners } from '@/app/services/partners';

export const metadata: Metadata = {
  title: 'Técnicos',
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

  const partners = await fetchPartners(query);

  return (
    <main>
      <Suspense fallback={<p>Carregando técnicos...</p>}>
        <PartnersTable partners={partners}/>
      </Suspense>
    </main>
  );
}
