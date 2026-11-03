import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from '../../../../context/SnackbarProvider';
import { updateCaseMetadata } from '../../../../services/cases';
import { addComment } from '../../../../services/comments';
import { CaseFull, CaseStatus } from '@/app/types/case';
import { OnGoingStatusForm } from '../ongoing_case';

// React 18 no ambiente de teste não traz useActionState/useFormStatus; o
// formulário só precisa que o dispatch chame a action, como em
// confirm-modal/index.test.tsx.
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
// testes anexa arquivo de verdade; o mock devolve um anexo para o envio ao
// laudo passar pela exigência de no mínimo 1 anexo.
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

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSnackbar.mockReturnValue({ showSnackbar: mockShowSnackbar });
  mockUseRouter.mockReturnValue({ refresh: mockRefresh });
  mockAddComment.mockResolvedValue({ success: true, message: 'ok' });
  mockUpdateCaseMetadata.mockResolvedValue({ success: true, message: 'ok' });
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

    expect(
      screen.getByRole('button', { name: 'Enviar para laudo' })
    ).not.toBeDisabled();
  });
});
