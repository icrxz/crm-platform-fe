import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from '../../../../context/SnackbarProvider';
import { changeStatus, updateCaseMetadata } from '../../../../services/cases';
import { deleteAttachment } from '../../../../services/attachments';
import {
  addAttachmentToComment,
  addComment,
} from '../../../../services/comments';
import { Attachment, AttachmentDocumentType } from '@/app/types/attachments';
import { CaseCategory, CaseFull, CaseStatus } from '@/app/types/case';
import { Comment, CommentType } from '@/app/types/comment';
import { OnGoingStatusFormV2 } from '../ongoing_case_v2';

// Mesmo arranjo de ongoing_case.test.tsx: React 18 no ambiente de teste não
// traz useActionState, e jsdom não implementa requestSubmit — o dispatch fica
// guardado para chamar a action do envio para laudo diretamente.
let capturedDispatch: ((formData: FormData) => void) | null = null;

jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    useActionState: (
      action: (state: unknown, formData: FormData) => Promise<unknown>,
      initialState: unknown
    ) => {
      const [state, setState] = actualReact.useState(initialState);
      const dispatch = (formData: FormData) => {
        action(initialState, formData).then(setState);
      };
      capturedDispatch = dispatch;
      return [state, dispatch, false];
    },
  };
});

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormStatus: () => ({ pending: false }),
}));

jest.mock('../../../../services/cases', () => ({
  changeStatus: jest.fn(),
  updateCaseMetadata: jest.fn(),
}));
jest.mock('../../../../services/comments', () => ({
  addComment: jest.fn(),
  addAttachmentToComment: jest.fn(),
}));
jest.mock('../../../../services/attachments', () => ({
  deleteAttachment: jest.fn(),
}));
jest.mock('../../../../context/SnackbarProvider', () => ({
  useSnackbar: jest.fn(),
}));
jest.mock('next-auth/react', () => ({ signOut: jest.fn() }));
jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('../../target-date-modal', () => ({
  __esModule: true,
  default: () => <div data-testid="target-date-modal" />,
}));
jest.mock('../../../common/image-carousel', () => ({
  ImageCarousel: ({ images }: { images: { id: string }[] }) => (
    <div data-testid="carousel">{images.map((i) => i.id).join(',')}</div>
  ),
}));

// Cada uploader devolve o que estiver em mockUploaderAttachments; o tipo do
// documento vem do defaultDocumentType da etapa, como o uploader real faz.
let mockUploaderAttachments: Array<{ key: string }> = [];

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    const { forwardRef, useImperativeHandle } = jest.requireActual('react');
    return forwardRef(
      (props: { defaultDocumentType?: string }, ref: React.Ref<unknown>) => {
        useImperativeHandle(ref, () => ({
          submit: async () =>
            mockUploaderAttachments.map((a) => ({
              ...a,
              document_type: props.defaultDocumentType ?? 'photo',
            })),
          length: mockUploaderAttachments.length,
        }));
        return <div data-testid="uploader" />;
      }
    );
  },
}));

const mockUseSnackbar = useSnackbar as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockAddComment = addComment as jest.Mock;
const mockUpdateCaseMetadata = updateCaseMetadata as jest.Mock;
const mockChangeStatus = changeStatus as jest.Mock;
const mockSignOut = signOut as jest.Mock;
const mockAddAttachmentToComment = addAttachmentToComment as jest.Mock;
const mockDeleteAttachment = deleteAttachment as jest.Mock;
const mockShowSnackbar = jest.fn();
const mockRefresh = jest.fn();

function resolution(...documentTypes: AttachmentDocumentType[]): Comment {
  return stepComment(undefined, ...documentTypes);
}

function stepComment(
  step: string | undefined,
  ...documentTypes: AttachmentDocumentType[]
): Comment {
  return {
    comment_id: `c-${step ?? documentTypes.join('-')}`,
    comment_type: CommentType.RESOLUTION,
    metadata: step ? { ongoing_step: step } : undefined,
    attachments: documentTypes.map(
      (document_type, index) =>
        ({
          attachment_id: `${document_type}-${index}`,
          url: '/x.png',
          file_name: 'x.png',
          document_type,
        }) as Attachment
    ),
  } as Comment;
}

// Visita no passado: estado em que o wizard aparece. Móveis + reparo exige
// OS e confirmação da cliente.
function buildCase(overrides: Partial<CaseFull> = {}): CaseFull {
  return {
    case_id: 'case-1',
    status: CaseStatus.ONGOING,
    target_date: '2020-01-01T10:00:00Z',
    metadata: {
      category: CaseCategory.FURNITURE,
      ongoing_flow_version: 'v2',
    },
    comments: [],
    ...overrides,
  } as CaseFull;
}

function stepNav() {
  return screen.getByRole('navigation', { name: 'Etapas do atendimento' });
}

function stepButton(name: RegExp) {
  return within(stepNav()).getByRole('button', { name });
}

function stepTitles() {
  return within(stepNav())
    .getAllByRole('button')
    .map((button) => button.getAttribute('aria-label'));
}

function currentStepName() {
  return within(stepNav())
    .getAllByRole('button')
    .find((button) => button.getAttribute('aria-current') === 'step')
    ?.getAttribute('aria-label');
}

function visibleSection(name: string) {
  return screen.getByRole('region', { name });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSnackbar.mockReturnValue({ showSnackbar: mockShowSnackbar });
  mockUseRouter.mockReturnValue({ refresh: mockRefresh });
  mockAddComment.mockResolvedValue({ success: true, message: 'ok' });
  mockUpdateCaseMetadata.mockResolvedValue({ success: true, message: 'ok' });
  mockChangeStatus.mockResolvedValue({ success: true, message: 'ok' });
  mockAddAttachmentToComment.mockResolvedValue({
    success: true,
    message: 'ok',
  });
  mockDeleteAttachment.mockResolvedValue({ success: true, message: 'ok' });
  mockUploaderAttachments = [];
  capturedDispatch = null;
});

describe('OnGoingStatusFormV2 before the visit', () => {
  it('keeps the waiting form of the original flow', () => {
    render(
      <OnGoingStatusFormV2
        crmCase={buildCase({ target_date: '2999-01-01T10:00:00Z' })}
      />
    );

    expect(screen.getByText('Aguardando data da visita')).toBeInTheDocument();
    expect(
      screen.queryByRole('navigation', { name: 'Etapas do atendimento' })
    ).not.toBeInTheDocument();
  });
});

describe('OnGoingStatusFormV2 steps', () => {
  it('lists photos, the required documents and the report submit', () => {
    render(<OnGoingStatusFormV2 crmCase={buildCase()} />);

    expect(stepTitles()).toEqual([
      '1. Fotos do técnico',
      '2. Ordem de serviço',
      '3. Confirmação do cliente',
      '4. Envio para o laudo',
    ]);
    expect(currentStepName()).toBe('1. Fotos do técnico');
  });

  it('drops the customer confirmation step on an inspection and saves the choice', async () => {
    render(<OnGoingStatusFormV2 crmCase={buildCase()} />);

    fireEvent.click(screen.getByRole('radio', { name: 'Vistoria' }));

    expect(stepTitles()).toEqual([
      '1. Fotos do técnico',
      '2. Ordem de serviço',
      '3. Envio para o laudo',
    ]);
    await waitFor(() =>
      expect(mockUpdateCaseMetadata).toHaveBeenCalledWith('case-1', {
        ongoing_step: 'technician_photos',
        ongoing_service_type: 'inspection',
      })
    );
  });

  it('goes back to the first step when the saved step does not apply to the saved type', () => {
    render(
      <OnGoingStatusFormV2
        crmCase={buildCase({
          metadata: {
            category: CaseCategory.FURNITURE,
            ongoing_flow_version: 'v2',
            ongoing_step: 'customer_confirmation',
            ongoing_service_type: 'inspection',
          },
        })}
      />
    );

    expect(currentStepName()).toBe('1. Fotos do técnico');
    expect(stepTitles()).toHaveLength(3);
  });

  it('resumes on the step and service type saved on the case', () => {
    render(
      <OnGoingStatusFormV2
        crmCase={buildCase({
          metadata: {
            category: CaseCategory.FURNITURE,
            ongoing_flow_version: 'v2',
            ongoing_step: 'report',
            ongoing_service_type: 'inspection',
          },
        })}
      />
    );

    expect(currentStepName()).toBe('3. Envio para o laudo');
    expect(visibleSection('Envio para o laudo')).toBeVisible();
  });

  it('falls back to the first step for a saved step it does not know', () => {
    render(
      <OnGoingStatusFormV2
        crmCase={buildCase({
          metadata: {
            category: CaseCategory.FURNITURE,
            ongoing_flow_version: 'v2',
            ongoing_step: 'something-else',
          },
        })}
      />
    );

    expect(currentStepName()).toBe('1. Fotos do técnico');
  });

  it('lets any step be opened and saves where the technician is, without reloading', async () => {
    render(<OnGoingStatusFormV2 crmCase={buildCase()} />);

    fireEvent.click(stepButton(/Envio para o laudo/));

    expect(visibleSection('Envio para o laudo')).toBeVisible();
    expect(
      screen.queryByRole('radio', { name: 'Vistoria' })
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(mockUpdateCaseMetadata).toHaveBeenCalledWith('case-1', {
        ongoing_step: 'report',
        ongoing_service_type: 'repair',
      })
    );
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('moves on with "Próxima etapa"', () => {
    render(<OnGoingStatusFormV2 crmCase={buildCase()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Próxima etapa' }));

    expect(visibleSection('Ordem de serviço')).toBeVisible();
  });

  it('reports a failure to save the position', async () => {
    mockUpdateCaseMetadata.mockResolvedValue({
      success: false,
      message: 'sessão expirada',
      unauthorized: true,
    });
    render(<OnGoingStatusFormV2 crmCase={buildCase()} />);

    fireEvent.click(stepButton(/Envio para o laudo/));

    await waitFor(() =>
      expect(mockShowSnackbar).toHaveBeenCalledWith('sessão expirada', 'error')
    );
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('marks a step as sent once the technician posted its document', () => {
    render(
      <OnGoingStatusFormV2
        crmCase={buildCase({
          comments: [resolution(AttachmentDocumentType.SERVICE_ORDER)],
        })}
      />
    );

    expect(stepTitles()[1]).toBe('2. Ordem de serviço (concluída)');
    expect(stepTitles()[0]).toBe('1. Fotos do técnico');
  });
});

describe('OnGoingStatusFormV2 posting a step', () => {
  it('asks for a file before posting', async () => {
    render(<OnGoingStatusFormV2 crmCase={buildCase()} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Enviar fotos do técnico' })
    );

    expect(
      await screen.findByText('Selecione ao menos um arquivo antes de enviar.')
    ).toBeInTheDocument();
    expect(mockAddComment).not.toHaveBeenCalled();
  });

  it('posts the step right away as a technician comment tagged with its document', async () => {
    mockUploaderAttachments = [{ key: 'os.png' }];
    render(<OnGoingStatusFormV2 crmCase={buildCase()} />);

    fireEvent.click(stepButton(/Ordem de serviço/));
    fireEvent.click(
      screen.getByRole('button', { name: 'Enviar ordem de serviço' })
    );

    await waitFor(() => expect(mockAddComment).toHaveBeenCalled());
    const [caseId, formData, attachments, commentType, metadata] =
      mockAddComment.mock.calls[0];
    expect(caseId).toBe('case-1');
    expect((formData as FormData).get('content')).toBe('Ordem de serviço');
    expect(attachments).toEqual([
      { key: 'os.png', document_type: 'service_order' },
    ]);
    expect(commentType).toBe(CommentType.RESOLUTION);
    expect(metadata).toEqual({ ongoing_step: 'service_order' });
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
    expect(mockShowSnackbar).toHaveBeenCalledWith('ok', 'success');
  });

  it('signs the user out when posting the step is unauthorized', async () => {
    mockUploaderAttachments = [{ key: 'foto.png' }];
    mockAddComment.mockResolvedValue({
      success: false,
      message: 'sessão expirada',
      unauthorized: true,
    });
    render(<OnGoingStatusFormV2 crmCase={buildCase()} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Enviar fotos do técnico' })
    );

    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});

describe('OnGoingStatusFormV2 sending to the report', () => {
  function reportFormData() {
    const formData = new FormData();
    formData.append('content', 'Troquei a dobradiça');
    formData.append('type', 'repair');
    return formData;
  }

  it('blocks and lists everything still missing', async () => {
    render(
      <OnGoingStatusFormV2
        crmCase={buildCase({
          comments: [resolution(AttachmentDocumentType.SERVICE_ORDER)],
        })}
      />
    );

    capturedDispatch!(reportFormData());

    expect(
      await screen.findByText(
        'Antes de enviar para o laudo, falta enviar: Foto, Confirmação/validação da cliente.'
      )
    ).toBeInTheDocument();
    expect(mockChangeStatus).not.toHaveBeenCalled();
  });

  it('moves the case to Report without re-sending the files', async () => {
    render(
      <OnGoingStatusFormV2
        crmCase={buildCase({
          comments: [
            resolution(AttachmentDocumentType.PHOTO),
            resolution(
              AttachmentDocumentType.SERVICE_ORDER,
              AttachmentDocumentType.CUSTOMER_CONFIRMATION
            ),
          ],
        })}
      />
    );

    const formData = reportFormData();
    capturedDispatch!(formData);

    await waitFor(() =>
      expect(mockChangeStatus).toHaveBeenCalledWith(
        'case-1',
        CaseStatus.REPORT,
        formData
      )
    );
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
  });

  it('sends the chosen service type along with the conclusion', () => {
    render(<OnGoingStatusFormV2 crmCase={buildCase()} />);

    fireEvent.click(screen.getByRole('radio', { name: 'Vistoria' }));

    const hiddenType = document.querySelector(
      'input[type="hidden"][name="type"]'
    ) as HTMLInputElement;
    expect(hiddenType.value).toBe('inspection');
  });

  it('signs the user out when the status change is unauthorized', async () => {
    mockChangeStatus.mockResolvedValue({
      success: false,
      message: 'sessão expirada',
      unauthorized: true,
    });
    render(
      <OnGoingStatusFormV2
        crmCase={buildCase({
          metadata: {
            category: CaseCategory.FURNITURE,
            ongoing_flow_version: 'v2',
            ongoing_service_type: 'inspection',
          },
          comments: [
            resolution(
              AttachmentDocumentType.PHOTO,
              AttachmentDocumentType.SERVICE_ORDER
            ),
          ],
        })}
      />
    );

    capturedDispatch!(reportFormData());

    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});

describe('OnGoingStatusFormV2 D+ repair', () => {
  function dPlusCase(comments: Comment[] = []) {
    return buildCase({
      metadata: { category: CaseCategory.D_PLUS, ongoing_flow_version: 'v2' },
      comments,
    });
  }

  it('collects the warranty term in the customer confirmation step, not in a step of its own', () => {
    render(<OnGoingStatusFormV2 crmCase={dPlusCase()} />);

    expect(stepTitles()).toEqual([
      '1. Fotos do técnico',
      '2. Ordem de serviço',
      '3. Confirmação do cliente',
      '4. Envio para o laudo',
    ]);

    fireEvent.click(stepButton(/Confirmação do cliente/));
    const section = visibleSection('Confirmação do cliente');
    expect(
      within(section).getByText('Confirmação/validação da cliente')
    ).toBeInTheDocument();
    expect(within(section).getByText('Termo de garantia')).toBeInTheDocument();
    expect(
      within(section).getByText(
        'Marque cada arquivo com o documento que ele é.'
      )
    ).toBeInTheDocument();
  });

  it('only completes the step once both documents were sent', () => {
    const { rerender } = render(
      <OnGoingStatusFormV2
        crmCase={dPlusCase([
          resolution(AttachmentDocumentType.CUSTOMER_CONFIRMATION),
        ])}
      />
    );
    expect(stepTitles()[2]).toBe('3. Confirmação do cliente');

    rerender(
      <OnGoingStatusFormV2
        crmCase={dPlusCase([
          resolution(
            AttachmentDocumentType.CUSTOMER_CONFIRMATION,
            AttachmentDocumentType.WARRANTY_TERM
          ),
        ])}
      />
    );
    expect(stepTitles()[2]).toBe('3. Confirmação do cliente (concluída)');
  });
});

describe('OnGoingStatusFormV2 layout', () => {
  it('switches steps from the compact select used on small screens', () => {
    render(<OnGoingStatusFormV2 crmCase={buildCase()} />);

    fireEvent.change(
      within(stepNav()).getByLabelText('Etapas do atendimento'),
      { target: { value: 'report' } }
    );

    expect(visibleSection('Envio para o laudo')).toBeVisible();
  });

  it('keeps the comment box collapsed until asked for', () => {
    render(<OnGoingStatusFormV2 crmCase={buildCase()} />);

    expect(screen.queryByLabelText('Comentário')).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Comentário / adiantamento' })
    );

    expect(screen.getByLabelText('Comentário')).toBeInTheDocument();
  });
});

describe('OnGoingStatusFormV2 editing a sent step', () => {
  it('adds new files to the comment the step already created', async () => {
    mockUploaderAttachments = [{ key: 'os-2.png' }, { key: 'os-3.png' }];
    render(
      <OnGoingStatusFormV2
        crmCase={buildCase({
          comments: [
            stepComment('service_order', AttachmentDocumentType.SERVICE_ORDER),
          ],
        })}
      />
    );

    fireEvent.click(stepButton(/Ordem de serviço/));
    fireEvent.click(
      screen.getByRole('button', { name: 'Enviar ordem de serviço' })
    );

    await waitFor(() =>
      expect(mockAddAttachmentToComment).toHaveBeenCalledTimes(2)
    );
    expect(mockAddAttachmentToComment.mock.calls).toEqual([
      ['c-service_order', { key: 'os-2.png', document_type: 'service_order' }],
      ['c-service_order', { key: 'os-3.png', document_type: 'service_order' }],
    ]);
    expect(mockAddComment).not.toHaveBeenCalled();
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
  });

  it('stops at the first file that fails and still reloads what was saved', async () => {
    mockUploaderAttachments = [{ key: 'a.png' }, { key: 'b.png' }];
    mockAddAttachmentToComment
      .mockResolvedValueOnce({ success: true, message: 'ok' })
      .mockResolvedValueOnce({ success: false, message: 'falha ao anexar' });
    render(
      <OnGoingStatusFormV2
        crmCase={buildCase({
          comments: [
            stepComment('technician_photos', AttachmentDocumentType.PHOTO),
          ],
        })}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Enviar fotos do técnico' })
    );

    await waitFor(() =>
      expect(mockShowSnackbar).toHaveBeenCalledWith('falha ao anexar', 'error')
    );
    expect(mockAddAttachmentToComment).toHaveBeenCalledTimes(2);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('removes a file sent by mistake', async () => {
    render(
      <OnGoingStatusFormV2
        crmCase={buildCase({
          comments: [
            stepComment('technician_photos', AttachmentDocumentType.PHOTO),
          ],
        })}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remover x.png' }));

    await waitFor(() =>
      expect(mockDeleteAttachment).toHaveBeenCalledWith('photo-0')
    );
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      'Arquivo removido',
      'success'
    );
  });

  it('reports a file it is not allowed to remove', async () => {
    mockDeleteAttachment.mockResolvedValue({
      success: false,
      message: 'sem permissão',
    });
    render(
      <OnGoingStatusFormV2
        crmCase={buildCase({
          comments: [
            stepComment('technician_photos', AttachmentDocumentType.PHOTO),
          ],
        })}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remover x.png' }));

    await waitFor(() =>
      expect(mockShowSnackbar).toHaveBeenCalledWith('sem permissão', 'error')
    );
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
