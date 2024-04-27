import CardWrapper from '@/src/app/components/dashboard/cards';
import { CardsSkeleton } from '@/src/app/components/dashboard/skeletons';
import { lusitana } from '@/src/app/ui/fonts';
import { Suspense } from 'react';

export default async function Page() {
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
