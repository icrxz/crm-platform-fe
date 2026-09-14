import { CaseFull, CaseStatus } from '@/app/types/case';
import { PartnerBookCaseItem } from '@/app/types/partner-book-item';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@/app/types/transaction';

const PARTNER_PAYMENT_DESCRIPTIONS = [
  'MO',
  'Deslocamento Técnico',
  'Peças técnico',
];

function getPartnerTransactions(transactions?: Transaction[]): Transaction[] {
  return (transactions || []).filter(
    (t) =>
      t.type === TransactionType.OUTGOING &&
      t.description &&
      PARTNER_PAYMENT_DESCRIPTIONS.includes(t.description)
  );
}

export function toPartnerBookCaseItem(crmCase: CaseFull): PartnerBookCaseItem {
  const partnerTransactions = getPartnerTransactions(crmCase.transactions);

  const payment_total = partnerTransactions.reduce(
    (sum, t) => sum + t.value,
    0
  );

  // Fallback for cases closed before the backend started auto-approving
  // technician payments on close: those transactions stay stuck as
  // "pending" forever, so trust the case status too, not just the
  // transaction status.
  const isPaid =
    crmCase.status === CaseStatus.CLOSED ||
    (partnerTransactions.length > 0 &&
      partnerTransactions.every(
        (t) => t.status === TransactionStatus.APPROVED
      ));

  const paid_at = isPaid
    ? partnerTransactions
        .map((t) => t.updated_at)
        .sort()
        .at(-1)
    : undefined;

  return {
    case_id: crmCase.case_id,
    created_at: crmCase.created_at,
    type: crmCase.type,
    external_reference: crmCase.external_reference,
    customer_document: crmCase.customer?.document,
    customer_first_name: crmCase.customer?.first_name,
    customer_last_name: crmCase.customer?.last_name,
    customer_city: crmCase.customer?.shipping?.city,
    payment_total,
    payment_status: isPaid ? 'paid' : 'pending',
    paid_at,
  };
}
