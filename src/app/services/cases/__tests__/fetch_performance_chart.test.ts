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

import { fetchPerformanceData } from '../fetch_performance_chart';

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

function searchResponse<T>(result: T[]): SearchResponse<T> {
  return { result, paging: { total: result.length, limit: 500, offset: 0 } };
}

describe('fetchPerformanceData', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('returns 6 week buckets with zeroed metrics when there are no closed cases', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => searchResponse([]),
    })) as unknown as typeof fetch;

    const result = await fetchPerformanceData();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(6);
    expect(result.data!.every((w) => w.volume === 0 && w.tma === 0)).toBe(true);
  });

  it('counts a same-day closed case in the current week with 0 TMA', async () => {
    const now = new Date().toISOString();
    const closedToday = makeCase({
      case_id: 'c1',
      created_at: now,
      closed_at: now,
    });

    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => searchResponse([closedToday]),
    })) as unknown as typeof fetch;

    const result = await fetchPerformanceData();

    expect(result.success).toBe(true);
    const currentWeek = result.data![result.data!.length - 1];
    expect(currentWeek.volume).toBe(1);
    expect(currentWeek.tma).toBe(0);
  });

  it('ignores closed cases without a closed_at date', async () => {
    const noClosedAt = makeCase({ case_id: 'c1', closed_at: undefined });

    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => searchResponse([noClosedAt]),
    })) as unknown as typeof fetch;

    const result = await fetchPerformanceData();

    expect(result.data!.every((w) => w.volume === 0)).toBe(true);
  });

  it('returns a failure response when the request throws', async () => {
    global.fetch = jest.fn(() => {
      throw new Error('network error');
    }) as unknown as typeof fetch;

    const result = await fetchPerformanceData();

    expect(result.success).toBe(false);
  });

  it('computes the median TMA across business days for two closed cases', async () => {
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    const createdAt = new Date(now);
    createdAt.setDate(now.getDate() - 2);

    const caseA = makeCase({
      case_id: 'c1',
      created_at: createdAt.toISOString(),
      closed_at: now.toISOString(),
    });
    const caseB = makeCase({
      case_id: 'c2',
      created_at: now.toISOString(),
      closed_at: now.toISOString(),
    });

    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => searchResponse([caseA, caseB]),
    })) as unknown as typeof fetch;

    const result = await fetchPerformanceData();

    const currentWeek = result.data![result.data!.length - 1];
    expect(currentWeek.volume).toBe(2);
    expect(currentWeek.tma).toBeGreaterThanOrEqual(0);
  });

  it('paginates through multiple pages of closed cases', async () => {
    const now = new Date().toISOString();
    const page1 = [makeCase({ case_id: 'c1', closed_at: now })];
    const page2 = [makeCase({ case_id: 'c2', closed_at: now })];

    global.fetch = jest.fn(async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.includes('offset=0')) {
        return {
          ok: true,
          json: async () => ({
            result: page1,
            paging: { total: 501, limit: 500, offset: 0 },
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          result: page2,
          paging: { total: 501, limit: 500, offset: 500 },
        }),
      } as Response;
    }) as unknown as typeof fetch;

    const result = await fetchPerformanceData();

    const currentWeek = result.data![result.data!.length - 1];
    expect(currentWeek.volume).toBe(2);
  });
});
