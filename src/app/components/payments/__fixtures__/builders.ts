import { Case, CaseFull } from '@/app/types/case';
import { Contractor } from '@/app/types/contractor';
import { Customer } from '@/app/types/customer';
import { Partner } from '@/app/types/partner';
import {
  Transaction,
  TransactionItem,
  TransactionStatus,
  TransactionType,
} from '@/app/types/transaction';
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
    customer_first_name: 'Maria',
    customer_last_name: 'Souza',
    partner_name: 'João Silva',
    partner_document: '123.456.789-00',
    partner_account: 'PIX: joao@email.com',
    mo: { transaction_id: 'tx-mo-1', value: 300 },
    transport: { transaction_id: 'tx-transport-1', value: 100 },
    parts: { transaction_id: 'tx-parts-1', value: 100 },
    ...overrides,
  };
}

export function buildCase(overrides: Partial<Case> = {}): Case {
  return {
    case_id: 'case-001',
    partner_id: 'partner-123',
    contractor_id: 'contractor-001',
    origin_channel: 'web',
    type: 'repair',
    priority: 'medium' as Case['priority'],
    status: 'Receipt' as Case['status'],
    created_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1',
    updated_at: '2024-01-15T00:00:00Z',
    updated_by: 'user-1',
    due_date: '2024-02-01T00:00:00Z',
    external_reference: 'SIN-001',
    ...overrides,
  };
}

export function buildCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    customer_id: 'customer-001',
    first_name: 'Maria',
    last_name: 'Souza',
    company_name: '',
    legal_name: '',
    document: '987.654.321-00',
    document_type: 'CPF',
    shipping: { city: 'São Paulo', state: 'SP' },
    billing: { city: 'São Paulo', state: 'SP' },
    created_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1',
    updated_at: '2024-01-01T00:00:00Z',
    updated_by: 'user-1',
    cases: [],
    active: true,
    ...overrides,
  };
}

export function buildContractor(
  overrides: Partial<Contractor> = {}
): Contractor {
  return {
    contractor_id: 'contractor-001',
    company_name: 'Seguradora ABC',
    legal_name: 'Seguradora ABC Ltda',
    document: '12.345.678/0001-90',
    created_by: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_by: 'user-1',
    updated_at: '2024-01-01T00:00:00Z',
    active: true,
    ...overrides,
  };
}

export function buildCaseFull(overrides: Partial<CaseFull> = {}): CaseFull {
  return {
    ...buildCase(overrides),
    customer: buildCustomer(),
    partner: buildPartner(),
    contractor: buildContractor(),
    ...overrides,
  };
}

export function buildTransaction(
  overrides: Partial<Transaction> = {}
): Transaction {
  return {
    transaction_id: 'tx-001',
    type: TransactionType.OUTGOING,
    value: 300,
    case_id: 'case-001',
    status: TransactionStatus.PENDING,
    attachment_id: '',
    created_by: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_by: 'user-1',
    updated_at: '2024-01-01T00:00:00Z',
    description: 'MO',
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
