import { fetchDailyEntries } from '@/app/services/cases/fetch_daily_entries';
import DailyEntriesChartLazy from './daily-entries-chart-lazy';

export default async function DailyEntriesChartServer() {
  const result = await fetchDailyEntries();
  const data = result.data?.data ?? [];
  const contractors = result.data?.contractors ?? [];
  const month =
    result.data?.month ?? String(new Date().getMonth() + 1).padStart(2, '0');
  return (
    <DailyEntriesChartLazy
      data={data}
      contractors={contractors}
      month={month}
    />
  );
}
