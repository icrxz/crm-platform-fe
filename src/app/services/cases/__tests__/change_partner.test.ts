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

jest.mock('../update_case_metadata', () => ({
  updateCaseMetadata: jest.fn(),
}));

import { changePartner } from '../change_partner';
import { updateCaseMetadata } from '../update_case_metadata';

const mockUpdateCaseMetadata = updateCaseMetadata as jest.Mock;

describe('changePartner', () => {
  const originalFetch = global.fetch;
  const originalFlag = process.env.ONGOING_WIZARD_V2_ENABLED;

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.ONGOING_WIZARD_V2_ENABLED = originalFlag;
    jest.clearAllMocks();
  });

  function buildFormData() {
    const formData = new FormData();
    formData.set('partner', 'partner-1');
    formData.set('target_date', '2026-11-10T10:00:00Z');
    return formData;
  }

  function mockFetch(response: Partial<Response>) {
    global.fetch = jest
      .fn()
      .mockResolvedValue(response) as unknown as typeof fetch;
  }

  it('pins the case to the v2 wizard when the flag is on', async () => {
    process.env.ONGOING_WIZARD_V2_ENABLED = 'true';
    mockFetch({ ok: true });
    mockUpdateCaseMetadata.mockResolvedValue({ success: true, message: 'ok' });

    const result = await changePartner('case-1', buildFormData());

    expect(result.success).toBe(true);
    expect(mockUpdateCaseMetadata).toHaveBeenCalledWith('case-1', {
      ongoing_flow_version: 'v2',
    });
  });

  it('leaves the case on the original form when the flag is off', async () => {
    delete process.env.ONGOING_WIZARD_V2_ENABLED;
    mockFetch({ ok: true });

    const result = await changePartner('case-1', buildFormData());

    expect(result.success).toBe(true);
    expect(mockUpdateCaseMetadata).not.toHaveBeenCalled();
  });

  it('does not stamp a case whose partner assignment failed', async () => {
    process.env.ONGOING_WIZARD_V2_ENABLED = 'true';
    mockFetch({
      ok: false,
      status: 500,
      json: async () => ({}),
      text: async () => '',
    });

    const result = await changePartner('case-1', buildFormData());

    expect(result.success).toBe(false);
    expect(mockUpdateCaseMetadata).not.toHaveBeenCalled();
  });

  it('still reports success when stamping the flag fails', async () => {
    process.env.ONGOING_WIZARD_V2_ENABLED = 'true';
    mockFetch({ ok: true });
    mockUpdateCaseMetadata.mockResolvedValue({
      success: false,
      message: 'falha',
    });

    const result = await changePartner('case-1', buildFormData());

    expect(result.success).toBe(true);
  });
});
