jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: () => ({ value: 'test-jwt' }),
  }),
}));

jest.mock('../index', () => ({
  crmCoreEndpoint: 'https://api.test',
  crmCoreApiKey: 'test-key',
}));

import { changePassword } from '../change_password';

describe('changePassword', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('should return an error when userID is empty', async () => {
    const result = await changePassword('', {
      old_password: 'old',
      new_password: 'new',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('ID do usuário não informado');
  });

  it('should call the password endpoint with the JWT and payload', async () => {
    const fetchMock = jest.fn(async () => ({ ok: true }) as Response);
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await changePassword('user-1', {
      old_password: 'oldPass123!',
      new_password: 'newPass123!',
    });

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.test/crm/core/api/v1/users/user-1/password',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-jwt',
          'X-API-Key': 'test-key',
        }),
        body: JSON.stringify({
          old_password: 'oldPass123!',
          new_password: 'newPass123!',
        }),
      })
    );
  });

  it('should return the API error message when the current password is wrong', async () => {
    const fetchMock = jest.fn(
      async () =>
        ({
          ok: false,
          status: 400,
          json: async () => ({ message: 'old_password is incorrect' }),
        }) as unknown as Response
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await changePassword('user-1', {
      old_password: 'wrong',
      new_password: 'newPass123!',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('old_password is incorrect');
    expect(result.unauthorized).toBe(false);
  });

  it('should flag unauthorized on a 401 response', async () => {
    const fetchMock = jest.fn(
      async () =>
        ({
          ok: false,
          status: 401,
          json: async () => ({ error: 'invalid authentication token' }),
        }) as unknown as Response
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await changePassword('user-1', {
      old_password: 'old',
      new_password: 'newPass123!',
    });

    expect(result.success).toBe(false);
    expect(result.unauthorized).toBe(true);
    expect(result.message).toBe('invalid authentication token');
  });

  it('should return a generic error message when the request throws', async () => {
    const fetchMock = jest.fn(async () => {
      throw new Error('network down');
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await changePassword('user-1', {
      old_password: 'old',
      new_password: 'newPass123!',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('algo de errado aconteceu, contate o suporte!');
  });
});
