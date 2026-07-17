import { CaseListItem } from '@/app/types/case-list-item';
import { CaseStatus } from '@/app/types/case';
import { Contractor } from '@/app/types/contractor';
import { SearchResponse } from '@/app/types/search_response';

export function buildCaseListItem(
  overrides: Partial<CaseListItem> = {}
): CaseListItem {
  return {
    case_id: 'case-001',
    external_reference: 'SIN-001',
    status: CaseStatus.NEW,
    due_date: '2024-02-01T00:00:00Z',
    customer_first_name: 'João',
    customer_last_name: 'Silva',
    customer_city: 'São Paulo',
    contractor_company_name: 'Seguradora ABC',
    partner_first_name: 'Maria',
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
