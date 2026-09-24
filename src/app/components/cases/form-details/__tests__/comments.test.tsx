import { render, screen, fireEvent } from '@testing-library/react';
import { CommentDetails } from '../comments';
import { CaseFull } from '@/app/types/case';
import { CommentType } from '@/app/types/comment';
import { UserRole } from '@/app/types/user';
import { SnackbarProvider } from '@/app/context/SnackbarProvider';

let capturedModalProps: { comment: { comment_id: string } } | null = null;

jest.mock('../edit-comment-modal', () => ({
  EditCommentModal: (props: { comment: { comment_id: string } }) => {
    capturedModalProps = props;
    return <div data-testid="edit-comment-modal" />;
  },
}));

jest.mock('../../../common/image-carousel', () => ({
  ImageCarousel: () => <div data-testid="image-carousel" />,
}));

jest.mock('../advance-payment-modal', () => ({
  AdvancePaymentModal: () => <div data-testid="advance-payment-modal" />,
}));

function buildCase(overrides: Partial<CaseFull> = {}): CaseFull {
  return {
    case_id: 'case-1',
    subject: 'Assunto do caso',
    comments: [
      {
        comment_id: 'comment-1',
        case_id: 'case-1',
        content: 'Comentário original',
        comment_type: CommentType.COMMENT,
        created_by: 'user-1',
        created_at: '2026-01-01T10:00:00Z',
        updated_by: 'user-1',
        updated_at: '2026-01-01T10:00:00Z',
      },
      {
        comment_id: 'comment-2',
        case_id: 'case-1',
        content: 'Comentário editado',
        comment_type: CommentType.COMMENT,
        created_by: 'user-2',
        created_at: '2026-01-01T10:00:00Z',
        updated_by: 'admin-1',
        updated_at: '2026-01-02T10:00:00Z',
      },
    ],
    ...overrides,
  } as CaseFull;
}

beforeEach(() => {
  capturedModalProps = null;
});

describe('CommentDetails', () => {
  it('shows the "(editado)" badge only for comments whose updated_at differs from created_at', () => {
    render(
      <SnackbarProvider>
        <CommentDetails crmCase={buildCase()} userRole={UserRole.OPERATOR} />
      </SnackbarProvider>
    );

    expect(screen.getAllByText('(editado)')).toHaveLength(1);
  });

  it('does not show the edit pencil for non-admin roles', () => {
    render(
      <SnackbarProvider>
        <CommentDetails crmCase={buildCase()} userRole={UserRole.OPERATOR} />
      </SnackbarProvider>
    );

    expect(screen.queryByTitle('Editar comentário')).not.toBeInTheDocument();
  });

  it('shows the edit pencil for admin roles and opens the modal for the clicked comment', () => {
    render(
      <SnackbarProvider>
        <CommentDetails crmCase={buildCase()} userRole={UserRole.ADMIN} />
      </SnackbarProvider>
    );

    const pencils = screen.getAllByTitle('Editar comentário');
    expect(pencils).toHaveLength(2);

    fireEvent.click(pencils[1]);

    expect(screen.getByTestId('edit-comment-modal')).toBeInTheDocument();
    expect(capturedModalProps?.comment.comment_id).toBe('comment-2');
  });

  it('does not show the advance-requested badge when the flag is not set', () => {
    render(
      <SnackbarProvider>
        <CommentDetails crmCase={buildCase()} userRole={UserRole.ADMIN} />
      </SnackbarProvider>
    );

    expect(screen.queryByText('Adiantamento pendente')).not.toBeInTheDocument();
  });

  it('shows the advance-requested badge and a "Marcar pagamento" button for admins when the flag is set', () => {
    render(
      <SnackbarProvider>
        <CommentDetails
          crmCase={buildCase({ metadata: { advance_requested: 'true' } })}
          userRole={UserRole.ADMIN}
        />
      </SnackbarProvider>
    );

    expect(screen.getByText('Adiantamento pendente')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Marcar pagamento' })
    ).toBeInTheDocument();
  });

  it('shows the advance-requested badge but not the button for non-admins', () => {
    render(
      <SnackbarProvider>
        <CommentDetails
          crmCase={buildCase({ metadata: { advance_requested: 'true' } })}
          userRole={UserRole.OPERATOR}
        />
      </SnackbarProvider>
    );

    expect(screen.getByText('Adiantamento pendente')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Marcar pagamento' })
    ).not.toBeInTheDocument();
  });

  it('opens the advance payment modal when the admin clicks "Marcar pagamento"', () => {
    render(
      <SnackbarProvider>
        <CommentDetails
          crmCase={buildCase({ metadata: { advance_requested: 'true' } })}
          userRole={UserRole.ADMIN}
        />
      </SnackbarProvider>
    );

    expect(
      screen.queryByTestId('advance-payment-modal')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Marcar pagamento' }));

    expect(screen.getByTestId('advance-payment-modal')).toBeInTheDocument();
  });
});
