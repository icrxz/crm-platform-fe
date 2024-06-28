import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Usuários',
};

export default async function Page() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main>
      <Suspense fallback={<p>Carregando usuários...</p>}>
        <p>Em construção!!</p>
      </Suspense>
    </main>
  );
}
