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
    <main className="flex min-h-screen flex-col gap-4 p-4 lg:gap-6 lg:p-6 2xl:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrophyIcon className="h-5 w-5 text-amber-500 lg:h-6 lg:w-6" />
          <h1 className="text-lg font-bold text-gray-900 lg:text-xl 2xl:text-2xl">
            Desempenho do Time
          </h1>
        </div>
        <AutoRefresh />
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

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <Suspense fallback={<RankingSkeleton />}>
          <Ranking />
        </Suspense>

        <Suspense fallback={<AttendanceBonusSkeleton />}>
          <AttendanceBonusServer />
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <PerformanceChartServer />
        </Suspense>
      </div>
    </main>
  );
}
