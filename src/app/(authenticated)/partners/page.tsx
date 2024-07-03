import { Metadata } from 'next';

import PartnersTable from '@/app/components/partners/table';
import { fetchPartners } from '@/app/services/partners';
import { User } from '@/app/types/user';
import { getServerSession } from 'next-auth';
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
    page?: string;
  };
}) {
  const session = await getServerSession();
  const user = session?.user as unknown as User;
  console.log('user', user);

  if (!session) {
    redirect("/login");
  }

  const query = searchParams?.query || '';

  const partners = await fetchPartners(query);

  return (
    <main>
      <Suspense fallback={<p>Carregando técnicos...</p>}>
        <PartnersTable partners={partners.data || []} />
      </Suspense>
    </main>
  );
}
