import CasesTable from '../../components/cases/table';
import { CaseStatus } from '../../types/case';
import { CaseListItem } from '../../types/case-list-item';
import { Shell } from '../shell';

const cases: CaseListItem[] = Array.from({ length: 10 }, (_, index) => ({
  case_id: `case-${index}`,
  external_reference: `SIN-${1000 + index}`,
  status: CaseStatus.ONGOING,
  due_date: '2026-09-20T10:00:00Z',
  customer_first_name: 'João',
  customer_last_name: 'Silva',
  customer_city: 'São Paulo',
  contractor_company_name: 'Seguradora Exemplo',
  partner_id: 'partner-1',
  partner_first_name: 'Técnico Exemplo',
  category: 'Residencial',
}));

export default function Page() {
  return (
    <Shell>
      <CasesTable
        cases={{ result: cases, paging: { total: 42, limit: 10, offset: 0 } }}
        initialPage={1}
      />
    </Shell>
  );
}
