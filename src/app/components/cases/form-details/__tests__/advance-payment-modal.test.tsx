import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from '../../../../context/SnackbarProvider';
import { updateCaseMetadata } from '../../../../services/cases';
import { addComment } from '../../../../services/comments';
import { CommentType } from '@/app/types/comment';
import { AdvancePaymentModal } from '../advance-payment-modal';

jest.mock('../../../../services/cases', () => ({
  updateCaseMetadata: jest.fn(),
}));
jest.mock('../../../../services/comments', () => ({
  addComment: jest.fn(),
}));
jest.mock('../../../../context/SnackbarProvider', () => ({
  useSnackbar: jest.fn(),
}));
jest.mock('next-auth/react', () => ({ signOut: jest.fn() }));
jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

// O uploader vem por next/dynamic (ssr:false, Uppy). Sem arquivo escolhido ele
// resolve com lista vazia — que é exatamente o caso que estes testes cobrem.
let uploaderResponse: unknown[] = [];
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    const { forwardRef, useImperativeHandle } = jest.requireActual('react');
    return forwardRef((_props: unknown, ref: React.Ref<unknown>) => {
      useImperativeHandle(ref, () => ({
        submit: async () => uploaderResponse,
        length: uploaderResponse.length,
      }));
      return <div data-testid="uploader" />;
    });
  },
}));

const mockUseSnackbar = useSnackbar as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockAddComment = addComment as jest.Mock;
const mockUpdateCaseMetadata = updateCaseMetadata as jest.Mock;
const mockShowSnackbar = jest.fn();

function renderModal() {
  return render(
    <AdvancePaymentModal isOpen onClose={jest.fn()} caseId="case-1" />
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  uploaderResponse = [];
  mockUseSnackbar.mockReturnValue({ showSnackbar: mockShowSnackbar });
  mockUseRouter.mockReturnValue({ refresh: jest.fn() });
  mockAddComment.mockResolvedValue({ success: true, message: 'ok' });
  mockUpdateCaseMetadata.mockResolvedValue({ success: true, message: 'ok' });
});

describe('AdvancePaymentModal', () => {
  // O admin costuma dar baixa antes de o comprovante existir; exigir o anexo
  // mantinha o caso marcado como pendente sem necessidade.
  it('registers the payment with no attachment', async () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => expect(mockUpdateCaseMetadata).toHaveBeenCalled());
    expect(mockUpdateCaseMetadata).toHaveBeenCalledWith('case-1', {
      advance_requested: 'false',
    });
    expect(screen.queryByText('Deve haver no mínimo 1 anexo.')).toBeNull();
  });

  it('files the payment proof as a PaymentProof comment', async () => {
    uploaderResponse = [{ key: 'comprovante.png' }];
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => expect(mockAddComment).toHaveBeenCalled());
    const [caseId, , attachments, commentType] = mockAddComment.mock.calls[0];
    expect(caseId).toBe('case-1');
    expect(attachments).toEqual([{ key: 'comprovante.png' }]);
    expect(commentType).toBe(CommentType.PAYMENT_PROOF);
  });
});
