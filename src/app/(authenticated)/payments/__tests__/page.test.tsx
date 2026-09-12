import { render, screen } from '@testing-library/react';
import { getCurrentUser } from '../../../libs/session';
import { redirect } from 'next/navigation';
import { fetchCasesFull } from '../../../services/cases';
import { fetchPartners, getPartnerByID } from '../../../services/partners';
import { fetchTransactions } from '../../../services/transactions';
import Page from '../page';
import {
  buildCaseFull,
  buildCustomer,
  buildPartner,
  buildTransaction,
  buildSearchResponse,
} from '../../../components/payments/__fixtures__/builders';

jest.mock('../../../libs/session', () => ({ getCurrentUser: jest.fn() }));
jest.mock('next-auth/react', () => ({ signOut: jest.fn() }));
jest.mock('next/navigation', () => ({
  redirect: jest.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

jest.mock('../../../services/cases', () => ({ fetchCasesFull: jest.fn() }));
jest.mock('../../../services/partners', () => ({
  fetchPartners: jest.fn(),
  getPartnerByID: jest.fn(),
}));
jest.mock('../../../services/transactions', () => ({
  fetchTransactions: jest.fn(),
}));

jest.mock('../../../components/payments/table', () => ({
  __esModule: true,
  default: ({
    transactions,
    partners,
    initialPage,
  }: {
    transactions: {
      result: { external_reference: string; customer_name?: string }[];
    };
    partners: { partner_id: string }[];
    initialPage?: number;
  }) => (
    <div data-testid="payment-table">
      <span data-testid="transaction-count">{transactions.result.length}</span>
      <span data-testid="customer-name">
        {transactions.result[0]?.customer_name}
      </span>
      <span data-testid="partner-count">{partners?.length ?? 0}</span>
      <span data-testid="initial-page">{initialPage ?? 1}</span>
    </div>
  ),
}));

const mockFetchCasesFull = fetchCasesFull as jest.Mock;
const mockFetchPartners = fetchPartners as jest.Mock;
const mockGetPartnerByID = getPartnerByID as jest.Mock;
const mockFetchTransactions = fetchTransactions as jest.Mock;
const mockGetCurrentUser = getCurrentUser as jest.Mock;
const mockRedirect = redirect as unknown as jest.Mock;

function setupAuthenticatedSession() {
  mockGetCurrentUser.mockResolvedValue({ name: 'Test User', role: 'admin' });
}

function setupServices({
  cases = [buildCaseFull()],
  partner = buildPartner(),
  transactions = [buildTransaction({ description: 'MO', value: 300 })],
  partners = [buildPartner()],
} = {}) {
  mockFetchCasesFull.mockResolvedValue({
    success: true,
    data: buildSearchResponse(cases),
  });
  mockGetPartnerByID.mockResolvedValue({ success: true, data: partner });
  mockFetchTransactions.mockResolvedValue({
    success: true,
    data: transactions,
  });
  mockFetchPartners.mockResolvedValue({
    success: true,
    data: buildSearchResponse(partners),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Payments Page', () => {
  describe('authentication', () => {
    it('should redirect to /login when there is no session', async () => {
      // Arrange
      mockGetCurrentUser.mockResolvedValue(null);
      const searchParams = Promise.resolve({});

      // Act & Assert
      await expect(Page({ searchParams })).rejects.toThrow(
        'NEXT_REDIRECT:/login'
      );
      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });

    it('should not redirect when there is an active session', async () => {
      // Arrange
      setupAuthenticatedSession();
      setupServices();
      const searchParams = Promise.resolve({});

      // Act
      await Page({ searchParams });

      // Assert
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('data fetching', () => {
    it('should fetch cases with base query including sort_order=DESC', async () => {
      // Arrange
      setupAuthenticatedSession();
      setupServices();
      const searchParams = Promise.resolve({});

      // Act
      await Page({ searchParams });

      // Assert
      expect(mockFetchCasesFull).toHaveBeenCalledWith(
        expect.stringContaining('sort_order=DESC'),
        1
      );
    });

    it('should include sinistro in the query when provided', async () => {
      // Arrange
      setupAuthenticatedSession();
      setupServices();
      const searchParams = Promise.resolve({ sinistro: 'SIN-001' });

      // Act
      await Page({ searchParams });

      // Assert
      expect(mockFetchCasesFull).toHaveBeenCalledWith(
        expect.stringContaining('external_reference=SIN-001'),
        1
      );
    });

    it('should include tecnico in the query when provided', async () => {
      // Arrange
      setupAuthenticatedSession();
      setupServices();
      const searchParams = Promise.resolve({ tecnico: 'partner-123' });

      // Act
      await Page({ searchParams });

      // Assert
      expect(mockFetchCasesFull).toHaveBeenCalledWith(
        expect.stringContaining('partner_id=partner-123'),
        1
      );
    });

    it('should include both sinistro and tecnico in the query when both are provided', async () => {
      // Arrange
      setupAuthenticatedSession();
      setupServices();
      const searchParams = Promise.resolve({
        sinistro: 'SIN-001',
        tecnico: 'partner-123',
      });

      // Act
      await Page({ searchParams });

      // Assert
      expect(mockFetchCasesFull).toHaveBeenCalledWith(
        expect.stringMatching(
          /external_reference=SIN-001.*partner_id=partner-123/
        ),
        1
      );
    });

    it('should fetch cases for the given page number', async () => {
      // Arrange
      setupAuthenticatedSession();
      setupServices();
      const searchParams = Promise.resolve({ page: 3 });

      // Act
      await Page({ searchParams });

      // Assert
      expect(mockFetchCasesFull).toHaveBeenCalledWith(expect.any(String), 3);
    });

    it('should fetch partners to populate the filter dropdown', async () => {
      // Arrange
      setupAuthenticatedSession();
      setupServices({
        partners: [buildPartner(), buildPartner({ partner_id: 'partner-456' })],
      });
      const searchParams = Promise.resolve({});

      // Act
      const jsx = await Page({ searchParams });
      render(jsx);

      // Assert
      expect(screen.getByTestId('partner-count').textContent).toBe('2');
    });
  });

  describe('rendering', () => {
    it('should render PaymentTable with the fetched transactions', async () => {
      // Arrange
      setupAuthenticatedSession();
      setupServices({
        cases: [
          buildCaseFull(),
          buildCaseFull({ case_id: 'case-002', external_reference: 'SIN-002' }),
        ],
      });
      const searchParams = Promise.resolve({});

      // Act
      const jsx = await Page({ searchParams });
      render(jsx);

      // Assert
      expect(screen.getByTestId('transaction-count').textContent).toBe('2');
    });

    it('should map the case customer into customer_name on the transaction', async () => {
      // Arrange
      setupAuthenticatedSession();
      setupServices({
        cases: [
          buildCaseFull({
            customer: buildCustomer({
              first_name: 'Ana',
              last_name: 'Pereira',
            }),
          }),
        ],
      });
      const searchParams = Promise.resolve({});

      // Act
      const jsx = await Page({ searchParams });
      render(jsx);

      // Assert
      expect(screen.getByTestId('customer-name').textContent).toBe(
        'Ana Pereira'
      );
    });

    it('should pass the page number to PaymentTable', async () => {
      // Arrange
      setupAuthenticatedSession();
      setupServices();
      const searchParams = Promise.resolve({ page: 2 });

      // Act
      const jsx = await Page({ searchParams });
      render(jsx);

      // Assert
      expect(screen.getByTestId('initial-page').textContent).toBe('2');
    });
  });
});
