import {
  fetchPerformanceData,
  PerformanceWeek,
} from '@/app/services/cases/fetch_performance_chart';
import PerformanceChartLazy from './performance-chart-lazy';

const FALLBACK_DATA: PerformanceWeek[] = Array.from({ length: 6 }, (_, i) => ({
  week: `S${i + 1}`,
  tma: 0,
  volume: 0,
}));

export default async function PerformanceChartServer({
  category,
}: { category?: string } = {}) {
  const result = await fetchPerformanceData(category);
  const data = result.data ?? FALLBACK_DATA;
  return <PerformanceChartLazy data={data} />;
}
