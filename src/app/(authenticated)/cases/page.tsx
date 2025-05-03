`use server`;
import { getCurrentUser } from '@/app/libs/session';
import { CaseFull } from '@/app/types/case';
import { SearchResponse } from '@/app/types/search_response';
import { UserRole } from '@/app/types/user';
import { onlyAdminStatuses } from '@/app/utils/case_status';
import { signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import CasesTable from '../../components/cases/table';
import { fetchCasesFull } from '../../services/cases';

type CasePageParams = {
  searchParams: {
    sinistro?: string;
    page?: number;
  }
};

async function getData(sinistro: string, userRole: UserRole | undefined, page: number): Promise<SearchResponse<CaseFull>> {
  let query = '';
  if (sinistro) {
    query = `external_reference=${sinistro}`
  }

  const { success, unauthorized, data } = await fetchCasesFull(query, page);
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

  return {
    result: filteredCases,
    paging: data.paging,
  };
}

export default async function Page({ searchParams }: CasePageParams) {
  const user = await getCurrentUser();
  if (!user) {
    signOut();
  }

  const data = await getData(searchParams?.sinistro || '', user?.role, searchParams?.page || 1);

  return (
    <main>
      <Suspense fallback={<p>carregando casos...</p>} >
        {data && <CasesTable cases={data} initialPage={searchParams?.page || 1} />}
      </Suspense>
    </main>
  );
}
