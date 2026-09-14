'use server';
import { Case } from '@/app/types/case';
import { Contractor } from '@/app/types/contractor';
import { SearchResponse } from '@/app/types/search_response';
import { ServiceResponse } from '@/app/types/service';
import { cookies } from 'next/headers';
import { crmCoreApiKey, crmCoreEndpoint } from '.';

export interface DailyEntry {
  day: string;
  [contractorName: string]: number | string;
}

export interface DailyEntriesData {
  data: DailyEntry[];
  contractors: string[];
  month: string;
}

function currentMonthRange(): {
  start: string;
  end: string;
  daysInMonth: number;
  month: string;
} {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const start = `${year}-${pad(month + 1)}-01`;
  const end = `${year}-${pad(month + 1)}-${pad(daysInMonth)}`;
  return { start, end, daysInMonth, month: pad(month + 1) };
}

async function buildHeaders(jwt: string | undefined): Promise<HeadersInit> {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': crmCoreApiKey || '',
    Authorization: `Bearer ${jwt}`,
  };
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
      next: { revalidate: 60 },
    });
    if (!resp.ok) break;
    const data = (await resp.json()) as SearchResponse<T>;
    result.push(...data.result);
    if (offset + limit >= data.paging.total) break;
    offset += limit;
  }

  return result;
}

export async function fetchDailyEntries(
  category?: string
): Promise<ServiceResponse<DailyEntriesData>> {
  try {
    const jwt = (await cookies()).get('jwt')?.value;
    const headers = await buildHeaders(jwt);
    const base = `${crmCoreEndpoint}/crm/core/api/v1`;
    const { start, end, daysInMonth, month } = currentMonthRange();
    const categoryQuery = category
      ? `&metadata[category]=${encodeURIComponent(category)}`
      : '';

    const [cases, contractors] = await Promise.all([
      fetchAllPages<Case>(
        (limit, offset) =>
          `${base}/cases?start_date=${start}&end_date=${end}&limit=${limit}&offset=${offset}${categoryQuery}`,
        headers
      ),
      fetchAllPages<Contractor>(
        (limit, offset) =>
          `${base}/contractors?limit=${limit}&offset=${offset}`,
        headers
      ),
    ]);

    const contractorNameById = new Map(
      contractors.map((c) => [c.contractor_id, c.company_name])
    );

    const usedContractorNames = [
      ...new Set(
        cases
          .map((c) => contractorNameById.get(c.contractor_id))
          .filter((name): name is string => Boolean(name))
      ),
    ].sort((a, b) => a.localeCompare(b, 'pt-BR'));

    const data: DailyEntry[] = Array.from({ length: daysInMonth }, (_, i) => {
      const entry: DailyEntry = { day: String(i + 1).padStart(2, '0') };
      usedContractorNames.forEach((name) => {
        entry[name] = 0;
      });
      return entry;
    });

    for (const c of cases) {
      const contractorName = contractorNameById.get(c.contractor_id);
      if (!contractorName) continue;

      const day = new Date(c.created_at).getUTCDate();
      const entry = data[day - 1];
      if (!entry) continue;
      entry[contractorName] = (entry[contractorName] as number) + 1;
    }

    return {
      success: true,
      message: '',
      data: { data, contractors: usedContractorNames, month },
    };
  } catch (ex) {
    console.error(ex);
    return {
      success: false,
      message: 'algo de errado aconteceu, contate o suporte!',
    };
  }
}
