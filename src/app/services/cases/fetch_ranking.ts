'use server';
import { Case, CaseStatus } from '@/app/types/case';
import { SearchResponse } from '@/app/types/search_response';
import { ServiceResponse } from '@/app/types/service';
import { User, UserRole } from '@/app/types/user';
import { cookies } from 'next/headers';
import { crmCoreApiKey, crmCoreEndpoint } from '.';

const IN_PROGRESS_STATUSES = [
  CaseStatus.NEW,
  CaseStatus.CUSTOMER_INFO,
  CaseStatus.WAITING_PARTNER,
  CaseStatus.ONGOING,
  CaseStatus.REPORT,
];

const FINALIZED_OPEN_STATUSES = [CaseStatus.PAYMENT, CaseStatus.RECEIPT];

export interface RankingAgent {
  name: string;
  inProgress: {
    green: number;
    yellow: number;
    red: number;
  };
  finalized: {
    vistoria: number;
    reparo: number;
  };
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function currentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = `${year}-${pad(month + 1)}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const end = `${year}-${pad(month + 1)}-${pad(lastDay)}`;
  return { start, end };
}

function isInCurrentMonth(dateStr: string): boolean {
  const now = new Date();
  const date = new Date(dateStr);
  return (
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth()
  );
}

function last3MonthsRange(): { start: string; end: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const startStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-01`;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const end = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(lastDay)}`;
  return { start: startStr, end };
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

export async function fetchRankingData(
  category?: string
): Promise<ServiceResponse<RankingAgent[]>> {
  try {
    const jwt = (await cookies()).get('jwt')?.value;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-API-Key': crmCoreApiKey || '',
      Authorization: `Bearer ${jwt}`,
    };

    const base = `${crmCoreEndpoint}/crm/core/api/v1`;
    const { start: monthStart, end: monthEnd } = currentMonthRange();
    const { start: last3Start, end: last3End } = last3MonthsRange();
    const inProgressQuery = IN_PROGRESS_STATUSES.map((s) => `status=${s}`).join(
      '&'
    );
    const finalizedOpenQuery = FINALIZED_OPEN_STATUSES.map(
      (s) => `status=${s}`
    ).join('&');
    const categoryQuery = category
      ? `&metadata[category]=${encodeURIComponent(category)}`
      : '';

    const [inProgressCases, finalizedOpenCases, closedCases] =
      await Promise.all([
        fetchAllPages<Case>(
          (limit, offset) =>
            `${base}/cases?${inProgressQuery}&start_date=${last3Start}&end_date=${last3End}&limit=${limit}&offset=${offset}${categoryQuery}`,
          headers
        ),
        fetchAllPages<Case>(
          (limit, offset) =>
            `${base}/cases?${finalizedOpenQuery}&limit=${limit}&offset=${offset}${categoryQuery}`,
          headers
        ),
        fetchAllPages<Case>(
          (limit, offset) =>
            `${base}/cases?status=Closed&closed_at_start=${monthStart}&closed_at_end=${monthEnd}&limit=${limit}&offset=${offset}${categoryQuery}`,
          headers
        ),
      ]);

    const finalizedCases = [
      ...finalizedOpenCases.filter((c) => isInCurrentMonth(c.updated_at)),
      ...closedCases,
    ];

    const ownerIds = [
      ...new Set(
        [...inProgressCases, ...finalizedCases]
          .map((c) => c.owner_id)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    const usersMap = new Map<string, User>();
    if (ownerIds.length > 0) {
      const userQuery = ownerIds.map((id) => `user_id=${id}`).join('&');
      const resp = await fetch(
        `${base}/users?${userQuery}&role=${UserRole.OPERATOR}&active=true&limit=${ownerIds.length + 10}`,
        { method: 'GET', headers, next: { revalidate: 60 } }
      );
      if (resp.ok) {
        const data = (await resp.json()) as SearchResponse<User>;
        data.result.forEach((u) => usersMap.set(u.user_id, u));
      }
    }

    const rankingMap = new Map<string, RankingAgent>();

    const getOrCreate = (ownerId: string): RankingAgent | null => {
      if (!usersMap.has(ownerId)) return null;
      if (!rankingMap.has(ownerId)) {
        const user = usersMap.get(ownerId)!;
        const name = `${user.first_name} ${user.last_name}`.trim();
        rankingMap.set(ownerId, {
          name,
          inProgress: { green: 0, yellow: 0, red: 0 },
          finalized: { vistoria: 0, reparo: 0 },
        });
      }
      return rankingMap.get(ownerId)!;
    };

    for (const c of inProgressCases) {
      if (!c.owner_id) continue;
      const agent = getOrCreate(c.owner_id);
      if (!agent) continue;
      const days = daysSince(c.created_at);

      if (days <= 5) {
        agent.inProgress.green++;
      } else if (days <= 10) {
        agent.inProgress.yellow++;
      } else {
        agent.inProgress.red++;
      }
    }

    for (const c of finalizedCases) {
      if (!c.owner_id) continue;
      const agent = getOrCreate(c.owner_id);
      if (!agent) continue;
      if (c.type === 'inspection') {
        agent.finalized.vistoria++;
      } else if (c.type === 'repair') {
        agent.finalized.reparo++;
      }
    }

    const agents = [...rankingMap.values()].sort((a, b) => {
      const aFin = a.finalized.vistoria + a.finalized.reparo;
      const bFin = b.finalized.vistoria + b.finalized.reparo;
      if (bFin !== aFin) return bFin - aFin;
      const aInProg =
        a.inProgress.green + a.inProgress.yellow + a.inProgress.red;
      const bInProg =
        b.inProgress.green + b.inProgress.yellow + b.inProgress.red;
      return bInProg - aInProg;
    });

    return { success: true, message: '', data: agents };
  } catch (ex) {
    console.error(ex);
    return {
      success: false,
      message: 'algo de errado aconteceu, contate o suporte!',
    };
  }
}
