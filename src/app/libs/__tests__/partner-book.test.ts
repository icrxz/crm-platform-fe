import { toPartnerBookCaseItem } from '../partner-book';
import { buildCaseFull } from '../../components/panel/__fixtures__/builders';
import { CaseStatus } from '../../types/case';
import { TransactionStatus, TransactionType } from '../../types/transaction';

describe('toPartnerBookCaseItem', () => {
  it('sums the technician outgoing transactions into payment_total', () => {
    const crmCase = buildCaseFull({
      transactions: [
        {
          transaction_id: 't1',
          type: TransactionType.OUTGOING,
          description: 'MO',
          value: 200,
          status: TransactionStatus.PENDING,
        },
        {
          transaction_id: 't2',
          type: TransactionType.OUTGOING,
          description: 'Deslocamento Técnico',
          value: 20,
          status: TransactionStatus.PENDING,
        },
        {
          transaction_id: 't3',
          type: TransactionType.OUTGOING,
          description: 'Peças técnico',
          value: 10,
          status: TransactionStatus.PENDING,
        },
      ] as never,
    });

    const result = toPartnerBookCaseItem(crmCase);

    expect(result.payment_total).toBe(230);
  });

  it('ignores incoming (seguradora) transactions', () => {
    const crmCase = buildCaseFull({
      status: CaseStatus.PAYMENT,
      transactions: [
        {
          transaction_id: 't1',
          type: TransactionType.INCOMING,
          description: 'Cobrado seguradora',
          value: 500,
          status: TransactionStatus.APPROVED,
        },
      ] as never,
    });

    const result = toPartnerBookCaseItem(crmCase);

    expect(result.payment_total).toBe(0);
    expect(result.payment_status).toBe('pending');
  });

  it('marks as paid only when all technician transactions are approved, using the case closed_at as paid_at', () => {
    const crmCase = buildCaseFull({
      closed_at: '2024-05-05T10:00:00Z',
      transactions: [
        {
          transaction_id: 't1',
          type: TransactionType.OUTGOING,
          description: 'MO',
          value: 200,
          status: TransactionStatus.APPROVED,
        },
        {
          transaction_id: 't2',
          type: TransactionType.OUTGOING,
          description: 'Deslocamento Técnico',
          value: 20,
          status: TransactionStatus.APPROVED,
        },
      ] as never,
    });

    const result = toPartnerBookCaseItem(crmCase);

    expect(result.payment_status).toBe('paid');
    expect(result.paid_at).toBe('2024-05-05T10:00:00Z');
  });

  it('marks as pending when at least one technician transaction is not approved', () => {
    const crmCase = buildCaseFull({
      status: CaseStatus.PAYMENT,
      transactions: [
        {
          transaction_id: 't1',
          type: TransactionType.OUTGOING,
          description: 'MO',
          value: 200,
          status: TransactionStatus.APPROVED,
          updated_at: '2024-05-01T10:00:00Z',
        },
        {
          transaction_id: 't2',
          type: TransactionType.OUTGOING,
          description: 'Peças técnico',
          value: 10,
          status: TransactionStatus.PENDING,
        },
      ] as never,
    });

    const result = toPartnerBookCaseItem(crmCase);

    expect(result.payment_status).toBe('pending');
    expect(result.paid_at).toBeUndefined();
  });

  it('marks as pending with zero total when there are no technician transactions', () => {
    const crmCase = buildCaseFull({
      status: CaseStatus.PAYMENT,
      transactions: [],
    });

    const result = toPartnerBookCaseItem(crmCase);

    expect(result.payment_status).toBe('pending');
    expect(result.payment_total).toBe(0);
    expect(result.paid_at).toBeUndefined();
  });

  it('marks as paid when the case is closed even if the transaction status was never promoted (legacy cases)', () => {
    const crmCase = buildCaseFull({
      status: CaseStatus.CLOSED,
      transactions: [
        {
          transaction_id: 't1',
          type: TransactionType.OUTGOING,
          description: 'MO',
          value: 200,
          status: TransactionStatus.PENDING,
        },
      ] as never,
    });

    const result = toPartnerBookCaseItem(crmCase);

    expect(result.payment_status).toBe('paid');
  });

  it('flattens customer fields from the nested customer object', () => {
    const crmCase = buildCaseFull();

    const result = toPartnerBookCaseItem(crmCase);

    expect(result.customer_first_name).toBe(crmCase.customer?.first_name);
    expect(result.customer_last_name).toBe(crmCase.customer?.last_name);
    expect(result.customer_city).toBe(crmCase.customer?.shipping?.city);
    expect(result.customer_document).toBe(crmCase.customer?.document);
  });
});
