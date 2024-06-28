import { Suspense } from 'react';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import CardWrapper from '../../components/dashboard/cards';
import { CardsSkeleton } from '../../components/dashboard/skeletons';
import { lusitana } from '../../ui/fonts';

export default async function Page() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
    </main>
  );
}
