import { render, screen, waitFor } from '@testing-library/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ConfirmPaymentModal } from '../confirm-payment';
import { changeStatus } from '../../../services/cases';
import {
  getCaseComments,
  updateCommentContent,
} from '../../../services/comments';
import { useSnackbar } from '../../../context/SnackbarProvider';
import { Attachment } from '../../../types/attachments';
import { Comment, CommentType } from '../../../types/comment';

// React 18 (installed in node_modules) doesn't ship useActionState/useFormStatus
// yet — those React 19 APIs are only available at runtime because Next.js
// aliases 'react'/'react-dom' to its own bundled experimental channel during
// build/dev. Jest doesn't go through that webpack alias, so we shim the two
// hooks here to make the component testable, mirroring what Next provides.
let capturedDispatch: ((formData: FormData) => void) | undefined;

jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    useActionState: (
      action: (state: unknown, formData: FormData) => unknown,
      initialState: unknown
    ) => {
      capturedDispatch = (formData: FormData) => action(initialState, formData);
      return [initialState, capturedDispatch, false];
    },
  };
});

jest.mock('react-dom', () => {
  const actualReactDOM = jest.requireActual('react-dom');
  return {
    ...actualReactDOM,
    useFormStatus: () => ({ pending: false }),
  };
});

let capturedUploaderProps: {
  attachments: Attachment[];
  onAttachmentAdded: (attachment: Attachment) => void;
  onAttachmentRemoved: (attachmentId: string) => void;
} | null = null;

jest.mock('../payment-attachment-uploader', () => ({
  PaymentAttachmentUploader: (props: {
    attachments: Attachment[];
    onAttachmentAdded: (attachment: Attachment) => void;
    onAttachmentRemoved: (attachmentId: string) => void;
  }) => {
    capturedUploaderProps = props;
    return (
      <div data-testid="uploader">
        <span data-testid="attachment-count">{props.attachments.length}</span>
      </div>
    );
  },
}));

jest.mock('../../../services/cases', () => ({ changeStatus: jest.fn() }));
jest.mock('../../../services/comments', () => ({
  getCaseComments: jest.fn(),
  updateCommentContent: jest.fn(),
}));
jest.mock('../../../context/SnackbarProvider', () => ({
  useSnackbar: jest.fn(),
}));
jest.mock('next-auth/react', () => ({ signOut: jest.fn() }));
jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

const mockChangeStatus = changeStatus as jest.Mock;
const mockGetCaseComments = getCaseComments as jest.Mock;
const mockUpdateCommentContent = updateCommentContent as jest.Mock;
const mockUseSnackbar = useSnackbar as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockShowSnackbar = jest.fn();
const mockRefresh = jest.fn();

function buildAttachment(overrides: Partial<Attachment> = {}): Attachment {
  return {
    attachment_id: 'attachment-1',
    url: 'https://s3.test/file.png',
    file_name: 'comprovante.png',
    file_extension: 'png',
    size: 1024,
    key: 'attachments/comprovante.png',
    created_by: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

function buildComment(overrides: Partial<Comment> = {}): Comment {
  return {
    comment_id: 'comment-1',
    case_id: 'case-001',
    content: 'comprovante(s) de pagamento anexado(s)',
    comment_type: CommentType.PAYMENT_PROOF,
    created_by: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_by: 'user-1',
    updated_at: '2024-01-01T00:00:00Z',
    attachments: [buildAttachment()],
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  capturedDispatch = undefined;
  capturedUploaderProps = null;
  mockUseSnackbar.mockReturnValue({ showSnackbar: mockShowSnackbar });
  mockUseRouter.mockReturnValue({ refresh: mockRefresh });
  mockGetCaseComments.mockResolvedValue({ success: true, data: [] });
  mockUpdateCommentContent.mockResolvedValue({
    success: true,
    message: 'comentário atualizado com sucesso',
  });
});

describe('ConfirmPaymentModal', () => {
  it('preloads attachments from an existing payment-proof comment on the case', async () => {
    mockGetCaseComments.mockResolvedValue({
      success: true,
      data: [buildComment()],
    });

    render(
      <ConfirmPaymentModal isOpen caseId="case-001" onClose={jest.fn()} />
    );

    await waitFor(() =>
      expect(screen.getByTestId('attachment-count').textContent).toBe('1')
    );
  });

  it('starts with no attachments when the case has no payment-proof comment yet', async () => {
    render(
      <ConfirmPaymentModal isOpen caseId="case-001" onClose={jest.fn()} />
    );

    await waitFor(() =>
      expect(screen.getByTestId('attachment-count').textContent).toBe('0')
    );
  });

  it('shows an error and does not confirm the payment when no file is attached', async () => {
    render(
      <ConfirmPaymentModal isOpen caseId="case-001" onClose={jest.fn()} />
    );

    await waitFor(() => expect(capturedUploaderProps).not.toBeNull());

    capturedDispatch!(new FormData());

    await waitFor(() =>
      expect(
        screen.getByText('Por favor, adicione pelo menos um arquivo')
      ).toBeInTheDocument()
    );
    expect(mockChangeStatus).not.toHaveBeenCalled();
  });

  it('confirms the payment once an attachment has been persisted', async () => {
    mockGetCaseComments.mockResolvedValue({
      success: true,
      data: [buildComment()],
    });
    mockChangeStatus.mockResolvedValue({
      success: true,
      message: 'status do caso atualizado com sucesso',
    });
    const onClose = jest.fn();
    render(<ConfirmPaymentModal isOpen caseId="case-001" onClose={onClose} />);

    await waitFor(() =>
      expect(screen.getByTestId('attachment-count').textContent).toBe('1')
    );

    capturedDispatch!(new FormData());

    await waitFor(() =>
      expect(mockChangeStatus).toHaveBeenCalledWith(
        'case-001',
        'Closed',
        expect.any(FormData)
      )
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mockRefresh).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      'status do caso atualizado com sucesso',
      'success'
    );
    expect(mockUpdateCommentContent).toHaveBeenCalledWith(
      'comment-1',
      expect.stringContaining('pagamento realizado no dia')
    );
  });

  it('reports a warning but still closes when updating the comment date fails', async () => {
    mockGetCaseComments.mockResolvedValue({
      success: true,
      data: [buildComment()],
    });
    mockChangeStatus.mockResolvedValue({
      success: true,
      message: 'status do caso atualizado com sucesso',
    });
    mockUpdateCommentContent.mockResolvedValue({
      success: false,
      message: 'falha ao atualizar comentário',
    });
    const onClose = jest.fn();
    render(<ConfirmPaymentModal isOpen caseId="case-001" onClose={onClose} />);

    await waitFor(() =>
      expect(screen.getByTestId('attachment-count').textContent).toBe('1')
    );

    capturedDispatch!(new FormData());

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.stringContaining('falha ao atualizar comentário'),
      'error'
    );
  });

  it('does not try to update any comment when there is no payment-proof comment yet', async () => {
    mockChangeStatus.mockResolvedValue({
      success: true,
      message: 'status do caso atualizado com sucesso',
    });

    render(
      <ConfirmPaymentModal isOpen caseId="case-001" onClose={jest.fn()} />
    );

    await waitFor(() => expect(capturedUploaderProps).not.toBeNull());
    capturedUploaderProps!.onAttachmentAdded({
      attachment_id: 'attachment-1',
      url: 'https://s3.test/file.png',
      file_name: 'comprovante.png',
      file_extension: 'png',
      size: 1024,
      key: 'attachments/comprovante.png',
      created_by: 'user-1',
      created_at: '2024-01-01T00:00:00Z',
    });

    await waitFor(() =>
      expect(screen.getByTestId('attachment-count').textContent).toBe('1')
    );

    capturedDispatch!(new FormData());

    await waitFor(() => expect(mockChangeStatus).toHaveBeenCalled());
    expect(mockUpdateCommentContent).not.toHaveBeenCalled();
  });

  it('signs the user out and shows an error on an unauthorized response', async () => {
    mockGetCaseComments.mockResolvedValue({
      success: true,
      data: [buildComment()],
    });
    mockChangeStatus.mockResolvedValue({
      success: false,
      unauthorized: true,
      message: 'usuário não autorizado',
    });
    render(
      <ConfirmPaymentModal isOpen caseId="case-001" onClose={jest.fn()} />
    );

    await waitFor(() =>
      expect(screen.getByTestId('attachment-count').textContent).toBe('1')
    );

    capturedDispatch!(new FormData());

    await waitFor(() =>
      expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/login' })
    );
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      'usuário não autorizado',
      'error'
    );
  });
});
