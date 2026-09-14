import { render, screen, waitFor } from '@testing-library/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CreateCaseBatchModal } from '../batch-form-modal';
import { createCaseBatch } from '../../../services/cases';
import { fetchContractors } from '../../../services/contractors';
import { useSnackbar } from '../../../context/SnackbarProvider';
import { buildContractor } from '../__fixtures__/builders';

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

jest.mock('../../../services/cases', () => ({ createCaseBatch: jest.fn() }));
jest.mock('../../../services/contractors', () => ({
  fetchContractors: jest.fn(),
}));
jest.mock('../../../context/SnackbarProvider', () => ({
  useSnackbar: jest.fn(),
}));
jest.mock('next-auth/react', () => ({ signOut: jest.fn() }));
jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

const mockCreateCaseBatch = createCaseBatch as jest.Mock;
const mockFetchContractors = fetchContractors as jest.Mock;
const mockUseSnackbar = useSnackbar as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockShowSnackbar = jest.fn();
const mockRefresh = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  capturedDispatch = undefined;
  mockFetchContractors.mockResolvedValue({
    data: { result: [buildContractor({ company_name: 'Seguradora ABC' })] },
  });
  mockUseSnackbar.mockReturnValue({ showSnackbar: mockShowSnackbar });
  mockUseRouter.mockReturnValue({ refresh: mockRefresh });
});

function buildBatchFormData(overrides: Partial<Record<string, string>> = {}) {
  const formData = new FormData();
  formData.set('company', overrides.company ?? 'Seguradora ABC');
  formData.set('category', overrides.category ?? 'furniture');
  formData.set('file', new Blob(['a,b,c']), 'cases.csv');
  return formData;
}

describe('CreateCaseBatchModal', () => {
  describe('rendering', () => {
    it('renders the Seguradora select populated from active contractors', async () => {
      render(<CreateCaseBatchModal isOpen onClose={jest.fn()} />);

      await waitFor(() =>
        expect(mockFetchContractors).toHaveBeenCalledWith(
          'active=true',
          1,
          1000
        )
      );
      expect(
        screen.getByRole('option', { name: 'Seguradora ABC' })
      ).toBeInTheDocument();
    });

    it('renders the Categoria select with Móveis and D+ options', () => {
      render(<CreateCaseBatchModal isOpen onClose={jest.fn()} />);

      expect(screen.getByText('Categoria')).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Móveis' })
      ).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'D+' })).toBeInTheDocument();
    });

    it('renders the file input', () => {
      render(<CreateCaseBatchModal isOpen onClose={jest.fn()} />);

      expect(document.querySelector('input[type="file"]')).toHaveAttribute(
        'accept',
        '.csv,.xls,.xlsx'
      );
    });
  });

  describe('submitting', () => {
    it('sends the selected category and company to createCaseBatch and shows success', async () => {
      mockCreateCaseBatch.mockResolvedValue({ success: true });
      const onClose = jest.fn();
      render(<CreateCaseBatchModal isOpen onClose={onClose} />);

      const formData = buildBatchFormData({ category: 'd+' });
      capturedDispatch!(formData);

      await waitFor(() =>
        expect(mockCreateCaseBatch).toHaveBeenCalledWith(formData)
      );
      expect(formData.get('category')).toBe('d+');
      await waitFor(() => expect(onClose).toHaveBeenCalled());
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        'casos criados com sucesso!',
        'success'
      );
    });

    it('signs the user out and shows an error on an unauthorized response', async () => {
      mockCreateCaseBatch.mockResolvedValue({
        success: false,
        unauthorized: true,
        message: 'usuário não autorizado',
      });
      render(<CreateCaseBatchModal isOpen onClose={jest.fn()} />);

      capturedDispatch!(buildBatchFormData());

      await waitFor(() =>
        expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/login' })
      );
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        'usuário não autorizado',
        'error'
      );
    });

    it('shows a generic error message when the request throws', async () => {
      mockCreateCaseBatch.mockRejectedValue(new Error('network error'));
      render(<CreateCaseBatchModal isOpen onClose={jest.fn()} />);

      capturedDispatch!(buildBatchFormData());

      await waitFor(() =>
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          'algo de errado aconteceu, contate o suporte!',
          'error'
        )
      );
    });
  });
});
