'use server';

import PartnerDetails from '@/app/components/partners/details';
import ControlPanelSearch from '@/app/components/panel/search';
import ControlPanelTable from '@/app/components/panel/table';
import { getCurrentUser } from '@/app/libs/session';
import { fetchCasesFull } from '@/app/services/cases';
import { fetchContractors } from '@/app/services/contractors';
import { getPartnerByID } from '@/app/services/partners';
import { CaseFull, CaseStatus } from '@/app/types/case';
import { Contractor } from '@/app/types/contractor';
import { SearchResponse } from '@/app/types/search_response';
import { monthsNumeric } from '@/app/types/month';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

interface PartnerCaseFilters {
  mes?: string;
  ano?: string;
  estado?: string;
  seguradora?: string;
}

type PartnerPageParams = {
  params: Promise<{ partnerID: string }>;
  searchParams: Promise<PartnerCaseFilters>;
};

function prepareQuery(partnerID: string, filters?: PartnerCaseFilters): string {
  let query = `partner_id=${partnerID}&`;

  if (filters?.seguradora) {
    query += `contractor_id=${filters.seguradora}&`;
  }

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
  query += `end_date=${finalMonthDate.toISOString()}&`;
  query += `status=${CaseStatus.CLOSED}`;

  return query;
}

interface PartnerCasesResult extends SearchResponse<CaseFull> {
  contractors?: Contractor[];
}

async function getCases(
  partnerID: string,
  filters: PartnerCaseFilters
): Promise<PartnerCasesResult> {
  const query = prepareQuery(partnerID, filters);

  const { success, unauthorized, data } = await fetchCasesFull(query, 1, 10000);
  if (!success || !data) {
    if (unauthorized) {
      redirect('/login');
    }
    return {
      result: [],
      paging: { limit: 10000, offset: 10000, total: 0 },
    };
  }

  const contractors = await fetchContractors('', 1, 10000);

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
    result: [...groupsByDocument.values()].flat(),
    paging: data.paging,
    contractors: contractors.data?.result,
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

  const [partner, casesData] = await Promise.all([
    getPartnerByID(partnerID),
    getCases(partnerID, filters),
  ]);

  return (
    <main>
      <Suspense fallback={<p>Carregando técnico...</p>}>
        {partner?.data && <PartnerDetails partner={partner.data} />}
      </Suspense>

      <Suspense>
        {casesData.contractors && (
          <ControlPanelSearch contractors={casesData.contractors} />
        )}
        <ControlPanelTable cases={casesData} hideTecnicoColumn />
      </Suspense>
    </main>
  );
}
