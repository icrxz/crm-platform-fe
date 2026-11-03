import { render, screen, fireEvent } from '@testing-library/react';
import { CommentDetails } from '../comments';
import { AttachmentDocumentType } from '@/app/types/attachments';
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

let capturedCarousels: { images: { id: string }[] }[] = [];

jest.mock('../../../common/image-carousel', () => ({
  ImageCarousel: (props: { images: { id: string }[] }) => {
    capturedCarousels.push(props);
    return <div data-testid="image-carousel" />;
  },
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

function renderExpanded(crmCase: CaseFull, userRole: UserRole) {
  const result = render(
    <SnackbarProvider>
      <CommentDetails crmCase={crmCase} userRole={userRole} />
    </SnackbarProvider>
  );

  // A seção nasce colapsada; os comentários só existem no DOM depois disto.
  fireEvent.click(screen.getByRole('button', { expanded: false }));

  return result;
}

beforeEach(() => {
  capturedModalProps = null;
  capturedCarousels = [];
});

describe('CommentDetails', () => {
  it('starts collapsed and counts the comments in the summary', () => {
    render(
      <SnackbarProvider>
        <CommentDetails crmCase={buildCase()} userRole={UserRole.OPERATOR} />
      </SnackbarProvider>
    );

    expect(screen.getByText('Comentários (2)')).toBeInTheDocument();
    expect(screen.queryByText('Comentário original')).not.toBeInTheDocument();
  });

  it('leaves the status-change comments to the case moments section', () => {
    const crmCase = buildCase({
      comments: [
        {
          comment_id: 'comment-1',
          case_id: 'case-1',
          content: 'Comentário livre',
          comment_type: CommentType.COMMENT,
          created_by: 'user-1',
          created_at: '2026-01-01T10:00:00Z',
          updated_by: 'user-1',
          updated_at: '2026-01-01T10:00:00Z',
        },
        {
          comment_id: 'comment-2',
          case_id: 'case-1',
          content: 'Fotos do cliente',
          comment_type: CommentType.CONTENT,
          created_by: 'user-1',
          created_at: '2026-01-02T10:00:00Z',
          updated_by: 'user-1',
          updated_at: '2026-01-02T10:00:00Z',
        },
      ],
    });

    renderExpanded(crmCase, UserRole.OPERATOR);

    expect(screen.getByText('Comentário livre')).toBeInTheDocument();
    expect(screen.queryByText('Fotos do cliente')).not.toBeInTheDocument();
  });

  it('shows an empty state when the case has no free comments', () => {
    renderExpanded(buildCase({ comments: [] }), UserRole.OPERATOR);

    expect(
      screen.getByText('Nenhum comentário registrado.')
    ).toBeInTheDocument();
  });

  // A Ordem de Serviço anexada num comentário livre vira um bloco próprio em
  // "Detalhes"; repeti-la aqui mostraria a mesma imagem duas vezes na página.
  it('leaves the attachments tagged as documents to the case moments section', () => {
    const crmCase = buildCase({
      comments: [
        {
          comment_id: 'comment-1',
          case_id: 'case-1',
          content: 'OS assinada no local',
          comment_type: CommentType.COMMENT,
          created_by: 'user-1',
          created_at: '2026-01-01T10:00:00Z',
          updated_by: 'user-1',
          updated_at: '2026-01-01T10:00:00Z',
          attachments: [
            { attachment_id: 'foto-1', url: '/a.png', file_name: 'a.png' },
            {
              attachment_id: 'os-1',
              url: '/os.png',
              file_name: 'os.png',
              document_type: AttachmentDocumentType.SERVICE_ORDER,
            },
          ],
        },
      ],
    } as unknown as Partial<CaseFull>);

    renderExpanded(crmCase, UserRole.OPERATOR);

    expect(capturedCarousels.map((c) => c.images.map((i) => i.id))).toEqual([
      ['foto-1'],
    ]);
  });

  it('shows the "(editado)" badge only for comments whose updated_at differs from created_at', () => {
    renderExpanded(buildCase(), UserRole.OPERATOR);

    expect(screen.getAllByText('(editado)')).toHaveLength(1);
  });

  it('does not show the edit pencil for non-admin roles', () => {
    renderExpanded(buildCase(), UserRole.OPERATOR);

    expect(screen.queryByTitle('Editar comentário')).not.toBeInTheDocument();
  });

  it('shows the edit pencil for admin roles and opens the modal for the clicked comment', () => {
    renderExpanded(buildCase(), UserRole.ADMIN);

    const pencils = screen.getAllByTitle('Editar comentário');
    expect(pencils).toHaveLength(2);

    fireEvent.click(pencils[1]);

    expect(screen.getByTestId('edit-comment-modal')).toBeInTheDocument();
    expect(capturedModalProps?.comment.comment_id).toBe('comment-2');
  });
});
