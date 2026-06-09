'use client';
import dynamic from 'next/dynamic';
import { ChartSkeleton } from './skeletons';

const PerformanceChart = dynamic(() => import('./performance-chart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

export default function PerformanceChartLazy() {
  return <PerformanceChart />;
}
