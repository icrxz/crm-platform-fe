/**
 * @jest-environment node
 */
const mockSend = jest.fn();

jest.mock('../index', () => ({
  s3Client: { send: (...args: unknown[]) => mockSend(...args) },
}));
jest.mock('sharp', () => jest.fn());
jest.mock('uuid', () => ({ v4: () => 'fixed-uuid' }));
jest.mock('../../../libs/session', () => ({ getCurrentUser: jest.fn() }));
jest.mock('@aws-sdk/client-s3', () => ({
  PutObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
}));

import { getCurrentUser } from '../../../libs/session';
import { uploadAttachments } from '../upload-attachment';

const mockGetCurrentUser = getCurrentUser as jest.Mock;

function file(name: string, type = 'image/png') {
  return new File(['conteudo'], name, { type });
}

describe('uploadAttachments', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AWS_S3_BUCKET_NAME = 'bucket';
    process.env.AWS_REGION = 'sa-east-1';
    mockGetCurrentUser.mockResolvedValue({ username: 'tecnico' });
    mockSend.mockResolvedValue({ $metadata: { httpStatusCode: 200 } });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uploads nothing without a session', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const formData = new FormData();
    formData.append('attachments', file('a.png'));

    expect(await uploadAttachments(formData)).toEqual([]);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('tags each file with the document type sent alongside it, in order', async () => {
    const formData = new FormData();
    formData.append('attachments', file('foto.png'));
    formData.append('document_types', 'photo');
    formData.append('attachments', file('os.jpeg', 'image/jpeg'));
    formData.append('document_types', 'service_order');

    const result = await uploadAttachments(formData);

    expect(result).toEqual([
      expect.objectContaining({
        file_name: 'foto.png',
        key: 'fixed-uuid.png',
        url: 'https://bucket.s3.sa-east-1.amazonaws.com/fixed-uuid.png',
        created_by: 'tecnico',
        document_type: 'photo',
      }),
      expect.objectContaining({
        file_name: 'os.jpeg',
        file_extension: 'image/jpeg',
        document_type: 'service_order',
      }),
    ]);
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it('treats files without a type, or with an unknown one, as photos', async () => {
    const formData = new FormData();
    formData.append('attachments', file('a.png'));
    formData.append('attachments', file('b.png'));
    formData.append('document_types', 'nonsense');

    const result = await uploadAttachments(formData);

    expect(result.map((a) => a.document_type)).toEqual(['photo', 'photo']);
  });

  it('fails when S3 does not accept the file', async () => {
    mockSend.mockResolvedValue({ $metadata: { httpStatusCode: 500 } });
    const formData = new FormData();
    formData.append('attachments', file('a.png'));

    await expect(uploadAttachments(formData)).rejects.toThrow(
      'Error uploading file to S3'
    );
  });
});
