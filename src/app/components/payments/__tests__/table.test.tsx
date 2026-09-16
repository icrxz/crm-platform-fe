import { render, screen, fireEvent, within } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import PaymentTable from '../table';
import {
  buildPartner,
  buildTransactionItem,
  buildSearchResponse,
} from '../__fixtures__/builders';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
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

// The mobile card list duplicates every row's content outside the desktop
// <table> (see ListItemCardGroup) — scope row/cell assertions to the table
// so they don't match both.
function getTable() {
  return within(screen.getByRole('table'));
}

function setupMocks(searchParamsEntries: Record<string, string> = {}) {
  const params = new URLSearchParams(searchParamsEntries);
  (useSearchParams as jest.Mock).mockReturnValue({
    toString: () => params.toString(),
    get: (key: string) => params.get(key),
  });
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (usePathname as jest.Mock).mockReturnValue('/payments');
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
        customer_first_name: 'Maria',
        customer_last_name: 'Souza',
      });
      const transactions = buildSearchResponse([transaction]);

      // Act
      render(<PaymentTable transactions={transactions} />);

      // Assert
      expect(getTable().getByText('SIN-001')).toBeInTheDocument();
      expect(getTable().getByText('João Silva')).toBeInTheDocument();
      expect(getTable().getByText('Maria Souza')).toBeInTheDocument();
    });

    it('should render the Sinistro as a link to the case', () => {
      // Arrange
      setupMocks();
      const transaction = buildTransactionItem({
        case_id: 'case-abc',
        external_reference: 'SIN-001',
      });
      const transactions = buildSearchResponse([transaction]);

      // Act
      render(<PaymentTable transactions={transactions} />);

      // Assert
      expect(getTable().getByText('SIN-001').closest('a')).toHaveAttribute(
        'href',
        '/cases/case-abc'
      );
    });

    it('should render the técnico name as a link to the partner detail page', () => {
      // Arrange
      setupMocks();
      const transaction = buildTransactionItem({
        partner_id: 'partner-123',
        partner_name: 'João Silva',
      });
      const transactions = buildSearchResponse([transaction]);

      // Act
      render(<PaymentTable transactions={transactions} />);

      // Assert
      expect(getTable().getByText('João Silva').closest('a')).toHaveAttribute(
        'href',
        '/partners/partner-123'
      );
    });

    it('should render the técnico name as plain text when partner_id is missing', () => {
      // Arrange
      setupMocks();
      const transaction = buildTransactionItem({
        partner_id: undefined,
        partner_name: 'João Silva',
      });
      const transactions = buildSearchResponse([transaction]);

      // Act
      render(<PaymentTable transactions={transactions} />);

      // Assert
      expect(getTable().getByText('João Silva').closest('a')).toBeNull();
    });

    it('should render a dash when the segurado name is missing', () => {
      // Arrange
      setupMocks();
      const transaction = buildTransactionItem({
        customer_first_name: undefined,
        customer_last_name: undefined,
      });
      const transactions = buildSearchResponse([transaction]);

      // Act
      render(<PaymentTable transactions={transactions} />);

      // Assert
      const row = getTable()
        .getByText(transaction.external_reference)
        .closest('tr');
      expect(row).toHaveTextContent('-');
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
      expect(screen.getAllByTestId('pagination-total')[0].textContent).toBe(
        '2'
      );
      expect(screen.getAllByTestId('pagination-current')[0].textContent).toBe(
        '1'
      );
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
      fireEvent.click(screen.getAllByText('Go to page 2')[0]);

      // Assert
      expect(mockPush).toHaveBeenCalledWith(
        '/payments?sinistro=SIN-001&tecnico=partner-123&page=2'
      );
    });

    it('should navigate to the correct page when no existing params', () => {
      // Arrange
      setupMocks();
      const transactions = buildSearchResponse([buildTransactionItem()]);
      render(<PaymentTable transactions={transactions} />);

      // Act
      fireEvent.click(screen.getAllByText('Go to page 3')[0]);

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/payments?page=3');
    });

    it('should overwrite the existing page param when changing page', () => {
      // Arrange
      setupMocks({ page: '1', sinistro: 'SIN-001' });
      const transactions = buildSearchResponse([buildTransactionItem()]);
      render(<PaymentTable transactions={transactions} />);

      // Act
      fireEvent.click(screen.getAllByText('Go to page 2')[0]);

      // Assert
      expect(mockPush).toHaveBeenCalledWith(
        '/payments?page=2&sinistro=SIN-001'
      );
    });
  });
});
