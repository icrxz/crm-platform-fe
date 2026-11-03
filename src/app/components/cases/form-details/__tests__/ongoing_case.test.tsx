import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from '../../../../context/SnackbarProvider';
import { changeStatus, updateCaseMetadata } from '../../../../services/cases';
import { addComment } from '../../../../services/comments';
import { CaseFull, CaseStatus } from '@/app/types/case';
import { OnGoingStatusForm } from '../ongoing_case';

// React 18 no ambiente de teste não traz useActionState/useFormStatus; o
// formulário só precisa que o dispatch chame a action, como em
// confirm-modal/index.test.tsx. O dispatch também é guardado aqui fora (em vez
// de só disparado via submit do <form>) porque jsdom não implementa
// HTMLFormElement.requestSubmit — chamar a action real diretamente é o único
// jeito de cobrir o fluxo de "Enviar para laudo" neste ambiente.
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

jest.mock('react-dom', () => {
  const actualReactDOM = jest.requireActual('react-dom');
  return {
    ...actualReactDOM,
    useFormStatus: () => ({ pending: false }),
  };
});

jest.mock('../../../../services/cases', () => ({
  changeStatus: jest.fn(),
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
jest.mock('../../target-date-modal', () => ({
  __esModule: true,
  default: () => <div data-testid="target-date-modal" />,
}));

// O uploader real entra por next/dynamic (ssr:false, Uppy). Nenhum destes
// testes anexa arquivo de verdade; o mock devolve os anexos configurados em
// `mockUploaderAttachments` (1 por padrão, para passar pela exigência de no
// mínimo 1 anexo), que cada teste pode trocar para exercitar o caminho sem
// anexo.
let mockUploaderAttachments: Array<{ key: string }> = [{ key: 'foto.png' }];

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    const { forwardRef, useImperativeHandle } = jest.requireActual('react');
    return forwardRef((_props: unknown, ref: React.Ref<unknown>) => {
      useImperativeHandle(ref, () => ({
        submit: async () => mockUploaderAttachments,
        length: mockUploaderAttachments.length,
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
const mockRefresh = jest.fn();

// Data de visita no passado: é o estado em que o formulário libera o envio
// para laudo.
function buildCase(overrides: Partial<CaseFull> = {}): CaseFull {
  return {
    case_id: 'case-1',
    status: CaseStatus.ONGOING,
    target_date: '2020-01-01T10:00:00Z',
    metadata: {},
    ...overrides,
  } as CaseFull;
}

function typeContent(text: string) {
  fireEvent.change(screen.getByLabelText('Informações adicionais'), {
    target: { value: text },
  });
}

const mockChangeStatus = changeStatus as jest.Mock;
const mockSignOut = jest.requireMock('next-auth/react').signOut as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSnackbar.mockReturnValue({ showSnackbar: mockShowSnackbar });
  mockUseRouter.mockReturnValue({ refresh: mockRefresh });
  mockAddComment.mockResolvedValue({ success: true, message: 'ok' });
  mockUpdateCaseMetadata.mockResolvedValue({ success: true, message: 'ok' });
  mockChangeStatus.mockResolvedValue({ success: true, message: 'ok' });
  mockUploaderAttachments = [{ key: 'foto.png' }];
  capturedDispatch = null;
});

describe('OnGoingStatusForm advance request', () => {
  it('sends what the partner typed as the comment content', async () => {
    render(<OnGoingStatusForm crmCase={buildCase()} />);

    typeContent('Preciso de adiantamento para comprar a placa');
    fireEvent.click(
      screen.getByRole('button', { name: 'Solicitar Adiantamento/Peças' })
    );

    await waitFor(() => expect(mockAddComment).toHaveBeenCalled());
    const formData = mockAddComment.mock.calls[0][1] as FormData;
    expect(formData.get('content')).toBe(
      'Preciso de adiantamento para comprar a placa'
    );
  });

  it('refuses to send an empty request', async () => {
    render(<OnGoingStatusForm crmCase={buildCase()} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Solicitar Adiantamento/Peças' })
    );

    expect(
      await screen.findByText(
        'Descreva a solicitação em "Informações adicionais" antes de solicitar o adiantamento.'
      )
    ).toBeInTheDocument();
    expect(mockAddComment).not.toHaveBeenCalled();
  });

  // A flag é uma só, mas cada pedido é um comentário novo: o técnico pode
  // precisar de mais de um adiantamento no mesmo caso.
  it('stays enabled when the case already has a pending advance', async () => {
    render(
      <OnGoingStatusForm
        crmCase={buildCase({ metadata: { advance_requested: 'true' } })}
      />
    );

    const button = screen.getByRole('button', {
      name: 'Solicitar Adiantamento/Peças',
    });
    expect(button).not.toBeDisabled();

    typeContent('Segundo adiantamento');
    fireEvent.click(button);

    await waitFor(() => expect(mockAddComment).toHaveBeenCalledTimes(1));
    expect(mockUpdateCaseMetadata).toHaveBeenCalledWith('case-1', {
      advance_requested: 'true',
    });
  });

  it('files each request as its own comment', async () => {
    render(<OnGoingStatusForm crmCase={buildCase()} />);

    const button = screen.getByRole('button', {
      name: 'Solicitar Adiantamento/Peças',
    });

    typeContent('Primeiro pedido');
    fireEvent.click(button);
    await waitFor(() => expect(mockAddComment).toHaveBeenCalledTimes(1));

    typeContent('Segundo pedido');
    fireEvent.click(button);
    await waitFor(() => expect(mockAddComment).toHaveBeenCalledTimes(2));

    const contents = mockAddComment.mock.calls.map((call) =>
      (call[1] as FormData).get('content')
    );
    expect(contents).toEqual(['Primeiro pedido', 'Segundo pedido']);
  });

  // O adiantamento é assunto entre técnico e admin; o laudo não espera por ele.
  // jsdom não implementa HTMLFormElement.requestSubmit, então o envio em si não
  // roda aqui — o que importa é que nada no formulário trave esse caminho.
  it('leaves the report submit available while an advance is still pending', () => {
    render(
      <OnGoingStatusForm
        crmCase={buildCase({ metadata: { advance_requested: 'true' } })}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Avançar para dados do laudo' })
    );

    expect(
      screen.getByRole('button', { name: 'Enviar para laudo' })
    ).not.toBeDisabled();
  });
});

describe('OnGoingStatusForm two-step flow', () => {
  it('starts on the attendance step, hiding the report fields', () => {
    render(<OnGoingStatusForm crmCase={buildCase()} />);

    expect(screen.getByLabelText('Informações adicionais')).toBeVisible();
    expect(screen.getByLabelText('Conclusão do atendimento')).not.toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Enviar para laudo' })
    ).not.toBeInTheDocument();
  });

  it('does not offer advancing to the report step before the target date', () => {
    render(
      <OnGoingStatusForm
        crmCase={buildCase({ target_date: '2999-01-01T10:00:00Z' })}
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Avançar para dados do laudo' })
    ).not.toBeInTheDocument();
  });

  it('moves to the report step and back, keeping each step field visible only on its own step', () => {
    render(<OnGoingStatusForm crmCase={buildCase()} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Avançar para dados do laudo' })
    );

    expect(screen.getByLabelText('Conclusão do atendimento')).toBeVisible();
    expect(screen.getByLabelText('Informações adicionais')).not.toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Enviar para laudo' })
    ).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(screen.getByLabelText('Informações adicionais')).toBeVisible();
    expect(screen.getByLabelText('Conclusão do atendimento')).not.toBeVisible();
  });

  it('keeps what was typed in the report step after navigating back and forward', () => {
    render(<OnGoingStatusForm crmCase={buildCase()} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Avançar para dados do laudo' })
    );
    fireEvent.change(screen.getByLabelText('Conclusão do atendimento'), {
      target: { value: 'Troquei a peça X' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Avançar para dados do laudo' })
    );

    expect(screen.getByLabelText('Conclusão do atendimento')).toHaveValue(
      'Troquei a peça X'
    );
  });
});

describe('OnGoingStatusForm add comment', () => {
  it('posts the typed content as a plain comment and clears the field', async () => {
    render(<OnGoingStatusForm crmCase={buildCase()} />);

    typeContent('Cliente não estava em casa');
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar comentário' })
    );

    await waitFor(() => expect(mockAddComment).toHaveBeenCalled());
    const formData = mockAddComment.mock.calls[0][1] as FormData;
    expect(formData.get('content')).toBe('Cliente não estava em casa');
    await waitFor(() =>
      expect(screen.getByLabelText('Informações adicionais')).toHaveValue('')
    );
    expect(mockShowSnackbar).toHaveBeenCalledWith('ok', 'success');
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('signs the user out when adding a comment fails as unauthorized', async () => {
    mockAddComment.mockResolvedValue({
      success: false,
      message: 'sessão expirada',
      unauthorized: true,
    });

    render(<OnGoingStatusForm crmCase={buildCase()} />);

    typeContent('Qualquer coisa');
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar comentário' })
    );

    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    expect(mockShowSnackbar).toHaveBeenCalledWith('sessão expirada', 'error');
  });
});

describe('OnGoingStatusForm advance request failures', () => {
  it('signs the user out when the comment itself is unauthorized', async () => {
    mockAddComment.mockResolvedValue({
      success: false,
      message: 'sessão expirada',
      unauthorized: true,
    });

    render(<OnGoingStatusForm crmCase={buildCase()} />);

    typeContent('Preciso de uma peça');
    fireEvent.click(
      screen.getByRole('button', { name: 'Solicitar Adiantamento/Peças' })
    );

    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    expect(mockUpdateCaseMetadata).not.toHaveBeenCalled();
  });

  it('signs the user out when flagging the metadata is unauthorized', async () => {
    mockUpdateCaseMetadata.mockResolvedValue({
      success: false,
      message: 'sessão expirada',
      unauthorized: true,
    });

    render(<OnGoingStatusForm crmCase={buildCase()} />);

    typeContent('Preciso de uma peça');
    fireEvent.click(
      screen.getByRole('button', { name: 'Solicitar Adiantamento/Peças' })
    );

    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
  });
});

// jsdom não implementa HTMLFormElement.requestSubmit, então não dá para
// disparar o submit clicando no botão real. O `capturedDispatch` chama a
// action do form diretamente — é o mesmo valor que o React passaria para
// `<form action={...}>` em produção.
describe('OnGoingStatusForm send to report (status change)', () => {
  function buildReportFormData(overrides: Record<string, string> = {}) {
    const formData = new FormData();
    formData.append('content', overrides.content ?? 'Troquei o disjuntor');
    formData.append('type', overrides.type ?? 'repair');
    return formData;
  }

  it('shows an error and does not change the status without at least one attachment', async () => {
    mockUploaderAttachments = [];
    render(<OnGoingStatusForm crmCase={buildCase()} />);

    expect(capturedDispatch).not.toBeNull();
    capturedDispatch!(buildReportFormData());

    expect(
      await screen.findByText('Deve haver no mínimo 1 anexo.')
    ).toBeInTheDocument();
    expect(mockChangeStatus).not.toHaveBeenCalled();
  });

  it('changes the case status to REPORT with the report content, type and attachments', async () => {
    render(<OnGoingStatusForm crmCase={buildCase()} />);

    const formData = buildReportFormData({
      content: 'Troquei o disjuntor',
      type: 'inspection',
    });
    capturedDispatch!(formData);

    await waitFor(() => expect(mockChangeStatus).toHaveBeenCalled());
    expect(mockChangeStatus).toHaveBeenCalledWith(
      'case-1',
      CaseStatus.REPORT,
      formData,
      [{ key: 'foto.png' }]
    );
    await waitFor(() =>
      expect(mockShowSnackbar).toHaveBeenCalledWith('ok', 'success')
    );
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('signs the user out when the status change comes back unauthorized', async () => {
    mockChangeStatus.mockResolvedValue({
      success: false,
      message: 'sessão expirada',
      unauthorized: true,
    });

    render(<OnGoingStatusForm crmCase={buildCase()} />);
    capturedDispatch!(buildReportFormData());

    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    expect(mockShowSnackbar).toHaveBeenCalledWith('sessão expirada', 'error');
  });
});
