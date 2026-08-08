import { SearchResponse } from '@/app/types/search_response';
import { Case, CaseStatus } from '@/app/types/case';
import { Contractor } from '@/app/types/contractor';

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: () => ({ value: 'test-jwt' }),
  }),
}));

jest.mock('../index', () => ({
  crmCoreEndpoint: 'https://api.test',
  crmCoreApiKey: 'test-key',
}));

import { fetchDailyEntries } from '../fetch_daily_entries';

function makeCase(overrides: Partial<Case>): Case {
  return {
    case_id: 'case-1',
    contractor_id: 'contractor-1',
    origin_channel: 'web',
    type: 'inspection',
    priority: 'Low' as Case['priority'],
    status: CaseStatus.NEW,
    created_at: new Date().toISOString(),
    created_by: 'someone',
    updated_at: new Date().toISOString(),
    updated_by: 'someone',
    due_date: new Date().toISOString(),
    external_reference: 'ref-1',
    ...overrides,
  };
}

function makeContractor(overrides: Partial<Contractor>): Contractor {
  return {
    contractor_id: 'contractor-1',
    company_name: 'Seguradora A',
    legal_name: 'Seguradora A LTDA',
    document: '00000000000000',
    created_by: 'someone',
    created_at: new Date().toISOString(),
    updated_by: 'someone',
    updated_at: new Date().toISOString(),
    active: true,
    ...overrides,
  };
}

function searchResponse<T>(result: T[]): SearchResponse<T> {
  return { result, paging: { total: result.length, limit: 500, offset: 0 } };
}

describe('fetchDailyEntries', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('builds one entry per day of the current month with zeroed counts', async () => {
    global.fetch = jest.fn(async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.includes('/contractors')) {
        return { ok: true, json: async () => searchResponse([]) } as Response;
      }
      return { ok: true, json: async () => searchResponse([]) } as Response;
    }) as unknown as typeof fetch;

    const result = await fetchDailyEntries();

    expect(result.success).toBe(true);
    const now = new Date();
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();
    expect(result.data!.data).toHaveLength(daysInMonth);
    expect(result.data!.contractors).toEqual([]);
  });

  it('aggregates case counts by day and contractor name', async () => {
    const contractor = makeContractor({
      contractor_id: 'contractor-1',
      company_name: 'Seguradora A',
    });

    const day5 = new Date();
    day5.setUTCDate(5);

    const cases = [
      makeCase({
        case_id: 'c1',
        contractor_id: 'contractor-1',
        created_at: day5.toISOString(),
      }),
      makeCase({
        case_id: 'c2',
        contractor_id: 'contractor-1',
        created_at: day5.toISOString(),
      }),
    ];

    global.fetch = jest.fn(async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.includes('/contractors')) {
        return {
          ok: true,
          json: async () => searchResponse([contractor]),
        } as Response;
      }
      return { ok: true, json: async () => searchResponse(cases) } as Response;
    }) as unknown as typeof fetch;

    const result = await fetchDailyEntries();

    expect(result.success).toBe(true);
    expect(result.data!.contractors).toEqual(['Seguradora A']);
    expect(result.data!.data[4]['Seguradora A']).toBe(2);
    expect(result.data!.data[0]['Seguradora A']).toBe(0);
  });

  it('ignores cases whose contractor is not found', async () => {
    global.fetch = jest.fn(async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.includes('/contractors')) {
        return { ok: true, json: async () => searchResponse([]) } as Response;
      }
      return {
        ok: true,
        json: async () =>
          searchResponse([makeCase({ contractor_id: 'unknown-contractor' })]),
      } as Response;
    }) as unknown as typeof fetch;

    const result = await fetchDailyEntries();

    expect(result.success).toBe(true);
    expect(result.data!.contractors).toEqual([]);
  });

  it('returns a failure response when the request throws', async () => {
    global.fetch = jest.fn(() => {
      throw new Error('network error');
    }) as unknown as typeof fetch;

    const result = await fetchDailyEntries();

    expect(result.success).toBe(false);
  });
});
