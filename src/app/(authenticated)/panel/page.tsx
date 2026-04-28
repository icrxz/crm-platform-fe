'use server';
import ControlPanelTable from '@/app/components/panel/table';
import { getCurrentUser } from '@/app/libs/session';
import { fetchContractors } from '@/app/services/contractors';
import { fetchPartners } from '@/app/services/partners';
import { CaseFull, CaseStatus } from '@/app/types/case';
import { Contractor } from '@/app/types/contractor';
import { Partner } from '@/app/types/partner';
import { SearchResponse } from '@/app/types/search_response';
import { redirect } from 'next/navigation';
import { adminRoles } from '@/app/utils/roles';
import { fetchCasesFull } from '../../services/cases';
import { roboto } from '../../ui/fonts';
import ControlPanelSummary from '@/app/components/panel/summary';
import ControlPanelSearch from '@/app/components/panel/search';
import { months, monthsNumeric } from '@/app/types/month';

interface PanelFilters {
  mes?: string;
  ano?: string;
  estado?: string;
  seguradora?: string;
  tecnico?: string;
}

type PanelPageParams = {
  searchParams: Promise<PanelFilters>;
};

function prepareQuery(filters: PanelFilters): string {
  let query = '';

  if (filters.seguradora) {
    query += `contractor_id=${filters.seguradora}&`;
  }

  if (filters.tecnico) {
    query += `partner_id=${filters.tecnico}&`;
  }

  if (filters.estado) {
    query += `state=${filters.estado}&`;
  }

  if (filters.mes && filters.mes in monthsNumeric && filters.ano) {
    const selectedMonth = monthsNumeric[filters.mes] - 1;
    const searchYear = parseInt(filters.ano, 10);

    const initialMonthDate = new Date(searchYear, selectedMonth, 1);
    initialMonthDate.setUTCHours(0, 0, 0, 0);

    const finalMonthDate = new Date(searchYear, selectedMonth + 1, 0);
    finalMonthDate.setUTCHours(23, 59, 59, 999);

    query += `start_date=${initialMonthDate.toISOString()}&`;
    query += `end_date=${finalMonthDate.toISOString()}&`;
  }

  query += `status=${CaseStatus.CLOSED}`;

  return query;
}

function applyDefaultFilters(filters: PanelFilters): PanelFilters {
  if (Object.keys(filters).length > 0) return filters;

  const now = new Date();
  return {
    mes: months[now.getMonth()],
    ano: String(now.getFullYear()),
  };
}

interface PanelResult extends SearchResponse<CaseFull> {
  contractors?: Contractor[];
  partners?: Partner[];
}

async function getData(filters: PanelFilters): Promise<PanelResult> {
  const query = prepareQuery(filters);

  const [casesResponse, contractorsResponse, partnersResponse] =
    await Promise.all([
      fetchCasesFull(query, 1, 10000),
      fetchContractors('', 1, 10000),
      fetchPartners('', 1, 10000),
    ]);

  if (!casesResponse.success || !casesResponse.data) {
    if (casesResponse.unauthorized) {
      redirect('/login');
    }
    return {
      result: [],
      paging: { limit: 10000, offset: 1 * 10000, total: 0 },
    };
  }

  const sortedByDate = [...casesResponse.data.result].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const groupsByDocument = new Map<string, CaseFull[]>();
  for (const c of sortedByDate) {
    const key = c.customer?.document || c.case_id;
    if (!groupsByDocument.has(key)) groupsByDocument.set(key, []);
    groupsByDocument.get(key)!.push(c);
  }
  const processedResult = [...groupsByDocument.values()].flat();

  return {
    result: processedResult,
    paging: casesResponse.data.paging,
    contractors: contractorsResponse.data?.result,
    partners: partnersResponse.data?.result,
  };
}

export default async function Page({ searchParams }: PanelPageParams) {
  const filters = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (!adminRoles.includes(user.role)) {
    redirect('/home');
  }

  const data = await getData(applyDefaultFilters(filters));

  return (
    <main>
      <h1 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
        Painel de controle
      </h1>

      <div>
        {data.contractors && data.partners && (
          <ControlPanelSearch
            contractors={data.contractors || []}
            partners={data.partners || []}
          />
        )}

        {data.result && (
          <>
            <ControlPanelSummary cases={data.result} />
            <ControlPanelTable cases={data} />
          </>
        )}
      </div>
    </main>
  );
}
