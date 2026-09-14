import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import CardWrapper from '../../components/dashboard/cards';
import { CardsSkeleton } from '../../components/dashboard/skeletons';
import { getCurrentUser } from '../../libs/session';
import { adminRoles } from '../../utils/roles';
import { roboto } from '../../ui/fonts';

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const cardCount = adminRoles.includes(user.role) ? 4 : 2;

  return (
    <main>
      <h1 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton count={cardCount} />}>
          <CardWrapper user={user} />
        </Suspense>
      </div>
    </main>
  );
}
