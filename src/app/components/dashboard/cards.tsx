import {
  ArrowUpCircleIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { fetchCases } from '@/app/services/cases';
import { CaseStatus } from '@/app/types/case';
import {
  defaultCaseStatuses,
  operatorVisibleOpenCaseStatuses,
  unassignedCaseStatuses,
} from '@/app/utils/case_status';
import { ADVANCE_REQUESTED_METADATA_KEY } from '@/app/utils/case_metadata';
import { adminRoles } from '@/app/utils/roles';
import { UserRole } from '@/app/types/user';
import { StatCard } from './stat-card';

interface CardWrapperProps {
  user: { user_id: string; role: UserRole };
}

function statusQuery(statuses: CaseStatus[]): string {
  return statuses.map((status) => `status=${status}`).join('&');
}

async function countCases(query: string): Promise<number> {
  const resp = await fetchCases(query, 1, 1);
  return resp.data?.paging.total ?? 0;
}

export default async function CardWrapper({ user }: CardWrapperProps) {
  const isAdmin = adminRoles.includes(user.role);

  if (isAdmin) {
    const unassignedQuery = statusQuery(unassignedCaseStatuses);
    const openStatusQuery = statusQuery(defaultCaseStatuses);
    const pendingAdvanceQuery = `${openStatusQuery}&metadata[${ADVANCE_REQUESTED_METADATA_KEY}]=true`;

    const [
      unassigned,
      pendingReport,
      pendingPayment,
      pendingReceipt,
      pendingAdvance,
    ] = await Promise.all([
      countCases(unassignedQuery),
      countCases(`status=${CaseStatus.REPORT}`),
      countCases(`status=${CaseStatus.PAYMENT}`),
      countCases(`status=${CaseStatus.RECEIPT}`),
      countCases(pendingAdvanceQuery),
    ]);

    return (
      <>
        <StatCard
          title="Casos sem responsável"
          value={unassigned}
          href={`/cases?${unassignedQuery}`}
          icon={ClipboardDocumentListIcon}
        />
        <StatCard
          title="Pendente Laudo"
          value={pendingReport}
          href={`/cases?status=${CaseStatus.REPORT}`}
          icon={DocumentTextIcon}
        />
        <StatCard
          title="Pendente Adiantamento"
          value={pendingAdvance}
          href={`/cases?${openStatusQuery}&advance_requested=true`}
          icon={ArrowUpCircleIcon}
        />
        <StatCard
          title="Pendente Pagamento"
          value={pendingPayment}
          href={`/cases?status=${CaseStatus.PAYMENT}`}
          icon={BanknotesIcon}
        />
        <StatCard
          title="Pendente Comprovante"
          value={pendingReceipt}
          href="/payments"
          icon={DocumentArrowUpIcon}
        />
      </>
    );
  }

  const unassignedQuery = statusQuery(unassignedCaseStatuses);
  const mineQuery = `${statusQuery(operatorVisibleOpenCaseStatuses)}&owner_id=${user.user_id}`;

  const [unassigned, mine] = await Promise.all([
    countCases(unassignedQuery),
    countCases(mineQuery),
  ]);

  return (
    <>
      <StatCard
        title="Casos sem responsável"
        value={unassigned}
        href={`/cases?${unassignedQuery}`}
        icon={ClipboardDocumentListIcon}
      />
      <StatCard
        title="Meus casos pendentes"
        value={mine}
        href="/cases?only_mine=true"
        icon={UserIcon}
      />
    </>
  );
}
