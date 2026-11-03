import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from '../../../../context/SnackbarProvider';
import { updateCaseMetadata } from '../../../../services/cases';
import { addComment } from '../../../../services/comments';
import { CaseFull } from '@/app/types/case';
import { OngoingCommentBox } from '../ongoing_comment_box';

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

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    const { forwardRef, useImperativeHandle } = jest.requireActual('react');
    return forwardRef((_props: unknown, ref: React.Ref<unknown>) => {
      useImperativeHandle(ref, () => ({
        submit: async () => [{ key: 'foto.png' }],
        length: 1,
      }));
      return <div data-testid="uploader" />;
    });
  },
}));

const mockAddComment = addComment as jest.Mock;
const mockUpdateCaseMetadata = updateCaseMetadata as jest.Mock;
const mockSignOut = signOut as jest.Mock;
const mockShowSnackbar = jest.fn();
const mockRefresh = jest.fn();

const crmCase = { case_id: 'case-1' } as CaseFull;

function typeComment(text: string) {
  fireEvent.change(screen.getByLabelText('Comentário'), {
    target: { value: text },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  (useSnackbar as jest.Mock).mockReturnValue({
    showSnackbar: mockShowSnackbar,
  });
  (useRouter as jest.Mock).mockReturnValue({ refresh: mockRefresh });
  mockAddComment.mockResolvedValue({ success: true, message: 'ok' });
  mockUpdateCaseMetadata.mockResolvedValue({ success: true, message: 'ok' });
});

describe('OngoingCommentBox comment', () => {
  it('asks for text before posting', async () => {
    render(<OngoingCommentBox crmCase={crmCase} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar comentário' })
    );

    expect(
      await screen.findByText('Escreva o comentário antes de enviar.')
    ).toBeInTheDocument();
    expect(mockAddComment).not.toHaveBeenCalled();
  });

  it('posts the text with its attachments as a plain comment and clears it', async () => {
    render(<OngoingCommentBox crmCase={crmCase} />);

    typeComment('Cliente pediu para voltar amanhã');
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar comentário' })
    );

    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
    const [caseId, formData, attachments, commentType] =
      mockAddComment.mock.calls[0];
    expect(caseId).toBe('case-1');
    expect((formData as FormData).get('content')).toBe(
      'Cliente pediu para voltar amanhã'
    );
    expect(attachments).toEqual([{ key: 'foto.png' }]);
    expect(commentType).toBeUndefined();
    expect(screen.getByLabelText('Comentário')).toHaveValue('');
  });

  it('signs the user out when the comment is unauthorized', async () => {
    mockAddComment.mockResolvedValue({
      success: false,
      message: 'sessão expirada',
      unauthorized: true,
    });
    render(<OngoingCommentBox crmCase={crmCase} />);

    typeComment('Qualquer coisa');
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar comentário' })
    );

    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    expect(mockShowSnackbar).toHaveBeenCalledWith('sessão expirada', 'error');
    expect(screen.getByLabelText('Comentário')).toHaveValue('Qualquer coisa');
  });
});

describe('OngoingCommentBox advance request', () => {
  it('asks for a description first', async () => {
    render(<OngoingCommentBox crmCase={crmCase} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Solicitar Adiantamento/Peças' })
    );

    expect(
      await screen.findByText(
        'Descreva a solicitação no comentário antes de solicitar o adiantamento.'
      )
    ).toBeInTheDocument();
    expect(mockAddComment).not.toHaveBeenCalled();
  });

  it('posts the request and flags the case', async () => {
    render(<OngoingCommentBox crmCase={crmCase} />);

    typeComment('Preciso de adiantamento para a placa');
    fireEvent.click(
      screen.getByRole('button', { name: 'Solicitar Adiantamento/Peças' })
    );

    await waitFor(() =>
      expect(mockUpdateCaseMetadata).toHaveBeenCalledWith('case-1', {
        advance_requested: 'true',
      })
    );
    expect((mockAddComment.mock.calls[0][1] as FormData).get('content')).toBe(
      'Preciso de adiantamento para a placa'
    );
    await waitFor(() =>
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        'Adiantamento solicitado com sucesso',
        'success'
      )
    );
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('does not flag the case when the comment fails', async () => {
    mockAddComment.mockResolvedValue({ success: false, message: 'falha' });
    render(<OngoingCommentBox crmCase={crmCase} />);

    typeComment('Pedido');
    fireEvent.click(
      screen.getByRole('button', { name: 'Solicitar Adiantamento/Peças' })
    );

    await waitFor(() =>
      expect(mockShowSnackbar).toHaveBeenCalledWith('falha', 'error')
    );
    expect(mockUpdateCaseMetadata).not.toHaveBeenCalled();
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('reports a failure to flag the case', async () => {
    mockUpdateCaseMetadata.mockResolvedValue({
      success: false,
      message: 'sessão expirada',
      unauthorized: true,
    });
    render(<OngoingCommentBox crmCase={crmCase} />);

    typeComment('Pedido');
    fireEvent.click(
      screen.getByRole('button', { name: 'Solicitar Adiantamento/Peças' })
    );

    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
