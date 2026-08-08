`use server`;
import { unauthorizedRedirect } from '@/app/libs/auth-redirect';
import { getCurrentUser } from '@/app/libs/session';
import { CaseListItem } from '@/app/types/case-list-item';
import { CaseStatus } from '@/app/types/case';
import { SearchResponse } from '@/app/types/search_response';
import { UserRole } from '@/app/types/user';
import { mapCasesToListItems } from '@/app/utils/case_list_item';
import {
  defaultCaseStatuses,
  onlyAdminStatuses,
} from '@/app/utils/case_status';
import { adminRoles } from '@/app/utils/roles';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import CasesTable from '../../components/cases/table';
import { fetchCasesFull } from '../../services/cases';

type CasePageParams = {
  searchParams: Promise<{
    sinistro?: string;
    status?: string | string[];
    contractor_id?: string | string[];
    only_mine?: string;
    page?: number;
  }>;
};

function toQueryParts(key: string, value?: string | string[]): string[] {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  return values.filter(Boolean).map((v) => `${key}=${v}`);
}

async function getData(
  sinistro: string,
  status: string | string[] | undefined,
  contractorId: string | string[] | undefined,
  ownerId: string,
  userRole: UserRole | undefined,
  page: number
): Promise<SearchResponse<CaseListItem>> {
  const isAdmin = userRole !== undefined && adminRoles.includes(userRole);

  const requestedStatuses =
    status !== undefined
      ? Array.isArray(status)
        ? status
        : [status]
      : defaultCaseStatuses;

  const allowedStatuses = isAdmin
    ? requestedStatuses
    : requestedStatuses.filter(
        (s) => !onlyAdminStatuses.includes(s as CaseStatus)
      );

  const queryParts: string[] = [
    ...(sinistro ? [`external_reference=${sinistro}`] : []),
    ...allowedStatuses.map((s) => `status=${s}`),
    ...toQueryParts('contractor_id', contractorId),
    ...(ownerId ? [`owner_id=${ownerId}`] : []),
  ];
  const query = queryParts.join('&');

  const { success, unauthorized, data } = await fetchCasesFull(query, page);
  if (!success || !data) {
    if (unauthorized) {
      await unauthorizedRedirect();
    }
    return { result: [], paging: { limit: 10, offset: page * 10, total: 0 } };
  }

  return { result: mapCasesToListItems(data.result), paging: data.paging };
}

export default async function Page({ searchParams }: CasePageParams) {
  const { sinistro, status, contractor_id, only_mine, page } =
    await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const ownerId = only_mine === 'true' ? user.user_id : '';

  const data = await getData(
    sinistro || '',
    status,
    contractor_id,
    ownerId,
    user?.role,
    page || 1
  );

  return (
    <main>
      <Suspense fallback={<p>carregando casos...</p>}>
        {data && (
          <CasesTable
            cases={data}
            initialPage={page || 1}
            userRole={user.role}
          />
        )}
      </Suspense>
    </main>
  );
}
