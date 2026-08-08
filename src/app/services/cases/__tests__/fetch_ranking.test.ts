import { SearchResponse } from '@/app/types/search_response';
import { Case, CaseStatus } from '@/app/types/case';
import { User, UserRole } from '@/app/types/user';

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: () => ({ value: 'test-jwt' }),
  }),
}));

jest.mock('../index', () => ({
  crmCoreEndpoint: 'https://api.test',
  crmCoreApiKey: 'test-key',
}));

import { fetchRankingData } from '../fetch_ranking';

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

function makeUser(overrides: Partial<User>): User {
  return {
    user_id: 'user-1',
    username: 'user1',
    first_name: 'First',
    last_name: 'Last',
    email: 'user@test.com',
    role: UserRole.OPERATOR,
    region: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'someone',
    updated_by: 'someone',
    active: true,
    last_absence_at: null,
    ...overrides,
  };
}

function searchResponse<T>(result: T[]): SearchResponse<T> {
  return { result, paging: { total: result.length, limit: 500, offset: 0 } };
}

describe('fetchRankingData', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('requests users filtered by operator role and active status', async () => {
    const fetchMock = jest.fn(async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.includes('/cases?') && !urlStr.includes('status=Closed')) {
        return {
          ok: true,
          json: async () =>
            searchResponse([makeCase({ owner_id: 'operator-active' })]),
        } as Response;
      }
      return { ok: true, json: async () => searchResponse([]) } as Response;
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await fetchRankingData();

    const usersCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes('/users?')
    );
    expect(usersCall).toBeDefined();
    const usersUrl = String(usersCall![0]);
    expect(usersUrl).toContain(`role=${UserRole.OPERATOR}`);
    expect(usersUrl).toContain('active=true');
  });

  it('excludes cases owned by users not returned by the filtered users lookup', async () => {
    const activeOperator = makeUser({
      user_id: 'operator-active',
      first_name: 'Ana',
      last_name: 'Silva',
    });

    const inProgressCases = [
      makeCase({ case_id: 'case-1', owner_id: 'operator-active' }),
      makeCase({ case_id: 'case-2', owner_id: 'inactive-or-non-operator' }),
    ];

    global.fetch = jest.fn(async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.includes('/cases?status=Closed')) {
        return { ok: true, json: async () => searchResponse([]) } as Response;
      }
      if (urlStr.includes('/cases?')) {
        return {
          ok: true,
          json: async () => searchResponse(inProgressCases),
        } as Response;
      }
      if (urlStr.includes('/users?')) {
        // Backend only returns the active operator; the other owner_id
        // is filtered out server-side (inactive or non-operator).
        return {
          ok: true,
          json: async () => searchResponse([activeOperator]),
        } as Response;
      }
      throw new Error(`unexpected fetch url: ${urlStr}`);
    }) as unknown as typeof fetch;

    const result = await fetchRankingData();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data![0].name).toBe('Ana Silva');
  });

  it('only counts Payment/Receipt cases updated in the current month as finalized', async () => {
    const activeOperator = makeUser({
      user_id: 'operator-active',
      first_name: 'Ana',
      last_name: 'Silva',
    });

    const lastMonth = new Date();
    lastMonth.setUTCMonth(lastMonth.getUTCMonth() - 1);

    const finalizedOpenCases = [
      makeCase({
        case_id: 'payment-this-month',
        owner_id: 'operator-active',
        status: CaseStatus.PAYMENT,
        type: 'inspection',
        updated_at: new Date().toISOString(),
      }),
      makeCase({
        case_id: 'receipt-last-month',
        owner_id: 'operator-active',
        status: CaseStatus.RECEIPT,
        type: 'repair',
        updated_at: lastMonth.toISOString(),
      }),
    ];

    global.fetch = jest.fn(async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.includes('status=Closed')) {
        return { ok: true, json: async () => searchResponse([]) } as Response;
      }
      if (urlStr.includes(`status=${CaseStatus.PAYMENT}`)) {
        return {
          ok: true,
          json: async () => searchResponse(finalizedOpenCases),
        } as Response;
      }
      if (urlStr.includes('/cases?')) {
        return { ok: true, json: async () => searchResponse([]) } as Response;
      }
      if (urlStr.includes('/users?')) {
        return {
          ok: true,
          json: async () => searchResponse([activeOperator]),
        } as Response;
      }
      throw new Error(`unexpected fetch url: ${urlStr}`);
    }) as unknown as typeof fetch;

    const result = await fetchRankingData();

    expect(result.success).toBe(true);
    expect(result.data![0].finalized).toEqual({ vistoria: 1, reparo: 0 });
  });

  it('buckets in-progress cases into yellow (6-10d) and red (>10d) by age', async () => {
    const activeOperator = makeUser({
      user_id: 'operator-active',
      first_name: 'Ana',
      last_name: 'Silva',
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const inProgressCases = [
      makeCase({
        case_id: 'yellow-case',
        owner_id: 'operator-active',
        created_at: sevenDaysAgo.toISOString(),
      }),
      makeCase({
        case_id: 'red-case',
        owner_id: 'operator-active',
        created_at: fifteenDaysAgo.toISOString(),
      }),
    ];

    global.fetch = jest.fn(async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.includes('status=Closed')) {
        return { ok: true, json: async () => searchResponse([]) } as Response;
      }
      if (urlStr.includes(`status=${CaseStatus.PAYMENT}`)) {
        return { ok: true, json: async () => searchResponse([]) } as Response;
      }
      if (urlStr.includes('/cases?')) {
        return {
          ok: true,
          json: async () => searchResponse(inProgressCases),
        } as Response;
      }
      if (urlStr.includes('/users?')) {
        return {
          ok: true,
          json: async () => searchResponse([activeOperator]),
        } as Response;
      }
      throw new Error(`unexpected fetch url: ${urlStr}`);
    }) as unknown as typeof fetch;

    const result = await fetchRankingData();

    expect(result.data![0].inProgress).toEqual({ green: 0, yellow: 1, red: 1 });
  });

  it('counts finalized repair cases and sorts agents by finalized then in-progress totals', async () => {
    const topAgent = makeUser({
      user_id: 'top-agent',
      first_name: 'Bruno',
      last_name: 'Costa',
    });
    const otherAgent = makeUser({
      user_id: 'other-agent',
      first_name: 'Ana',
      last_name: 'Silva',
    });

    const closedCases = [
      makeCase({
        case_id: 'closed-repair-1',
        owner_id: 'top-agent',
        status: CaseStatus.CLOSED,
        type: 'repair',
      }),
      makeCase({
        case_id: 'closed-repair-2',
        owner_id: 'top-agent',
        status: CaseStatus.CLOSED,
        type: 'repair',
      }),
      makeCase({
        case_id: 'closed-other',
        owner_id: 'other-agent',
        status: CaseStatus.CLOSED,
        type: 'repair',
      }),
    ];

    global.fetch = jest.fn(async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.includes('status=Closed')) {
        return {
          ok: true,
          json: async () => searchResponse(closedCases),
        } as Response;
      }
      if (urlStr.includes(`status=${CaseStatus.PAYMENT}`)) {
        return { ok: true, json: async () => searchResponse([]) } as Response;
      }
      if (urlStr.includes('/cases?')) {
        return { ok: true, json: async () => searchResponse([]) } as Response;
      }
      if (urlStr.includes('/users?')) {
        return {
          ok: true,
          json: async () => searchResponse([topAgent, otherAgent]),
        } as Response;
      }
      throw new Error(`unexpected fetch url: ${urlStr}`);
    }) as unknown as typeof fetch;

    const result = await fetchRankingData();

    expect(result.data![0].name).toBe('Bruno Costa');
    expect(result.data![0].finalized).toEqual({ vistoria: 0, reparo: 2 });
    expect(result.data![1].finalized).toEqual({ vistoria: 0, reparo: 1 });
  });

  it('paginates through multiple pages of results', async () => {
    const activeOperator = makeUser({
      user_id: 'operator-active',
      first_name: 'Ana',
      last_name: 'Silva',
    });

    const page1 = Array.from({ length: 2 }, (_, i) =>
      makeCase({ case_id: `case-${i}`, owner_id: 'operator-active' })
    );

    global.fetch = jest.fn(async (url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.includes('status=Closed')) {
        return { ok: true, json: async () => searchResponse([]) } as Response;
      }
      if (urlStr.includes(`status=${CaseStatus.PAYMENT}`)) {
        return { ok: true, json: async () => searchResponse([]) } as Response;
      }
      if (urlStr.includes('/cases?')) {
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
            result: [
              makeCase({ case_id: 'case-2', owner_id: 'operator-active' }),
            ],
            paging: { total: 501, limit: 500, offset: 500 },
          }),
        } as Response;
      }
      if (urlStr.includes('/users?')) {
        return {
          ok: true,
          json: async () => searchResponse([activeOperator]),
        } as Response;
      }
      throw new Error(`unexpected fetch url: ${urlStr}`);
    }) as unknown as typeof fetch;

    const result = await fetchRankingData();

    const totalInProgress = result.data![0].inProgress;
    expect(
      totalInProgress.green + totalInProgress.yellow + totalInProgress.red
    ).toBe(3);
  });

  it('returns a failure response when the request throws', async () => {
    global.fetch = jest.fn(() => {
      throw new Error('network error');
    }) as unknown as typeof fetch;

    const result = await fetchRankingData();

    expect(result.success).toBe(false);
  });
});
