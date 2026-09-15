import PaymentTable from '../../components/payments/table';
import { TransactionItem, TransactionStatus } from '../../types/transaction';
import { Shell } from '../shell';

const transactions: TransactionItem[] = Array.from({ length: 10 }, (_, i) => ({
  case_id: `case-${i}`,
  external_reference: `SIN-${1000 + i}`,
  total: 1170,
  status: TransactionStatus.PENDING,
  created_at: '2026-09-15T10:00:00Z',
  customer_first_name: 'João',
  customer_last_name: 'Silva',
  partner_id: 'partner-1',
  partner_name: 'Carlos Eduardo Pereira',
  partner_document: '000.000.000-00',
  partner_account: 'carlos.pereira@pix.com.br',
  mo: { transaction_id: `mo-${i}`, value: 800 },
  transport: { transaction_id: `t-${i}`, value: 150 },
  parts: { transaction_id: `p-${i}`, value: 220 },
}));

export default function Page() {
  return (
    <Shell>
      <PaymentTable
        transactions={{
          result: transactions,
          paging: { total: 42, limit: 10, offset: 0 },
        }}
        initialPage={1}
      />
    </Shell>
  );
}
