import ContractorsTable from '../../components/contractors/table';
import { ContractorListItem } from '../../types/contractor-list-item';
import { Shell } from '../shell';

const contractors: ContractorListItem[] = Array.from(
  { length: 10 },
  (_, i) => ({
    contractor_id: `contractor-${i}`,
    company_name: 'Seguradora Nacional',
    legal_name: 'Seguradora Nacional S.A.',
    document: '00.000.000/0001-00',
    created_at: '2026-09-15T10:00:00Z',
    active: true,
  })
);

export default function Page() {
  return (
    <Shell>
      <ContractorsTable
        contractors={{
          result: contractors,
          paging: { total: 42, limit: 10, offset: 0 },
        }}
        initialPage={1}
      />
    </Shell>
  );
}
