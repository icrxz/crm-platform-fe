'use server';
import AttendanceBonusServer from '@/app/components/dashboards/attendance-bonus-server';
import KpiCards from '@/app/components/dashboards/kpi-cards';
import PerformanceChartServer from '@/app/components/dashboards/performance-chart-server';
import Ranking from '@/app/components/dashboards/ranking';
import {
  AttendanceBonusSkeleton,
  ChartSkeleton,
  KpiCardsSkeleton,
  RankingSkeleton,
} from '@/app/components/dashboards/skeletons';
import AutoRefresh from '@/app/components/tv/auto-refresh';
import { getCurrentUser } from '@/app/libs/session';
import { adminRoles } from '@/app/utils/roles';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default async function TvDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!adminRoles.includes(user.role)) {
    redirect('/home');
  }

  return (
    <main className="flex h-screen w-screen flex-col gap-3 overflow-hidden p-3 lg:gap-4 lg:p-4 2xl:p-6">
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <TrophyIcon className="h-5 w-5 text-amber-500 lg:h-6 lg:w-6" />
          <h1 className="text-lg font-bold text-gray-900 lg:text-xl 2xl:text-2xl">
            Desempenho do Time
          </h1>
        </div>
        <AutoRefresh />
      </div>

      <div className="shrink-0">
        <Suspense
          fallback={
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <KpiCardsSkeleton />
            </div>
          }
        >
          <KpiCards />
        </Suspense>
      </div>

      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4 2xl:grid-cols-3">
        <div className="min-h-0 overflow-hidden">
          <Suspense fallback={<RankingSkeleton />}>
            <Ranking />
          </Suspense>
        </div>

        <div className="min-h-0 overflow-hidden">
          <Suspense fallback={<AttendanceBonusSkeleton />}>
            <AttendanceBonusServer />
          </Suspense>
        </div>

        <div className="min-h-0 overflow-hidden">
          <Suspense fallback={<ChartSkeleton />}>
            <PerformanceChartServer />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
