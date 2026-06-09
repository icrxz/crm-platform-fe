import {
  fetchPerformanceData,
  PerformanceWeek,
} from '@/app/services/cases/fetch_performance_chart';
import PerformanceChart from './performance-chart';

const FALLBACK_DATA: PerformanceWeek[] = Array.from({ length: 6 }, (_, i) => ({
  week: `S${i + 1}`,
  tma: 0,
  volume: 0,
}));

export default async function PerformanceChartServer() {
  const result = await fetchPerformanceData();
  const data = result.data ?? FALLBACK_DATA;
  return <PerformanceChart data={data} />;
}
