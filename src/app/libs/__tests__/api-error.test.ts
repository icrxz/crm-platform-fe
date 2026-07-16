import { getApiErrorMessage } from '../api-error';

function buildResponse(body: unknown): Response {
  return {
    json: async () => body,
  } as Response;
}

describe('getApiErrorMessage', () => {
  it('should return the message field when present', async () => {
    const resp = buildResponse({
      message: 'Validation error - Message: bad input',
    });

    const result = await getApiErrorMessage(resp, 'fallback');

    expect(result).toBe('Validation error - Message: bad input');
  });

  it('should fall back to the error field when message is absent', async () => {
    const resp = buildResponse({ error: 'invalid authentication token' });

    const result = await getApiErrorMessage(resp, 'fallback');

    expect(result).toBe('invalid authentication token');
  });

  it('should return the fallback when the body has neither field', async () => {
    const resp = buildResponse({});

    const result = await getApiErrorMessage(resp, 'fallback');

    expect(result).toBe('fallback');
  });

  it('should return the fallback when the body cannot be parsed as JSON', async () => {
    const resp = {
      json: async () => {
        throw new Error('not json');
      },
    } as unknown as Response;

    const result = await getApiErrorMessage(resp, 'fallback');

    expect(result).toBe('fallback');
  });
});
