import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EditCommentModal } from '../edit-comment-modal';
import { deleteAttachment } from '../../../../services/attachments';
import { updateCommentContent } from '../../../../services/comments';
import { useSnackbar } from '../../../../context/SnackbarProvider';
import { Comment, CommentType } from '@/app/types/comment';

jest.mock('../../../../services/attachments', () => ({
  deleteAttachment: jest.fn(),
}));
jest.mock('../../../../services/comments', () => ({
  addAttachmentToComment: jest.fn(),
  updateCommentContent: jest.fn(),
}));
jest.mock('../../../../context/SnackbarProvider', () => ({
  useSnackbar: jest.fn(),
}));
jest.mock('next-auth/react', () => ({ signOut: jest.fn() }));
jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

// The real uploader is loaded through next/dynamic (ssr:false, Uppy-backed).
// None of these tests exercise adding a brand-new attachment, so the mock
// bypasses next/dynamic's lazy-loading machinery entirely and just forwards
// a ref satisfying the shape edit-comment-modal.tsx expects.
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    const { forwardRef, useImperativeHandle } = jest.requireActual('react');
    return forwardRef((_props: unknown, ref: React.Ref<unknown>) => {
      useImperativeHandle(ref, () => ({ submit: async () => [], length: 0 }));
      return <div data-testid="uploader" />;
    });
  },
}));

const mockUseSnackbar = useSnackbar as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockUpdateCommentContent = updateCommentContent as jest.Mock;
const mockDeleteAttachment = deleteAttachment as jest.Mock;

function buildComment(overrides: Partial<Comment> = {}): Comment {
  return {
    comment_id: 'comment-1',
    case_id: 'case-1',
    content: 'Comentário original',
    comment_type: CommentType.COMMENT,
    created_by: 'user-1',
    created_at: '2026-01-01T10:00:00Z',
    updated_by: 'user-1',
    updated_at: '2026-01-01T10:00:00Z',
    attachments: [
      {
        attachment_id: 'attachment-1',
        url: 'https://s3.test/foto.png',
        file_name: 'foto.png',
        file_extension: 'png',
        size: 100,
        key: 'foto.png',
        created_by: 'user-1',
        created_at: '2026-01-01T10:00:00Z',
      },
    ],
    ...overrides,
  };
}

const showSnackbar = jest.fn();
const refresh = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSnackbar.mockReturnValue({ showSnackbar });
  mockUseRouter.mockReturnValue({ refresh });
});

describe('EditCommentModal', () => {
  it('prefills the textarea with the current comment content', () => {
    render(
      <EditCommentModal isOpen onClose={jest.fn()} comment={buildComment()} />
    );

    expect(screen.getByDisplayValue('Comentário original')).toBeInTheDocument();
  });

  it('only calls updateCommentContent when the text actually changed', async () => {
    mockUpdateCommentContent.mockResolvedValue({
      success: true,
      message: 'ok',
    });

    render(
      <EditCommentModal isOpen onClose={jest.fn()} comment={buildComment()} />
    );

    fireEvent.click(screen.getByText('Salvar'));

    await waitFor(() => expect(refresh).toHaveBeenCalled());

    expect(mockUpdateCommentContent).not.toHaveBeenCalled();
  });

  it('saves the new content and closes on success', async () => {
    mockUpdateCommentContent.mockResolvedValue({
      success: true,
      message: 'ok',
    });
    const onClose = jest.fn();

    render(
      <EditCommentModal isOpen onClose={onClose} comment={buildComment()} />
    );

    fireEvent.change(screen.getByDisplayValue('Comentário original'), {
      target: { value: 'Comentário editado' },
    });
    fireEvent.click(screen.getByText('Salvar'));

    await waitFor(() =>
      expect(mockUpdateCommentContent).toHaveBeenCalledWith(
        'comment-1',
        'Comentário editado'
      )
    );
    expect(showSnackbar).toHaveBeenCalledWith(
      'comentário atualizado com sucesso',
      'success'
    );
    expect(refresh).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('signs the user out when the content update is unauthorized', async () => {
    mockUpdateCommentContent.mockResolvedValue({
      success: false,
      unauthorized: true,
      message: 'usuário não autorizado',
    });

    render(
      <EditCommentModal isOpen onClose={jest.fn()} comment={buildComment()} />
    );

    fireEvent.change(screen.getByDisplayValue('Comentário original'), {
      target: { value: 'outro texto' },
    });
    fireEvent.click(screen.getByText('Salvar'));

    await waitFor(() =>
      expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/login' })
    );
  });

  it('removes an attachment immediately when its trash icon is clicked', async () => {
    mockDeleteAttachment.mockResolvedValue({ success: true, message: 'ok' });

    render(
      <EditCommentModal isOpen onClose={jest.fn()} comment={buildComment()} />
    );

    expect(screen.getByAltText('foto.png')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Remover anexo'));

    await waitFor(() =>
      expect(mockDeleteAttachment).toHaveBeenCalledWith('attachment-1')
    );
    await waitFor(() =>
      expect(screen.queryByAltText('foto.png')).not.toBeInTheDocument()
    );
  });
});
