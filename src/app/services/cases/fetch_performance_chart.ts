'use server';
import { Case } from '@/app/types/case';
import { SearchResponse } from '@/app/types/search_response';
import { ServiceResponse } from '@/app/types/service';
import { cookies } from 'next/headers';
import { crmCoreApiKey, crmCoreEndpoint } from '.';

export interface PerformanceWeek {
  week: string;
  tma: number;
  volume: number;
}

function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function buildWeekBuckets(numWeeks = 6) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - daysToMonday);

  const buckets = [];
  for (let i = numWeeks - 1; i >= 0; i--) {
    const weekStart = new Date(currentMonday);
    weekStart.setDate(currentMonday.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const pad = (n: number) => String(n).padStart(2, '0');
    const label = `${pad(weekStart.getDate())}/${pad(weekStart.getMonth() + 1)}`;
    buckets.push({ start: weekStart, end: weekEnd, label });
  }

  return buckets;
}

async function fetchAllPages<T>(
  buildUrl: (limit: number, offset: number) => string,
  headers: HeadersInit
): Promise<T[]> {
  const limit = 500;
  let offset = 0;
  const result: T[] = [];

  while (true) {
    const resp = await fetch(buildUrl(limit, offset), {
      method: 'GET',
      headers,
    });
    if (!resp.ok) break;
    const data = (await resp.json()) as SearchResponse<T>;
    result.push(...data.result);
    if (offset + limit >= data.paging.total) break;
    offset += limit;
  }

  return result;
}

export async function fetchPerformanceData(): Promise<
  ServiceResponse<PerformanceWeek[]>
> {
  try {
    const jwt = (await cookies()).get('jwt')?.value;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-API-Key': crmCoreApiKey || '',
      Authorization: `Bearer ${jwt}`,
    };

    const buckets = buildWeekBuckets(6);
    const startDate = formatDate(buckets[0].start);
    const endDate = formatDate(buckets[buckets.length - 1].end);

    const base = `${crmCoreEndpoint}/crm/core/api/v1`;
    const closedCases = await fetchAllPages<Case>(
      (limit, offset) =>
        `${base}/cases?status=Closed&closed_at_start=${startDate}&closed_at_end=${endDate}&limit=${limit}&offset=${offset}`,
      headers
    );

    const weekData = buckets.map((bucket) => ({
      week: bucket.label,
      tmas: [] as number[],
      count: 0,
    }));

    for (const c of closedCases) {
      if (!c.closed_at) continue;
      const closedDate = new Date(c.closed_at);

      const bucketIdx = buckets.findIndex(
        (b) => closedDate >= b.start && closedDate <= b.end
      );
      if (bucketIdx === -1) continue;

      weekData[bucketIdx].count++;
      const createdDate = new Date(c.created_at);
      const days = (closedDate.getTime() - createdDate.getTime()) / 86_400_000;
      weekData[bucketIdx].tmas.push(days);
    }

    const data: PerformanceWeek[] = weekData.map((w) => ({
      week: w.week,
      tma:
        w.tmas.length > 0
          ? Math.round(
              (w.tmas.reduce((a, b) => a + b, 0) / w.tmas.length) * 10
            ) / 10
          : 0,
      volume: w.count,
    }));

    return { success: true, message: '', data };
  } catch (ex) {
    console.error(ex);
    return {
      success: false,
      message: 'algo de errado aconteceu, contate o suporte!',
    };
  }
}
