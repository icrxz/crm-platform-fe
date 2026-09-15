import CustomersTable from '../../components/customers/table';
import { CustomerListItem } from '../../types/customer-list-item';
import { Shell } from '../shell';

const customers: CustomerListItem[] = Array.from({ length: 10 }, (_, i) => ({
  customer_id: `customer-${i}`,
  first_name: 'João',
  last_name: 'Silva',
  email: 'joao.silva@example.com',
  document: '000.000.000-00',
  created_at: '2026-09-15T10:00:00Z',
  active: true,
}));

export default function Page() {
  return (
    <Shell>
      <CustomersTable
        customers={{
          result: customers,
          paging: { total: 42, limit: 10, offset: 0 },
        }}
        initialPage={1}
      />
    </Shell>
  );
}
