import PartnersTable from '../../components/partners/table';
import { PartnerListItem } from '../../types/partner-list-item';
import { Shell } from '../shell';

const partners: PartnerListItem[] = Array.from({ length: 10 }, (_, i) => ({
  partner_id: `partner-${i}`,
  first_name: 'Carlos',
  last_name: 'Eduardo Pereira',
  partner_type: 'Técnico',
  document: '000.000.000-00',
  city: 'São Paulo',
  state: 'SP',
  active: true,
}));

export default function Page() {
  return (
    <Shell>
      <PartnersTable
        partners={{
          result: partners,
          paging: { total: 42, limit: 10, offset: 0 },
        }}
        initialPage={1}
      />
    </Shell>
  );
}
