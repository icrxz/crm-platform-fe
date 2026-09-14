jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: () => ({ value: 'test-jwt' }),
  }),
}));

jest.mock('../../../libs/session', () => ({
  getCurrentUser: jest.fn().mockResolvedValue({ username: 'test-author' }),
}));

jest.mock('../index', () => ({
  crmCoreEndpoint: 'https://api.test',
  crmCoreApiKey: 'test-key',
}));

import { createCaseBatch } from '../create_batch';

describe('createCaseBatch', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  function buildFormData() {
    const formData = new FormData();
    formData.set('company', 'Seguradora ABC');
    formData.set('category', 'furniture');
    formData.set('file', new Blob(['a,b,c']), 'cases.csv');
    return formData;
  }

  it('posts the raw form data to the batch endpoint with auth headers', async () => {
    const formData = buildFormData();
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ case_ids: ['case-1', 'case-2'] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await createCaseBatch(formData);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.test/crm/core/api/v1/cases/batch',
      {
        method: 'POST',
        headers: {
          'X-API-Key': 'test-key',
          Authorization: 'Bearer test-jwt',
          'X-Author': 'test-author',
        },
        body: formData,
      }
    );
    expect(result).toEqual({
      success: true,
      message: 'casos criados com sucesso!',
      data: { case_ids: ['case-1', 'case-2'] },
    });
  });

  it('marks the response as unauthorized on a 401', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    const result = await createCaseBatch(buildFormData());

    expect(result.success).toBe(false);
    expect(result.unauthorized).toBe(true);
    expect(result.message).toBe('usuário não autorizado');
  });

  it('returns the API error message on a non-401 failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ message: 'arquivo inválido' }),
    }) as unknown as typeof fetch;

    const result = await createCaseBatch(buildFormData());

    expect(result.success).toBe(false);
    expect(result.unauthorized).toBe(false);
    expect(result.message).toBe('arquivo inválido');
  });

  it('returns a generic failure message when the request throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network error'));

    const result = await createCaseBatch(buildFormData());

    expect(result).toEqual({
      success: false,
      message: 'algo de errado aconteceu, contate o suporte!',
    });
  });
});
