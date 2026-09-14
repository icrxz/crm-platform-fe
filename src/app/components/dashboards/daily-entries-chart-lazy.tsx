'use client';
import { DailyEntry } from '@/app/services/cases/fetch_daily_entries';
import dynamic from 'next/dynamic';
import { ChartSkeleton } from './skeletons';

const DailyEntriesChart = dynamic(() => import('./daily-entries-chart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

export default function DailyEntriesChartLazy({
  data,
  contractors,
  month,
}: {
  data: DailyEntry[];
  contractors: string[];
  month: string;
}) {
  return (
    <DailyEntriesChart data={data} contractors={contractors} month={month} />
  );
}
