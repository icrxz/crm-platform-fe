import { CaseFull, CaseStatus } from '@/app/types/case';
import { Contractor } from '@/app/types/contractor';
import { Customer } from '@/app/types/customer';
import { Partner } from '@/app/types/partner';
import { SearchResponse } from '@/app/types/search_response';

export function buildCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    customer_id: 'customer-001',
    first_name: 'Maria',
    last_name: 'Santos',
    company_name: '',
    legal_name: '',
    document: '111.222.333-44',
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
    case_id: 'case-001',
    partner_id: 'partner-123',
    contractor_id: 'contractor-001',
    origin_channel: 'web',
    type: 'repair',
    priority: 'Medium' as CaseFull['priority'],
    status: CaseStatus.CLOSED,
    created_at: '2024-03-15T10:00:00Z',
    created_by: 'user-1',
    updated_at: '2024-03-15T10:00:00Z',
    updated_by: 'user-1',
    due_date: '2024-04-01T00:00:00Z',
    external_reference: 'SIN-001',
    customer: buildCustomer(),
    contractor: buildContractor(),
    partner: buildPartner(),
    transactions: [],
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
