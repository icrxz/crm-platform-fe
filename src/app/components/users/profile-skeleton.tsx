import { UserCircleIcon } from '@heroicons/react/24/outline';
import { SkeletonBlock } from '../common/skeleton-block';

function FieldSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <SkeletonBlock className="mb-1 h-3 w-16" />
      <SkeletonBlock className="h-4 w-full" />
    </div>
  );
}

export function ProfileSkeleton() {
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

      <div className="flex max-w-2xl flex-col gap-4">
        <div className="rounded-xl bg-gray-50 p-6 shadow-sm">
          <SkeletonBlock className="mb-4 h-5 w-32" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton className="md:col-span-2" />
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 p-6 shadow-sm">
          <SkeletonBlock className="mb-4 h-5 w-32" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
        </div>
      </div>
    </main>
  );
}
