'use server';
import { getApiErrorMessage } from '@/app/libs/api-error';
import { Case } from '@/app/types/case';
import { SearchResponse } from '@/app/types/search_response';
import { ServiceResponse } from '@/app/types/service';
import { cookies } from 'next/headers';
import { crmCoreApiKey, crmCoreEndpoint } from '.';

export interface MonthlyClosedCount {
  month: string;
  count: number;
}

export interface DashboardKpis {
  closedHistory: MonthlyClosedCount[];
  slaPercentage: number;
  slaGoal: number;
}

function getMonthDateRange(
  year: number,
  month: number
): { start: string; end: string; label: string } {
  const pad = (n: number) => String(n).padStart(2, '0');
  const start = `${year}-${pad(month + 1)}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const end = `${year}-${pad(month + 1)}-${pad(lastDay)}`;
  const label = new Date(year, month, 1)
    .toLocaleString('pt-BR', { month: 'short' })
    .replace('.', '')
    .replace(/^\w/, (c) => c.toUpperCase());
  return { start, end, label };
}

async function buildHeaders(jwt: string | undefined): Promise<HeadersInit> {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': crmCoreApiKey || '',
    Authorization: `Bearer ${jwt}`,
  };
}

async function fetchClosedCount(
  start: string,
  end: string,
  headers: HeadersInit,
  category?: string
): Promise<number> {
  const categoryQuery = category
    ? `&metadata[category]=${encodeURIComponent(category)}`
    : '';
  const url = `${crmCoreEndpoint}/crm/core/api/v1/cases?status=Closed&closed_at_start=${start}&closed_at_end=${end}&limit=1&offset=0${categoryQuery}`;
  const resp = await fetch(url, {
    method: 'GET',
    headers,
    next: { revalidate: 60 },
  });
  if (!resp.ok) return 0;
  const data = (await resp.json()) as SearchResponse<Case>;
  return data.paging.total;
}

async function fetchAllClosedInPeriod(
  start: string,
  end: string,
  headers: HeadersInit,
  category?: string
): Promise<Case[]> {
  const limit = 500;
  let offset = 0;
  const result: Case[] = [];
  const categoryQuery = category
    ? `&metadata[category]=${encodeURIComponent(category)}`
    : '';

  while (true) {
    const url = `${crmCoreEndpoint}/crm/core/api/v1/cases?status=Closed&closed_at_start=${start}&closed_at_end=${end}&limit=${limit}&offset=${offset}${categoryQuery}`;
    const resp = await fetch(url, {
      method: 'GET',
      headers,
      next: { revalidate: 60 },
    });
    if (!resp.ok) break;

    const data = (await resp.json()) as SearchResponse<Case>;
    result.push(...data.result);

    if (offset + limit >= data.paging.total) break;
    offset += limit;
  }

  return result;
}

export async function fetchDashboardKpis(
  category?: string
): Promise<ServiceResponse<DashboardKpis>> {
  try {
    const jwt = (await cookies()).get('jwt')?.value;
    const headers = await buildHeaders(jwt);

    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) =>
      getMonthDateRange(now.getFullYear(), now.getMonth() - (5 - i))
    );

    const currentMonth = months[months.length - 1];

    const [countResults, currentMonthCases] = await Promise.all([
      Promise.all(
        months.map((m) => fetchClosedCount(m.start, m.end, headers, category))
      ),
      fetchAllClosedInPeriod(
        currentMonth.start,
        currentMonth.end,
        headers,
        category
      ),
    ]);

    const closedHistory: MonthlyClosedCount[] = months.map((m, i) => ({
      month: m.label,
      count: countResults[i],
    }));

    const casesWithDates = currentMonthCases.filter(
      (c) => c.target_date && c.closed_at
    );
    const slaCompliant = casesWithDates.filter(
      (c) => new Date(c.closed_at!) <= new Date(c.target_date!)
    );
    const slaPercentage =
      casesWithDates.length > 0
        ? Math.round((slaCompliant.length / casesWithDates.length) * 1000) / 10
        : 0;

    return {
      success: true,
      message: '',
      data: {
        closedHistory,
        slaPercentage,
        slaGoal: 90,
      },
    };
  } catch (ex) {
    console.error(ex);
    return {
      success: false,
      message: 'algo de errado aconteceu, contate o suporte!',
    };
  }
}
