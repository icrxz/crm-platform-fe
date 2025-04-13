`use server`;
import { getCurrentUser } from '@/app/libs/session';
import { getContractorByID } from '@/app/services/contractors';
import { getCustomerByID } from '@/app/services/customers';
import { getPartnerByID } from '@/app/services/partners';
import { Case, CaseFull } from '@/app/types/case';
import { SearchResponse } from '@/app/types/search_response';
import { UserRole } from '@/app/types/user';
import { onlyAdminStatuses } from '@/app/utils/case_status';
import { signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import CasesTable from '../../components/cases/table';
import { fetchCases } from '../../services/cases';

interface CaseFilters {
  sinistro?: string;
  status?: string;
  page?: number;
}

type CasePageParams = {
  searchParams: CaseFilters;
};

function prepareQuery(filters?: CaseFilters): string {
  let query = '';

  if (filters?.sinistro) {
    query += `external_reference=${filters.sinistro}&`
  }

  if (filters?.status) {
    query += `status=${filters.status}&`;
  }

  if (query.endsWith('&')) {
    query = query.slice(0, -1);
  }

  return query;
}

async function getData(filters: CaseFilters, userRole: UserRole | undefined): Promise<SearchResponse<CaseFull>> {
  let { page, ...rest } = filters || {};
  page = page || 1;

  const query = prepareQuery(rest);

  const { success, unauthorized, data } = await fetchCases(query, page);
  if (!success || !data) {
    if (unauthorized) {
      redirect("/login");
    }
    return { result: [], paging: { limit: 10, offset: page * 10, total: 0 } };
  }

  const cases = data.result;

  let filteredCases = cases;

  if (userRole === UserRole.OPERATOR) {
    filteredCases = cases.filter((crmCase) => !onlyAdminStatuses.includes(crmCase.status));
  }

  const casesFull = await Promise.all(filteredCases.map(async (crmCase: Case) => {
    const [customer, contractor, partner] = await Promise.all([
      crmCase.customer_id && getCustomerByID(crmCase?.customer_id),
      getContractorByID(crmCase.contractor_id),
      crmCase.partner_id && getPartnerByID(crmCase.partner_id)
    ]);

    return {
      ...crmCase,
      customer: customer && customer.data ? customer.data : undefined,
      contractor: contractor.data,
      partner: partner && partner.data ? partner.data : undefined,
    };
  }));

  return {
    result: casesFull,
    paging: data.paging,
  };
}

export default async function Page({ searchParams }: CasePageParams) {
  const user = await getCurrentUser();
  if (!user) {
    signOut();
  }

  const data = await getData(searchParams, user?.role);

  return (
    <main>
      <Suspense fallback={<p>carregando casos...</p>} >
        {data && <CasesTable cases={data} initialPage={searchParams?.page || 1} />}
      </Suspense>
    </main>
  );
}
