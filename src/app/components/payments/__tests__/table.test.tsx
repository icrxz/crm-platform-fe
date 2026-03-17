import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import PaymentTable from '../table';
import {
  buildPartner,
  buildTransactionItem,
  buildSearchResponse,
} from '../__fixtures__/builders';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('../search-bar', () => ({
  __esModule: true,
  default: () => <div data-testid="payments-search-bar" />,
}));

jest.mock('@heroui/pagination', () => ({
  Pagination: ({
    onChange,
    total,
    page,
  }: {
    onChange: (page: number) => void;
    total: number;
    page: number;
  }) => (
    <div data-testid="pagination">
      <span data-testid="pagination-total">{total}</span>
      <span data-testid="pagination-current">{page}</span>
      <button onClick={() => onChange(2)}>Go to page 2</button>
      <button onClick={() => onChange(3)}>Go to page 3</button>
    </div>
  ),
}));

jest.mock('../confirm-payment', () => ({
  ConfirmPaymentModal: () => <div data-testid="confirm-payment-modal" />,
}));

jest.mock('../edit-payment', () => ({
  EditPaymentModal: () => <div data-testid="edit-payment-modal" />,
}));

const mockPush = jest.fn();

function setupMocks(searchParamsEntries: Record<string, string> = {}) {
  const params = new URLSearchParams(searchParamsEntries);
  (useSearchParams as jest.Mock).mockReturnValue({
    toString: () => params.toString(),
    get: (key: string) => params.get(key),
  });
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PaymentTable', () => {
  describe('rendering', () => {
    it('should render the page title', () => {
      // Arrange
      setupMocks();
      const transactions = buildSearchResponse([]);

      // Act
      render(<PaymentTable transactions={transactions} />);

      // Assert
      expect(screen.getByText('Pagamentos')).toBeInTheDocument();
    });

    it('should render the search bar', () => {
      // Arrange
      setupMocks();
      const transactions = buildSearchResponse([]);

      // Act
      render(<PaymentTable transactions={transactions} />);

      // Assert
      expect(screen.getByTestId('payments-search-bar')).toBeInTheDocument();
    });

    it('should render transaction data in the table', () => {
      // Arrange
      setupMocks();
      const transaction = buildTransactionItem({
        external_reference: 'SIN-001',
        partner_name: 'João Silva',
      });
      const transactions = buildSearchResponse([transaction]);

      // Act
      render(<PaymentTable transactions={transactions} />);

      // Assert
      expect(screen.getByText('SIN-001')).toBeInTheDocument();
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    it('should render the pagination with correct total pages', () => {
      // Arrange
      setupMocks();
      const transactions = buildSearchResponse([buildTransactionItem()], {
        total: 20,
        limit: 10,
      });

      // Act
      render(<PaymentTable transactions={transactions} initialPage={1} />);

      // Assert
      expect(screen.getByTestId('pagination-total').textContent).toBe('2');
      expect(screen.getByTestId('pagination-current').textContent).toBe('1');
    });

    it('should render partner list inside the search bar', () => {
      // Arrange
      setupMocks();
      const partner = buildPartner({ partner_id: 'partner-abc' });
      const transactions = buildSearchResponse([]);

      // Act
      render(<PaymentTable transactions={transactions} partners={[partner]} />);

      // Assert
      expect(screen.getByTestId('payments-search-bar')).toBeInTheDocument();
    });
  });

  describe('pagination', () => {
    it('should preserve sinistro and tecnico params when changing page', () => {
      // Arrange
      setupMocks({ sinistro: 'SIN-001', tecnico: 'partner-123' });
      const transactions = buildSearchResponse([buildTransactionItem()]);
      render(<PaymentTable transactions={transactions} />);

      // Act
      fireEvent.click(screen.getByText('Go to page 2'));

      // Assert
      expect(mockPush).toHaveBeenCalledWith(
        '?sinistro=SIN-001&tecnico=partner-123&page=2'
      );
    });

    it('should navigate to the correct page when no existing params', () => {
      // Arrange
      setupMocks();
      const transactions = buildSearchResponse([buildTransactionItem()]);
      render(<PaymentTable transactions={transactions} />);

      // Act
      fireEvent.click(screen.getByText('Go to page 3'));

      // Assert
      expect(mockPush).toHaveBeenCalledWith('?page=3');
    });

    it('should overwrite the existing page param when changing page', () => {
      // Arrange
      setupMocks({ page: '1', sinistro: 'SIN-001' });
      const transactions = buildSearchResponse([buildTransactionItem()]);
      render(<PaymentTable transactions={transactions} />);

      // Act
      fireEvent.click(screen.getByText('Go to page 2'));

      // Assert
      expect(mockPush).toHaveBeenCalledWith('?page=2&sinistro=SIN-001');
    });
  });
});
