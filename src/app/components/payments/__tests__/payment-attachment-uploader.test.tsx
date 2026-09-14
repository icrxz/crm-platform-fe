import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PaymentAttachmentUploader } from '../payment-attachment-uploader';
import {
  uploadAttachments,
  deleteAttachment,
} from '../../../services/attachments';
import { addAttachmentToComment, addComment } from '../../../services/comments';
import { Attachment, CreateAttachment } from '../../../types/attachments';
import { Comment } from '../../../types/comment';

type FakeUppyHandlers = Record<string, (...args: unknown[]) => void>;

jest.mock('@uppy/core', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => {
    const handlers: FakeUppyHandlers = {};
    return {
      on: (event: string, cb: (...args: unknown[]) => void) => {
        handlers[event] = cb;
      },
      off: (event: string) => {
        delete handlers[event];
      },
      removeFile: jest.fn(),
      emit: (event: string, ...args: unknown[]) => handlers[event]?.(...args),
    };
  }),
}));

jest.mock('@uppy/locales/lib/pt_BR', () => ({}));

jest.mock('@uppy/react', () => ({
  FileInput: ({
    uppy,
  }: {
    uppy: { emit: (event: string, file: unknown) => void };
  }) => (
    <input
      type="file"
      data-testid="file-input"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          uppy.emit('file-added', {
            id: file.name,
            data: file,
            name: file.name,
          });
        }
      }}
    />
  ),
}));

jest.mock('../../../services/attachments', () => ({
  uploadAttachments: jest.fn(),
  deleteAttachment: jest.fn(),
}));
jest.mock('../../../services/comments', () => ({
  addComment: jest.fn(),
  addAttachmentToComment: jest.fn(),
}));

const mockUploadAttachments = uploadAttachments as jest.Mock;
const mockDeleteAttachment = deleteAttachment as jest.Mock;
const mockAddComment = addComment as jest.Mock;
const mockAddAttachmentToComment = addAttachmentToComment as jest.Mock;

function buildCreateAttachment(
  overrides: Partial<CreateAttachment> = {}
): CreateAttachment {
  return {
    url: 'https://s3.test/comprovante.png',
    file_name: 'comprovante.png',
    file_extension: 'png',
    size: 1024,
    key: 'comprovante.png',
    created_by: 'user-1',
    ...overrides,
  };
}

function buildAttachment(overrides: Partial<Attachment> = {}): Attachment {
  return {
    attachment_id: 'attachment-1',
    ...buildCreateAttachment(),
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

function buildComment(overrides: Partial<Comment> = {}): Partial<Comment> {
  return {
    comment_id: 'comment-1',
    attachments: [buildAttachment()],
    ...overrides,
  };
}

function selectFile(name = 'comprovante.png') {
  const input = screen.getByTestId('file-input') as HTMLInputElement;
  const file = new File(['content'], name, { type: 'image/png' });
  fireEvent.change(input, { target: { files: [file] } });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PaymentAttachmentUploader', () => {
  it('creates a payment-proof comment on the first uploaded file', async () => {
    mockUploadAttachments.mockResolvedValue([buildCreateAttachment()]);
    mockAddComment.mockResolvedValue({
      success: true,
      message: 'ok',
      data: buildComment(),
    });

    const onCommentCreated = jest.fn();
    const onAttachmentAdded = jest.fn();

    render(
      <PaymentAttachmentUploader
        caseId="case-001"
        commentId={null}
        attachments={[]}
        onCommentCreated={onCommentCreated}
        onAttachmentAdded={onAttachmentAdded}
        onAttachmentRemoved={jest.fn()}
        onError={jest.fn()}
      />
    );

    selectFile();

    await waitFor(() => expect(mockAddComment).toHaveBeenCalled());
    expect(mockAddAttachmentToComment).not.toHaveBeenCalled();
    expect(onCommentCreated).toHaveBeenCalledWith('comment-1');
    expect(onAttachmentAdded).toHaveBeenCalledWith(buildAttachment());
  });

  it('appends to the existing comment when one is already open', async () => {
    mockUploadAttachments.mockResolvedValue([
      buildCreateAttachment({ file_name: 'comprovante-2.png' }),
    ]);
    mockAddAttachmentToComment.mockResolvedValue({
      success: true,
      message: 'ok',
      data: buildAttachment({
        attachment_id: 'attachment-2',
        file_name: 'comprovante-2.png',
      }),
    });

    const onAttachmentAdded = jest.fn();

    render(
      <PaymentAttachmentUploader
        caseId="case-001"
        commentId="comment-1"
        attachments={[buildAttachment()]}
        onCommentCreated={jest.fn()}
        onAttachmentAdded={onAttachmentAdded}
        onAttachmentRemoved={jest.fn()}
        onError={jest.fn()}
      />
    );

    selectFile('comprovante-2.png');

    await waitFor(() =>
      expect(mockAddAttachmentToComment).toHaveBeenCalledWith(
        'comment-1',
        buildCreateAttachment({ file_name: 'comprovante-2.png' })
      )
    );
    expect(mockAddComment).not.toHaveBeenCalled();
    expect(onAttachmentAdded).toHaveBeenCalledWith(
      buildAttachment({
        attachment_id: 'attachment-2',
        file_name: 'comprovante-2.png',
      })
    );
  });

  it('deletes an attachment when its badge is closed', async () => {
    mockDeleteAttachment.mockResolvedValue({ success: true, message: 'ok' });
    const onAttachmentRemoved = jest.fn();

    render(
      <PaymentAttachmentUploader
        caseId="case-001"
        commentId="comment-1"
        attachments={[buildAttachment()]}
        onCommentCreated={jest.fn()}
        onAttachmentAdded={jest.fn()}
        onAttachmentRemoved={onAttachmentRemoved}
        onError={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText('×'));

    await waitFor(() =>
      expect(mockDeleteAttachment).toHaveBeenCalledWith('attachment-1')
    );
    expect(onAttachmentRemoved).toHaveBeenCalledWith('attachment-1');
  });

  it('reports an error and keeps the attachment when deletion fails', async () => {
    mockDeleteAttachment.mockResolvedValue({
      success: false,
      message: 'falha ao excluir anexo',
    });
    const onAttachmentRemoved = jest.fn();
    const onError = jest.fn();

    render(
      <PaymentAttachmentUploader
        caseId="case-001"
        commentId="comment-1"
        attachments={[buildAttachment()]}
        onCommentCreated={jest.fn()}
        onAttachmentAdded={jest.fn()}
        onAttachmentRemoved={onAttachmentRemoved}
        onError={onError}
      />
    );

    fireEvent.click(screen.getByText('×'));

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith('falha ao excluir anexo')
    );
    expect(onAttachmentRemoved).not.toHaveBeenCalled();
  });
});
