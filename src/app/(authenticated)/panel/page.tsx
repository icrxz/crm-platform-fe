'use server';
import ControlPanelTable from '@/app/components/panel/table';
import { getCurrentUser } from '@/app/libs/session';
import { fetchContractors } from '@/app/services/contractors';
import { fetchPartners } from '@/app/services/partners';
import { CaseFull, CaseStatus } from '@/app/types/case';
import { Contractor } from '@/app/types/contractor';
import { Partner } from '@/app/types/partner';
import { SearchResponse } from '@/app/types/search_response';
import { UserRole } from '@/app/types/user';
import { signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { CardsSkeleton } from '../../components/dashboard/skeletons';
import { fetchCasesFull } from '../../services/cases';
import { roboto } from '../../ui/fonts';
import ControlPanelSummary from '@/app/components/panel/summary';
import ControlPanelSearch from '@/app/components/panel/search';
import { monthsNumeric } from '@/app/types/month';

interface PanelFilters {
  mes?: string;
  estado?: string;
  seguradora?: string;
  tecnico?: string;
}

type PanelPageParams = {
  searchParams: PanelFilters;
};

function prepareQuery(filters?: PanelFilters): string {
  let query = '';

  if (filters?.seguradora) {
    query += `contractor_id=${filters.seguradora}&`;
  }

  if (filters?.tecnico) {
    query += `partner_id=${filters.tecnico}&`;
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
  const isLastYear = currentDate.getMonth() < selectedMonth;
  const searchYear = isLastYear ? currentDate.getFullYear() - 1 : currentDate.getFullYear();

  const initialMonthDate = new Date(searchYear, selectedMonth, 1);
  initialMonthDate.setUTCHours(0, 0, 0, 0);

  const finalMonthDate = new Date(searchYear, selectedMonth + 1, 0);
  finalMonthDate.setUTCHours(23, 59, 59, 999);

  query += `start_date=${initialMonthDate.toISOString()}&`;
  query += `end_date=${finalMonthDate.toISOString()}&`;

  query += `status=${CaseStatus.CLOSED}`;

  return query;
}

interface PanelResult extends SearchResponse<CaseFull> {
  contractors?: Contractor[];
  partners?: Partner[];
}

async function getData(filters: PanelFilters): Promise<PanelResult> {
  const query = prepareQuery(filters);

  const { success, unauthorized, data } = await fetchCasesFull(query, 1, 10000);
  if (!success || !data) {
    if (unauthorized) {
      redirect("/login");
    }
    return { result: [], paging: { limit: 10000, offset: 1 * 10000, total: 0 } };
  }

  const contractors = await fetchContractors('', 1, 10000);

  const partners = await fetchPartners('', 1, 10000);

  return {
    result: data.result,
    paging: data.paging,
    contractors: contractors.data?.result,
    partners: partners.data?.result,
  };
}

export default async function Page({ searchParams }: PanelPageParams) {
  const user = await getCurrentUser();
  if (!user) {
    signOut();
  }

  if (user?.role === UserRole.OPERATOR) {
    redirect("/home");
  }

  const data = await getData(searchParams);

  return (
    <main>
      <h1 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
        Painel de controle
      </h1>

      <div>
        <Suspense fallback={<CardsSkeleton />}>
          {data.contractors && data.partners && <ControlPanelSearch contractors={data.contractors || []} partners={data.partners || []} />}

          {data.result && (
            <>
              <ControlPanelSummary cases={data.result} />
              <ControlPanelTable cases={data} />
            </>
          )}
        </Suspense>
      </div>
    </main>
  );
}
