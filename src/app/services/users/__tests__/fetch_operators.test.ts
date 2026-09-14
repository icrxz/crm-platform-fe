import { SearchResponse } from '@/app/types/search_response';
import { User, UserRole } from '@/app/types/user';

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: () => ({ value: 'test-jwt' }),
  }),
}));

jest.mock('../../cases', () => ({
  crmCoreEndpoint: 'https://api.test',
}));

import { fetchOperators } from '../fetch_operators';

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

function searchResponse<T>(result: T[], total?: number): SearchResponse<T> {
  return {
    result,
    paging: { total: total ?? result.length, limit: 500, offset: 0 },
  };
}

describe('fetchOperators', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('requests only active operators', async () => {
    const fetchMock = jest.fn(async (url: string | URL | Request) => ({
      ok: true,
      json: async () => searchResponse([]),
    }));
    global.fetch = fetchMock as unknown as typeof fetch;

    await fetchOperators();

    const urlStr = String(fetchMock.mock.calls[0][0]);
    expect(urlStr).toContain(`role=${UserRole.OPERATOR}`);
    expect(urlStr).toContain('active=true');
  });

  it('sorts users by created_at, breaking ties by user_id', async () => {
    const older = makeUser({
      user_id: 'user-b',
      created_at: '2026-01-01T00:00:00Z',
    });
    const newer = makeUser({
      user_id: 'user-a',
      created_at: '2026-02-01T00:00:00Z',
    });
    const tieA = makeUser({
      user_id: 'user-z',
      created_at: '2026-03-01T00:00:00Z',
    });
    const tieB = makeUser({
      user_id: 'user-y',
      created_at: '2026-03-01T00:00:00Z',
    });

    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => searchResponse([newer, tieA, older, tieB]),
    })) as unknown as typeof fetch;

    const result = await fetchOperators();

    expect(result.data!.map((u) => u.user_id)).toEqual([
      'user-b',
      'user-a',
      'user-y',
      'user-z',
    ]);
  });

  it('paginates through multiple pages of results', async () => {
    const page1 = [makeUser({ user_id: 'user-1' })];
    const page2 = [makeUser({ user_id: 'user-2' })];

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

    const result = await fetchOperators();

    expect(result.data).toHaveLength(2);
  });

  it('stops paginating when a page request fails', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      json: async () => searchResponse([]),
    })) as unknown as typeof fetch;

    const result = await fetchOperators();

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('returns a failure response when the request throws', async () => {
    global.fetch = jest.fn(() => {
      throw new Error('network error');
    }) as unknown as typeof fetch;

    const result = await fetchOperators();

    expect(result.success).toBe(false);
  });
});
