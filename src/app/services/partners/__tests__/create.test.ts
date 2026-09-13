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

import { createPartner } from '../create';

describe('createPartner', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  function buildFormData(overrides: Partial<Record<string, string>> = {}) {
    const formData = new FormData();
    formData.set('first_name', overrides.first_name ?? 'João');
    formData.set('last_name', overrides.last_name ?? 'Silva');
    formData.set('document', overrides.document ?? '123.456.789-00');
    formData.set('document_type', overrides.document_type ?? 'CPF');
    formData.set('partner_type', overrides.partner_type ?? 'Montador');
    formData.set('payment_key', overrides.payment_key ?? 'joao@email.com');
    formData.set('payment_key_option', overrides.payment_key_option ?? 'email');
    return formData;
  }

  it('sends the document type chosen in the form, not an inferred one', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await createPartner(null, buildFormData({ document_type: 'CNPJ' }));

    const [, options] = fetchMock.mock.calls[0];
    const payload = JSON.parse(options.body as string);
    expect(payload.document_type).toBe('CNPJ');
    expect(payload.document).toBe('12345678900');
  });

  it('propagates the API error message on failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ message: 'document already in use' }),
    }) as unknown as typeof fetch;

    const result = await createPartner(null, buildFormData());

    expect(result.success).toBe(false);
    expect(result.message).toBe('document already in use');
    expect(result.unauthorized).toBe(false);
  });

  it('marks the response as unauthorized on a 401', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    const result = await createPartner(null, buildFormData());

    expect(result.success).toBe(false);
    expect(result.unauthorized).toBe(true);
    expect(result.message).toBe('usuário não autorizado');
  });

  it('returns a generic failure message when the request throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network error'));

    const result = await createPartner(null, buildFormData());

    expect(result).toEqual({
      success: false,
      message: 'algo de errado aconteceu, contate o suporte!',
    });
  });

  it('returns success on a valid creation', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    const result = await createPartner(null, buildFormData());

    expect(result).toEqual({
      success: true,
      message: 'Técnico criado com sucesso!',
      unauthorized: false,
    });
  });
});
