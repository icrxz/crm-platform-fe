'use server';
import Achievements from '@/app/components/dashboards/achievements';
import KpiCards from '@/app/components/dashboards/kpi-cards';
import PerformanceChart from '@/app/components/dashboards/performance-chart';
import PeriodFilter from '@/app/components/dashboards/period-filter';
import Ranking from '@/app/components/dashboards/ranking';
import Rewards from '@/app/components/dashboards/rewards';
import {
  ChartSkeleton,
  GenericSkeleton,
  KpiCardsSkeleton,
  RankingSkeleton,
} from '@/app/components/dashboards/skeletons';
import { getCurrentUser } from '@/app/libs/session';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrophyIcon className="h-6 w-6 text-amber-500" />
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
              Desempenho do Time
            </h1>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            Acompanhe rankings, conquistas e evolução no atendimento
          </p>
        </div>
        <PeriodFilter />
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
        <Suspense fallback={<GenericSkeleton />}>
          <Achievements />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense fallback={<ChartSkeleton />}>
          <PerformanceChart />
        </Suspense>
        <Suspense fallback={<GenericSkeleton />}>
          <Rewards />
        </Suspense>
      </div>
    </main>
  );
}
