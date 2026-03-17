import { Partner } from '@/app/types/partner';
import { TransactionItem, TransactionStatus } from '@/app/types/transaction';
import { SearchResponse } from '@/app/types/search_response';

export function buildPartner(overrides: Partial<Partner> = {}): Partner {
  return {
    partner_id: 'partner-123',
    first_name: 'João',
    last_name: 'Silva',
    company_name: '',
    legal_name: '',
    document: '123.456.789-00',
    document_type: 'CPF',
    partner_type: 'PF',
    shipping: { city: 'São Paulo', state: 'SP' },
    billing: { city: 'São Paulo', state: 'SP' },
    personal_contact: { email: 'joao@email.com' },
    business_contact: { email: '' },
    region: 1,
    created_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1',
    updated_at: '2024-01-01T00:00:00Z',
    updated_by: 'user-1',
    active: true,
    description: '',
    ...overrides,
  };
}

export function buildTransactionItem(
  overrides: Partial<TransactionItem> = {}
): TransactionItem {
  return {
    case_id: 'case-001',
    external_reference: 'SIN-001',
    total: 500,
    status: TransactionStatus.PENDING,
    created_at: '2024-01-01T00:00:00Z',
    partner_name: 'João Silva',
    partner_document: '123.456.789-00',
    partner_account: 'PIX: joao@email.com',
    mo: { transaction_id: 'tx-mo-1', value: 300 },
    transport: { transaction_id: 'tx-transport-1', value: 100 },
    parts: { transaction_id: 'tx-parts-1', value: 100 },
    ...overrides,
  };
}

export function buildSearchResponse<T>(
  result: T[],
  overrides: Partial<SearchResponse<T>['paging']> = {}
): SearchResponse<T> {
  return {
    result,
    paging: {
      total: result.length,
      limit: 10,
      offset: 0,
      ...overrides,
    },
  };
}
