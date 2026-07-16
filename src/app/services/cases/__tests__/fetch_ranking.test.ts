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
});
