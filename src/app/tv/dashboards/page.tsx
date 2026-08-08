'use server';
import AttendanceBonusServer from '@/app/components/dashboards/attendance-bonus-server';
import DailyEntriesChartServer from '@/app/components/dashboards/daily-entries-chart-server';
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

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[1fr_1.4fr] lg:gap-4">
        <div className="min-h-0 overflow-hidden">
          <Suspense fallback={<RankingSkeleton />}>
            <Ranking />
          </Suspense>
        </div>

        <div className="grid min-h-0 grid-rows-[1.3fr_1fr] gap-3 lg:gap-4">
          <div className="grid min-h-0 grid-cols-1 gap-3 lg:grid-cols-[1.6fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-4">
            <div className="shrink-0 lg:col-start-1 lg:row-start-1">
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

            <div className="min-h-0 overflow-hidden lg:col-start-1 lg:row-start-2">
              <Suspense fallback={<ChartSkeleton />}>
                <PerformanceChartServer />
              </Suspense>
            </div>

            <div className="min-h-0 overflow-hidden lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <Suspense fallback={<AttendanceBonusSkeleton />}>
                <AttendanceBonusServer />
              </Suspense>
            </div>
          </div>

          <div className="min-h-0 overflow-hidden">
            <Suspense fallback={<ChartSkeleton />}>
              <DailyEntriesChartServer />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
