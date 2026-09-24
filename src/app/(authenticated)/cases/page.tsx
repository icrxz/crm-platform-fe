`use server`;
import { unauthorizedRedirect } from '@/app/libs/auth-redirect';
import { getCurrentUser } from '@/app/libs/session';
import { CaseListItem } from '@/app/types/case-list-item';
import { CaseStatus } from '@/app/types/case';
import { SearchResponse } from '@/app/types/search_response';
import { UserRole } from '@/app/types/user';
import { mapCasesToListItems } from '@/app/utils/case_list_item';
import {
  getDefaultCaseStatuses,
  onlyAdminStatuses,
} from '@/app/utils/case_status';
import { ADVANCE_REQUESTED_METADATA_KEY } from '@/app/utils/case_metadata';
import { adminRoles } from '@/app/utils/roles';
import { redirect } from 'next/navigation';
import CasesTable from '../../components/cases/table';
import { fetchCasesFull } from '../../services/cases';

type CasePageParams = {
  searchParams: Promise<{
    sinistro?: string;
    status?: string | string[];
    contractor_id?: string | string[];
    category?: string | string[];
    advance_requested?: string;
    only_mine?: string;
    page?: number;
  }>;
};

function toQueryParts(key: string, value?: string | string[]): string[] {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  return values.filter(Boolean).map((v) => `${key}=${v}`);
}

// category isn't a top-level case field — it lives under metadata (see
// Case['metadata']), so the API expects metadata[category]=value the same
// way the dashboards filters already query it (fetch_dashboard_kpis.ts,
// fetch_ranking.ts, etc.) rather than a plain category=value. Encoded
// explicitly since '+' (CaseCategory.D_PLUS = 'd+') needs it and this
// string is hand-built, not passed through URLSearchParams.
function toMetadataCategoryQueryParts(value?: string | string[]): string[] {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  return values
    .filter(Boolean)
    .map((v) => `metadata[category]=${encodeURIComponent(v)}`);
}

// Same metadata[key]=value convention as category, for the boolean
// "Solicitar Adiantamento/Peça" flag set from ongoing_case.tsx.
function toMetadataFlagQueryParts(key: string, value?: string): string[] {
  return value === 'true' ? [`metadata[${key}]=true`] : [];
}

async function getData(
  sinistro: string,
  status: string | string[] | undefined,
  contractorId: string | string[] | undefined,
  category: string | string[] | undefined,
  advanceRequested: string | undefined,
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
      : getDefaultCaseStatuses(isAdmin);

  const allowedStatuses = isAdmin
    ? requestedStatuses
    : requestedStatuses.filter(
        (s) => !onlyAdminStatuses.includes(s as CaseStatus)
      );

  const queryParts: string[] = [
    ...(sinistro ? [`external_reference=${sinistro}`] : []),
    ...allowedStatuses.map((s) => `status=${s}`),
    ...toQueryParts('contractor_id', contractorId),
    ...toMetadataCategoryQueryParts(category),
    ...toMetadataFlagQueryParts(
      ADVANCE_REQUESTED_METADATA_KEY,
      advanceRequested
    ),
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
  const {
    sinistro,
    status,
    contractor_id,
    category,
    advance_requested,
    only_mine,
    page,
  } = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const ownerId = only_mine === 'true' ? user.user_id : '';

  const data = await getData(
    sinistro || '',
    status,
    contractor_id,
    category,
    advance_requested,
    ownerId,
    user?.role,
    page || 1
  );

  return (
    <main className="flex h-full flex-col">
      {data && (
        <CasesTable cases={data} initialPage={page || 1} userRole={user.role} />
      )}
    </main>
  );
}
