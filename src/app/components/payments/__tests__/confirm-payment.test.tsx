import { render, screen, waitFor } from '@testing-library/react';
import { forwardRef, useImperativeHandle } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ConfirmPaymentModal } from '../confirm-payment';
import { changeStatus } from '../../../services/cases';
import { useSnackbar } from '../../../context/SnackbarProvider';
import { CreateAttachment } from '../../../types/attachments';

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

const mockUploaderSubmit = jest.fn<
  Promise<CreateAttachment[] | undefined>,
  []
>();

jest.mock('next/dynamic', () => () => {
  return forwardRef(function MockGenericUploader(
    props: { maxFiles?: number; minFiles?: number },
    ref
  ) {
    useImperativeHandle(ref, () => ({
      submit: mockUploaderSubmit,
      length: 0,
    }));
    return (
      <div
        data-testid="uploader"
        data-max-files={props.maxFiles}
        data-min-files={props.minFiles}
      />
    );
  });
});

jest.mock('../../../services/cases', () => ({ changeStatus: jest.fn() }));
jest.mock('../../../context/SnackbarProvider', () => ({
  useSnackbar: jest.fn(),
}));
jest.mock('next-auth/react', () => ({ signOut: jest.fn() }));
jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

const mockChangeStatus = changeStatus as jest.Mock;
const mockUseSnackbar = useSnackbar as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockShowSnackbar = jest.fn();
const mockRefresh = jest.fn();

function buildAttachment(
  overrides: Partial<CreateAttachment> = {}
): CreateAttachment {
  return {
    url: 'https://s3.test/file.png',
    file_name: 'comprovante.png',
    file_extension: 'png',
    size: 1024,
    key: 'attachments/comprovante.png',
    created_by: 'user-1',
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  capturedDispatch = undefined;
  mockUseSnackbar.mockReturnValue({ showSnackbar: mockShowSnackbar });
  mockUseRouter.mockReturnValue({ refresh: mockRefresh });
});

describe('ConfirmPaymentModal', () => {
  it('allows attaching more than one receipt file', () => {
    render(
      <ConfirmPaymentModal isOpen caseId="case-001" onClose={jest.fn()} />
    );

    const uploader = screen.getByTestId('uploader');
    expect(Number(uploader.getAttribute('data-max-files'))).toBeGreaterThan(1);
  });

  it('shows an error and does not confirm the payment when no file is attached', async () => {
    mockUploaderSubmit.mockResolvedValue([]);
    render(
      <ConfirmPaymentModal isOpen caseId="case-001" onClose={jest.fn()} />
    );

    capturedDispatch!(new FormData());

    await waitFor(() =>
      expect(
        screen.getByText('Por favor, adicione pelo menos um arquivo')
      ).toBeInTheDocument()
    );
    expect(mockChangeStatus).not.toHaveBeenCalled();
  });

  it('sends every attached receipt to changeStatus', async () => {
    const attachments = [
      buildAttachment({ file_name: 'comprovante-1.png' }),
      buildAttachment({ file_name: 'comprovante-2.png' }),
    ];
    mockUploaderSubmit.mockResolvedValue(attachments);
    mockChangeStatus.mockResolvedValue({
      success: true,
      message: 'status do caso atualizado com sucesso',
    });
    const onClose = jest.fn();
    render(<ConfirmPaymentModal isOpen caseId="case-001" onClose={onClose} />);

    capturedDispatch!(new FormData());

    await waitFor(() =>
      expect(mockChangeStatus).toHaveBeenCalledWith(
        'case-001',
        'Closed',
        expect.any(FormData),
        attachments
      )
    );
    expect(mockChangeStatus.mock.calls[0][3]).toHaveLength(2);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mockRefresh).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      'status do caso atualizado com sucesso',
      'success'
    );
  });

  it('signs the user out and shows an error on an unauthorized response', async () => {
    mockUploaderSubmit.mockResolvedValue([buildAttachment()]);
    mockChangeStatus.mockResolvedValue({
      success: false,
      unauthorized: true,
      message: 'usuário não autorizado',
    });
    render(
      <ConfirmPaymentModal isOpen caseId="case-001" onClose={jest.fn()} />
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
