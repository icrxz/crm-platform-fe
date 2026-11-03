import { render, screen, fireEvent } from '@testing-library/react';
import { SnackbarProvider } from '@/app/context/SnackbarProvider';
import { AttachmentDocumentType } from '@/app/types/attachments';
import { CaseCategory, CaseFull, CaseServiceType } from '@/app/types/case';
import { CommentType } from '@/app/types/comment';
import { UserRole } from '@/app/types/user';
import { CaseMoments } from '../case-moments';

let capturedCarousels: { images: { id: string }[] }[] = [];

jest.mock('../../../common/image-carousel', () => ({
  ImageCarousel: (props: { images: { id: string }[] }) => {
    capturedCarousels.push(props);
    return <div data-testid="image-carousel" />;
  },
}));

jest.mock('../advance-payment-modal', () => ({
  AdvancePaymentModal: () => <div data-testid="advance-payment-modal" />,
}));

function attachment(
  id: string,
  documentType?: AttachmentDocumentType
): Record<string, unknown> {
  return {
    attachment_id: id,
    url: `https://bucket/${id}.png`,
    file_name: `${id}.png`,
    document_type: documentType,
  };
}

function comment(
  id: string,
  commentType: CommentType,
  attachments: Record<string, unknown>[] = [],
  content = ''
): Record<string, unknown> {
  return {
    comment_id: id,
    case_id: 'case-1',
    content,
    comment_type: commentType,
    created_by: 'user-1',
    created_at: '2026-01-01T10:00:00Z',
    updated_by: 'user-1',
    updated_at: '2026-01-01T10:00:00Z',
    attachments,
  };
}

function buildCase(overrides: Partial<CaseFull> = {}): CaseFull {
  return {
    case_id: 'case-1',
    subject: 'Assunto do caso',
    type: CaseServiceType.REPAIR,
    metadata: { category: CaseCategory.D_PLUS },
    comments: [],
    ...overrides,
  } as unknown as CaseFull;
}

function renderMoments(crmCase: CaseFull, userRole = UserRole.ADMIN) {
  return render(
    <SnackbarProvider>
      <CaseMoments crmCase={crmCase} userRole={userRole} />
    </SnackbarProvider>
  );
}

beforeEach(() => {
  capturedCarousels = [];
});

describe('CaseMoments', () => {
  it('lists the moments in the order the case happens', () => {
    renderMoments(buildCase());

    const titles = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);

    expect(titles).toEqual([
      'Fotos Fornecidas pelo Cliente',
      'Fotos Fornecidas pelo Técnico',
      'Ordem de Serviço assinada',
      'Confirmação/validação da cliente',
      'Termo de garantia',
    ]);
  });

  it('asks only for the signed service order on an inspection', () => {
    renderMoments(buildCase({ type: CaseServiceType.INSPECTION }));

    expect(screen.getByText('Ordem de Serviço assinada')).toBeInTheDocument();
    expect(screen.queryByText('Termo de garantia')).not.toBeInTheDocument();
  });

  it('drops the warranty term on a furniture repair', () => {
    renderMoments(
      buildCase({ metadata: { category: CaseCategory.FURNITURE } })
    );

    expect(
      screen.getByText('Confirmação/validação da cliente')
    ).toBeInTheDocument();
    expect(screen.queryByText('Termo de garantia')).not.toBeInTheDocument();
  });

  // O comentário Resolution carrega fotos e papelada juntos; só o document_type
  // de cada anexo separa as duas coisas.
  it('splits the partner upload into photos and the documents it was tagged with', () => {
    const crmCase = buildCase({
      comments: [
        comment('c1', CommentType.CONTENT, [attachment('cliente-1')]),
        comment('c2', CommentType.RESOLUTION, [
          attachment('foto-1', AttachmentDocumentType.PHOTO),
          attachment('foto-2'),
          attachment('os-1', AttachmentDocumentType.SERVICE_ORDER),
          attachment('termo-1', AttachmentDocumentType.WARRANTY_TERM),
        ]),
      ],
    } as unknown as Partial<CaseFull>);

    renderMoments(crmCase);

    const imageIDs = capturedCarousels.map((carousel) =>
      carousel.images.map((image) => image.id)
    );

    expect(imageIDs).toEqual([
      ['cliente-1'],
      // Anexo sem document_type é anterior ao campo existir, logo é foto.
      ['foto-1', 'foto-2'],
      ['os-1'],
      ['termo-1'],
    ]);
  });

  // O técnico anexa a Ordem de Serviço ainda "Em andamento", por "Adicionar
  // comentário" — que grava um comentário Comment, não Resolution. Nessa etapa
  // crmCase.type ainda é o tipo de abertura, então nada é exigido ainda.
  it('shows a document tagged in a free comment before the case goes to the report', () => {
    renderMoments(
      buildCase({
        type: 'insurance',
        comments: [
          comment(
            'c1',
            CommentType.COMMENT,
            [attachment('os-1', AttachmentDocumentType.SERVICE_ORDER)],
            'OS assinada no local'
          ),
        ],
      } as unknown as Partial<CaseFull>)
    );

    expect(screen.getByText('Ordem de Serviço assinada')).toBeInTheDocument();
    // Só os dois blocos de foto seguem vazios; a OS chegou.
    expect(screen.getAllByText('Não enviado')).toHaveLength(2);
    expect(capturedCarousels.at(-1)?.images.map((image) => image.id)).toEqual([
      'os-1',
    ]);
  });

  it('hides the document blocks that are neither required nor uploaded', () => {
    renderMoments(
      buildCase({ type: 'insurance' } as unknown as Partial<CaseFull>)
    );

    const titles = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);

    expect(titles).toEqual([
      'Fotos Fornecidas pelo Cliente',
      'Fotos Fornecidas pelo Técnico',
    ]);
  });

  it('keeps a document out of the technician photos even when it rides the same upload', () => {
    renderMoments(
      buildCase({
        comments: [
          comment('c2', CommentType.RESOLUTION, [
            attachment('foto-1', AttachmentDocumentType.PHOTO),
            attachment('os-1', AttachmentDocumentType.SERVICE_ORDER),
          ]),
        ],
      } as unknown as Partial<CaseFull>)
    );

    const imageIDs = capturedCarousels.map((carousel) =>
      carousel.images.map((image) => image.id)
    );

    expect(imageIDs).toEqual([['foto-1'], ['os-1']]);
  });

  it('flags a required document that was never uploaded', () => {
    renderMoments(
      buildCase({
        type: CaseServiceType.INSPECTION,
        comments: [
          comment('c2', CommentType.RESOLUTION, [
            attachment('foto-1', AttachmentDocumentType.PHOTO),
          ]),
        ],
      } as unknown as Partial<CaseFull>)
    );

    expect(screen.getAllByText('Não enviado')).toHaveLength(2);
  });

  it('renders the closing moments after the documents', () => {
    renderMoments(
      buildCase({
        type: CaseServiceType.INSPECTION,
        comments: [
          comment('c3', CommentType.REPORT, [], 'Laudo concluído'),
          comment('c4', CommentType.REJECTION, [], 'Reprovado pela seguradora'),
          comment('c5', CommentType.PAYMENT_PROOF, [], 'Pago'),
        ],
      } as unknown as Partial<CaseFull>)
    );

    const titles = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);

    expect(titles.slice(-3)).toEqual([
      'Conclusão do laudo',
      'Reprovação',
      'Comprovante de pagamento',
    ]);
  });

  it('does not show the advance-requested badge when the flag is not set', () => {
    renderMoments(buildCase());

    expect(screen.queryByText('Adiantamento pendente')).not.toBeInTheDocument();
  });

  it('shows the advance-requested badge and a "Marcar pagamento" button for admins when the flag is set', () => {
    renderMoments(buildCase({ metadata: { advance_requested: 'true' } }));

    expect(screen.getByText('Adiantamento pendente')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Marcar pagamento' })
    ).toBeInTheDocument();
  });

  it('shows the advance-requested badge but not the button for non-admins', () => {
    renderMoments(
      buildCase({ metadata: { advance_requested: 'true' } }),
      UserRole.OPERATOR
    );

    expect(screen.getByText('Adiantamento pendente')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Marcar pagamento' })
    ).not.toBeInTheDocument();
  });

  it('opens the advance payment modal when the admin clicks "Marcar pagamento"', () => {
    renderMoments(buildCase({ metadata: { advance_requested: 'true' } }));

    expect(
      screen.queryByTestId('advance-payment-modal')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Marcar pagamento' }));

    expect(screen.getByTestId('advance-payment-modal')).toBeInTheDocument();
  });
});
