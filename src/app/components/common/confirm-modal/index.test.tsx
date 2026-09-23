import { render, screen, waitFor } from '@testing-library/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from '../../../context/SnackbarProvider';
import { ConfirmModal } from './index';

let capturedDispatch: ((formData: FormData) => void) | undefined;

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

jest.mock('../../../context/SnackbarProvider', () => ({
  useSnackbar: jest.fn(),
}));
jest.mock('next-auth/react', () => ({ signOut: jest.fn() }));
jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

const mockUseSnackbar = useSnackbar as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockShowSnackbar = jest.fn();
const mockRefresh = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  capturedDispatch = undefined;
  mockUseSnackbar.mockReturnValue({ showSnackbar: mockShowSnackbar });
  mockUseRouter.mockReturnValue({ refresh: mockRefresh });
});

describe('ConfirmModal', () => {
  it('renders the title and hidden fields', () => {
    const mockAction = jest.fn();
    render(
      <ConfirmModal
        isOpen
        onClose={jest.fn()}
        title="Tem certeza que deseja desativar o técnico?"
        action={mockAction}
        hiddenFields={{ partner_id: 'abc-123' }}
      />
    );

    expect(
      screen.getByText('Tem certeza que deseja desativar o técnico?')
    ).toBeInTheDocument();
    expect(document.querySelector('input[name="partner_id"]')).toHaveValue(
      'abc-123'
    );
  });

  it('renders custom confirm and cancel labels', () => {
    render(
      <ConfirmModal
        isOpen
        onClose={jest.fn()}
        title="Confirmar?"
        action={jest.fn()}
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
      />
    );

    expect(screen.getByText('Confirmar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('shows success message, refreshes, closes and fires onSuccess on success', async () => {
    const mockActionFn = jest
      .fn()
      .mockResolvedValue({ success: true, message: 'desativado!' });
    const onClose = jest.fn();
    const onSuccess = jest.fn();
    render(
      <ConfirmModal
        isOpen
        onClose={onClose}
        title="Confirmar?"
        action={mockActionFn}
        onSuccess={onSuccess}
      />
    );

    capturedDispatch!(new FormData());

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mockRefresh).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith('desativado!', 'success');
  });

  it('signs the user out and shows an error on an unauthorized response', async () => {
    const mockActionFn = jest.fn().mockResolvedValue({
      success: false,
      unauthorized: true,
      message: 'usuário não autorizado',
    });
    render(
      <ConfirmModal
        isOpen
        onClose={jest.fn()}
        title="Confirmar?"
        action={mockActionFn}
      />
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

  it('shows an error message without closing on a failed response', async () => {
    const mockActionFn = jest
      .fn()
      .mockResolvedValue({ success: false, message: 'falha na exclusão' });
    const onClose = jest.fn();
    render(
      <ConfirmModal
        isOpen
        onClose={onClose}
        title="Confirmar?"
        action={mockActionFn}
      />
    );

    capturedDispatch!(new FormData());

    await waitFor(() =>
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        'falha na exclusão',
        'error'
      )
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it('handles a settled state once even when its callbacks change identity', async () => {
    const mockActionFn = jest
      .fn()
      .mockResolvedValue({ success: true, message: 'resetado!' });
    const { rerender } = render(
      <ConfirmModal
        isOpen
        onClose={jest.fn()}
        title="Confirmar?"
        action={mockActionFn}
      />
    );

    capturedDispatch!(new FormData());
    await waitFor(() => expect(mockRefresh).toHaveBeenCalledTimes(1));

    // Hand the effect brand-new callback identities on every render, which is
    // what an unmemoized snackbar context and inline arrow props used to do.
    // Re-running the effect here would replay refresh() into an endless loop
    // of RSC requests.
    for (let i = 0; i < 5; i += 1) {
      mockUseSnackbar.mockReturnValue({ showSnackbar: jest.fn() });
      rerender(
        <ConfirmModal
          isOpen
          onClose={jest.fn()}
          title="Confirmar?"
          action={mockActionFn}
        />
      );
    }

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
});
