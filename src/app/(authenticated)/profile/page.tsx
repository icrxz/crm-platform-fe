'use server';
import { ProfileForm } from '@/app/components/users/profile-form';
import { getCurrentUser } from '@/app/libs/session';
import { getUserByID } from '@/app/services/user';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await getCurrentUser();

  if (!session) {
    redirect('/login');
  }

  const { data: user } = await getUserByID(session.user_id);

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <UserCircleIcon className="h-6 w-6 text-blue-500" />
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
            Meu Perfil
          </h1>
        </div>
        <p className="mt-0.5 text-sm text-gray-500">
          Gerencie seus dados de acesso
        </p>
      </div>

      <div className="max-w-2xl">
        <ProfileForm user={user} />
      </div>
    </main>
  );
}
