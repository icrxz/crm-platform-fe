'use server';
import AttendanceBonus from '@/app/components/dashboards/attendance-bonus';
import KpiCards from '@/app/components/dashboards/kpi-cards';
import PerformanceChartLazy from '@/app/components/dashboards/performance-chart-lazy';
import Ranking from '@/app/components/dashboards/ranking';
import {
  AttendanceBonusSkeleton,
  ChartSkeleton,
  KpiCardsSkeleton,
  RankingSkeleton,
} from '@/app/components/dashboards/skeletons';
import { getCurrentUser } from '@/app/libs/session';
import { adminRoles } from '@/app/utils/roles';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!adminRoles.includes(user.role)) {
    redirect('/home');
  }

  return (
    <main className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <TrophyIcon className="h-6 w-6 text-amber-500" />
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
            Desempenho do Time
          </h1>
        </div>
        <p className="mt-0.5 text-sm text-gray-500">
          Acompanhe rankings, assiduidade e evolução no atendimento
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-4">
            <KpiCardsSkeleton />
          </div>
        }
      >
        <KpiCards />
      </Suspense>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense fallback={<RankingSkeleton />}>
          <Ranking />
        </Suspense>
        
        <div className="flex flex-col gap-4">
          <Suspense fallback={<AttendanceBonusSkeleton />}>
            <AttendanceBonus />
          </Suspense>
          <Suspense fallback={<ChartSkeleton />}>
            <PerformanceChartLazy />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
