import { SearchResponse } from '@/app/types/search_response';
import { Case, CaseStatus } from '@/app/types/case';

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: () => ({ value: 'test-jwt' }),
  }),
}));

jest.mock('../index', () => ({
  crmCoreEndpoint: 'https://api.test',
  crmCoreApiKey: 'test-key',
}));

import { fetchDashboardKpis } from '../fetch_dashboard_kpis';

function makeCase(overrides: Partial<Case>): Case {
  return {
    case_id: 'case-1',
    contractor_id: 'contractor-1',
    origin_channel: 'web',
    type: 'inspection',
    priority: 'Low' as Case['priority'],
    status: CaseStatus.CLOSED,
    created_at: new Date().toISOString(),
    created_by: 'someone',
    updated_at: new Date().toISOString(),
    updated_by: 'someone',
    due_date: new Date().toISOString(),
    external_reference: 'ref-1',
    ...overrides,
  };
}

function searchResponse<T>(result: T[], total?: number): SearchResponse<T> {
  return {
    result,
    paging: { total: total ?? result.length, limit: 500, offset: 0 },
  };
}

describe('fetchDashboardKpis', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('builds a 6-month closed history from the count-only requests', async () => {
    global.fetch = jest.fn(async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.includes('limit=1')) {
        return {
          ok: true,
          json: async () => searchResponse([], 7),
        } as Response;
      }
      return { ok: true, json: async () => searchResponse([]) } as Response;
    }) as unknown as typeof fetch;

    const result = await fetchDashboardKpis();

    expect(result.success).toBe(true);
    expect(result.data!.closedHistory).toHaveLength(6);
    expect(result.data!.closedHistory.every((m) => m.count === 7)).toBe(true);
  });

  it('computes SLA percentage from cases closed on or before their target date', async () => {
    const compliant = makeCase({
      case_id: 'c1',
      target_date: '2026-08-10T00:00:00Z',
      closed_at: '2026-08-05T00:00:00Z',
    });
    const late = makeCase({
      case_id: 'c2',
      target_date: '2026-08-10T00:00:00Z',
      closed_at: '2026-08-15T00:00:00Z',
    });
    const noDates = makeCase({
      case_id: 'c3',
      target_date: undefined,
      closed_at: undefined,
    });

    global.fetch = jest.fn(async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.includes('limit=1')) {
        return {
          ok: true,
          json: async () => searchResponse([], 0),
        } as Response;
      }
      return {
        ok: true,
        json: async () => searchResponse([compliant, late, noDates]),
      } as Response;
    }) as unknown as typeof fetch;

    const result = await fetchDashboardKpis();

    expect(result.success).toBe(true);
    expect(result.data!.slaPercentage).toBe(50);
    expect(result.data!.slaGoal).toBe(90);
  });

  it('returns 0% SLA when there are no cases with both dates', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => searchResponse([]),
    })) as unknown as typeof fetch;

    const result = await fetchDashboardKpis();

    expect(result.data!.slaPercentage).toBe(0);
  });

  it('returns a failure response when the request throws', async () => {
    global.fetch = jest.fn(() => {
      throw new Error('network error');
    }) as unknown as typeof fetch;

    const result = await fetchDashboardKpis();

    expect(result.success).toBe(false);
  });
});
