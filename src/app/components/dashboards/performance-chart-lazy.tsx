'use client';
import { PerformanceWeek } from '@/app/services/cases/fetch_performance_chart';
import dynamic from 'next/dynamic';
import { ChartSkeleton } from './skeletons';

const PerformanceChart = dynamic(() => import('./performance-chart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

export default function PerformanceChartLazy({
  data,
}: {
  data: PerformanceWeek[];
}) {
  return <PerformanceChart data={data} />;
}
