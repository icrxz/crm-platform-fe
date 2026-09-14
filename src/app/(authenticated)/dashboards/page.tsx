'use server';
import AttendanceBonusServer from '@/app/components/dashboards/attendance-bonus-server';
import CategoryFilter from '@/app/components/dashboards/category-filter';
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
import { getCurrentUser } from '@/app/libs/session';
import { parseCaseCategory } from '@/app/types/case';
import { adminRoles } from '@/app/utils/roles';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

type DashboardsPageParams = {
  searchParams: Promise<{ category?: string }>;
};

export default async function Page({ searchParams }: DashboardsPageParams) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!adminRoles.includes(user.role)) {
    redirect('/home');
  }

  const { category: categoryParam } = await searchParams;
  const category = parseCaseCategory(categoryParam);

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
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

        <CategoryFilter />
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-4">
            <KpiCardsSkeleton />
          </div>
        }
      >
        <KpiCards category={category} />
      </Suspense>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="min-h-[640px]">
          <Suspense fallback={<RankingSkeleton />}>
            <Ranking category={category} />
          </Suspense>
        </div>

        <div className="flex flex-col gap-4">
          <div className="min-h-[340px]">
            <Suspense fallback={<AttendanceBonusSkeleton />}>
              <AttendanceBonusServer />
            </Suspense>
          </div>
          <div className="min-h-[340px]">
            <Suspense fallback={<ChartSkeleton />}>
              <PerformanceChartServer category={category} />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="min-h-[360px]">
        <Suspense fallback={<ChartSkeleton />}>
          <DailyEntriesChartServer category={category} />
        </Suspense>
      </div>
    </main>
  );
}
