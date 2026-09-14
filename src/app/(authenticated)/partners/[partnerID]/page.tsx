'use server';

import PartnerDetails from '@/app/components/partners/details';
import ControlPanelSearch from '@/app/components/panel/search';
import PartnerBookTable from '@/app/components/partners/book-table';
import { unauthorizedRedirect } from '@/app/libs/auth-redirect';
import { getCurrentUser } from '@/app/libs/session';
import { toPartnerBookCaseItem } from '@/app/libs/partner-book';
import { fetchCasesFull } from '@/app/services/cases';
import { getPartnerByID } from '@/app/services/partners';
import { CaseFull } from '@/app/types/case';
import { PartnerBookCaseItem } from '@/app/types/partner-book-item';
import { SearchResponse } from '@/app/types/search_response';
import { monthsNumeric } from '@/app/types/month';
import { adminRoles } from '@/app/utils/roles';
import { redirect } from 'next/navigation';

interface PartnerCaseFilters {
  mes?: string;
  ano?: string;
  estado?: string;
}

type PartnerPageParams = {
  params: Promise<{ partnerID: string }>;
  searchParams: Promise<PartnerCaseFilters>;
};

function prepareQuery(partnerID: string, filters?: PartnerCaseFilters): string {
  let query = `partner_id=${partnerID}&`;

  if (filters?.estado) {
    query += `state=${filters.estado}&`;
  }

  let selectedMonth = new Date().getUTCMonth();
  if (filters?.mes) {
    if (Object.keys(monthsNumeric).find((key) => key === filters.mes)) {
      selectedMonth = monthsNumeric[filters.mes] - 1;
    }
  }

  const currentDate = new Date();
  let searchYear: number;
  if (filters?.ano) {
    searchYear = parseInt(filters.ano, 10);
  } else {
    const isLastYear = currentDate.getMonth() < selectedMonth;
    searchYear = isLastYear
      ? currentDate.getFullYear() - 1
      : currentDate.getFullYear();
  }

  const initialMonthDate = new Date(searchYear, selectedMonth, 1);
  initialMonthDate.setUTCHours(0, 0, 0, 0);

  const finalMonthDate = new Date(searchYear, selectedMonth + 1, 0);
  finalMonthDate.setUTCHours(23, 59, 59, 999);

  query += `start_date=${initialMonthDate.toISOString()}&`;
  query += `end_date=${finalMonthDate.toISOString()}`;

  return query;
}

async function getCases(
  partnerID: string,
  filters: PartnerCaseFilters
): Promise<SearchResponse<PartnerBookCaseItem>> {
  const query = prepareQuery(partnerID, filters);

  const { success, unauthorized, data } = await fetchCasesFull(query, 1, 10000);
  if (!success || !data) {
    if (unauthorized) {
      await unauthorizedRedirect();
    }
    return {
      result: [],
      paging: { limit: 10000, offset: 10000, total: 0 },
    };
  }

  const sortedByDate = [...data.result].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const groupsByDocument = new Map<string, CaseFull[]>();
  for (const c of sortedByDate) {
    const key = c.customer?.document || c.case_id;
    if (!groupsByDocument.has(key)) groupsByDocument.set(key, []);
    groupsByDocument.get(key)!.push(c);
  }

  return {
    result: [...groupsByDocument.values()].flat().map(toPartnerBookCaseItem),
    paging: data.paging,
  };
}

export default async function Page({
  params,
  searchParams,
}: PartnerPageParams) {
  const { partnerID } = await params;
  const filters = await searchParams;

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const isAdmin = adminRoles.includes(user.role);

  const [partner, casesData] = await Promise.all([
    getPartnerByID(partnerID),
    isAdmin ? getCases(partnerID, filters) : Promise.resolve(null),
  ]);

  return (
    <main>
      {partner?.data && <PartnerDetails partner={partner.data} />}

      {isAdmin && casesData && (
        <div className="mt-8">
          <ControlPanelSearch hideSeguradoraFilter />
          <PartnerBookTable cases={casesData} />
        </div>
      )}
    </main>
  );
}
