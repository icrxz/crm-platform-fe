`use server`;
import { unauthorizedRedirect } from '@/app/libs/auth-redirect';
import { getCurrentUser } from '@/app/libs/session';
import { CaseListItem } from '@/app/types/case-list-item';
import { SearchResponse } from '@/app/types/search_response';
import { UserRole } from '@/app/types/user';
import { onlyAdminStatuses } from '@/app/utils/case_status';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import CasesTable from '../../components/cases/table';
import { fetchCasesFull } from '../../services/cases';

type CasePageParams = {
  searchParams: Promise<{
    sinistro?: string;
    page?: number;
  }>;
};

async function getData(
  sinistro: string,
  userRole: UserRole | undefined,
  page: number
): Promise<SearchResponse<CaseListItem>> {
  let query = '';
  if (sinistro) {
    query = `external_reference=${sinistro}`;
  }

  const { success, unauthorized, data } = await fetchCasesFull(query, page);
  if (!success || !data) {
    if (unauthorized) {
      await unauthorizedRedirect();
    }
    return { result: [], paging: { limit: 10, offset: page * 10, total: 0 } };
  }

  let filteredCases = data.result;

  if (userRole === UserRole.OPERATOR) {
    filteredCases = filteredCases.filter(
      (crmCase) => !onlyAdminStatuses.includes(crmCase.status)
    );
  }

  const listItems = filteredCases.map(
    (c): CaseListItem => ({
      case_id: c.case_id,
      external_reference: c.external_reference,
      status: c.status,
      due_date: c.due_date,
      customer_first_name: c.customer?.first_name,
      customer_last_name: c.customer?.last_name,
      customer_city: c.customer?.shipping?.city,
      contractor_company_name: c.contractor?.company_name,
      partner_first_name: c.partner?.first_name,
    })
  );

  return { result: listItems, paging: data.paging };
}

export default async function Page({ searchParams }: CasePageParams) {
  const { sinistro, page } = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const data = await getData(sinistro || '', user?.role, page || 1);

  return (
    <main>
      <Suspense fallback={<p>carregando casos...</p>}>
        {data && <CasesTable cases={data} initialPage={page || 1} />}
      </Suspense>
    </main>
  );
}
