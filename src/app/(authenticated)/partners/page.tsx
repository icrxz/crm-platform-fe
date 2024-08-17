import { Metadata } from 'next';

import PartnersTable from '@/app/components/partners/table';
import { getCurrentUser } from '@/app/libs/session';
import { fetchPartners } from '@/app/services/partners';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Técnicos',
};

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: number;
  };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const partners = await fetchPartners(searchParams?.query || '', searchParams?.page || 1);

  return (
    <main>
      <Suspense fallback={<p>Carregando técnicos...</p>}>
        <PartnersTable partners={partners.data} initialPage={searchParams?.page} />
      </Suspense>
    </main>
  );
}
