jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: () => ({ value: 'test-jwt' }),
  }),
}));

jest.mock('../../../libs/session', () => ({
  getCurrentUser: jest.fn().mockResolvedValue({ username: 'tecnico' }),
}));

jest.mock('../index', () => ({
  crmCoreEndpoint: 'https://api.test',
  crmCoreApiKey: 'test-key',
}));

import { CommentType } from '@/app/types/comment';
import { addComment } from '../add_comment';

describe('addComment', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  function formData(content: string) {
    const data = new FormData();
    data.set('content', content);
    return data;
  }

  function mockFetch(response: Partial<Response>) {
    const fetchMock = jest.fn().mockResolvedValue(response);
    global.fetch = fetchMock as unknown as typeof fetch;
    return fetchMock;
  }

  it('posts the comment with its attachments, type and metadata', async () => {
    const fetchMock = mockFetch({
      ok: true,
      json: async () => ({ comment_id: 'comment-1' }),
    });

    const result = await addComment(
      'case-1',
      formData('Ordem de serviço'),
      [{ key: 'os.png' } as never],
      CommentType.RESOLUTION,
      { ongoing_step: 'service_order' }
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.test/crm/core/api/v1/cases/case-1/comments',
      expect.objectContaining({ method: 'POST' })
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      content: 'Ordem de serviço',
      created_by: 'tecnico',
      comment_type: 'Resolution',
      case_id: 'case-1',
      attachments: [{ key: 'os.png' }],
      metadata: { ongoing_step: 'service_order' },
    });
    expect(result).toEqual({
      success: true,
      message: 'comentários criado com sucesso',
      data: { comment_id: 'comment-1' },
    });
  });

  it('defaults to a plain comment without metadata', async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => ({}) });

    await addComment('case-1', formData('oi'));

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.comment_type).toBe('Comment');
    expect(body).not.toHaveProperty('metadata');
  });

  it('flags an expired session', async () => {
    mockFetch({
      ok: false,
      status: 401,
      json: async () => ({}),
      text: async () => '',
    });

    const result = await addComment('case-1', formData('oi'));

    expect(result).toEqual(
      expect.objectContaining({ success: false, unauthorized: true })
    );
  });

  it('refuses a call without a case', async () => {
    const result = await addComment('', formData('oi'));

    expect(result.success).toBe(false);
  });
});
