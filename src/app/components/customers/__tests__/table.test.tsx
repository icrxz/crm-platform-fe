import { render, screen, fireEvent, within } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import CustomersTable from '../table';
import { CustomerListItem } from '@/app/types/customer-list-item';
import { SearchResponse } from '@/app/types/search_response';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../search-bar', () => ({
  __esModule: true,
  default: ({
    setIsCreationModalOpen,
    setIsFilterModalOpen,
  }: {
    setIsCreationModalOpen: (open: boolean) => void;
    setIsFilterModalOpen: (open: boolean) => void;
  }) => (
    <div data-testid="customers-search-bar">
      <button onClick={() => setIsCreationModalOpen(true)}>Open create</button>
      <button onClick={() => setIsFilterModalOpen(true)}>Open filters</button>
    </div>
  ),
}));

jest.mock('../create-customer', () => ({
  __esModule: true,
  default: () => <div data-testid="create-customer-modal" />,
}));

jest.mock('../edit-customer', () => ({
  __esModule: true,
  default: () => <div data-testid="edit-customer-modal" />,
}));

jest.mock('../delete-customer', () => ({
  DeleteCustomerModal: () => <div data-testid="delete-customer-modal" />,
}));

jest.mock('../../common/pagination', () => ({
  Pagination: ({ page }: { page?: number }) => (
    <div data-testid="pagination">{page}</div>
  ),
}));

const mockPush = jest.fn();

function buildCustomer(
  overrides: Partial<CustomerListItem> = {}
): CustomerListItem {
  return {
    customer_id: 'customer-001',
    first_name: 'João',
    last_name: 'Silva',
    email: 'joao@example.com',
    document: '12345678900',
    created_at: '2024-02-01T00:00:00Z',
    active: true,
    ...overrides,
  };
}

function buildSearchResponse(
  result: CustomerListItem[]
): SearchResponse<CustomerListItem> {
  return { result, paging: { total: result.length, limit: 10, offset: 0 } };
}

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

describe('CustomersTable', () => {
  it('should render the page title and search bar', () => {
    render(<CustomersTable customers={buildSearchResponse([])} />);

    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByTestId('customers-search-bar')).toBeInTheDocument();
  });

  it('should render without crashing when there are no customers', () => {
    render(<CustomersTable />);

    expect(screen.getByText('Clientes')).toBeInTheDocument();
  });

  it('should render customer data with a fallback for missing email', () => {
    const customer = buildCustomer({ email: undefined });
    render(<CustomersTable customers={buildSearchResponse([customer])} />);

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should navigate to the customer detail page when the view action is clicked', () => {
    const customer = buildCustomer();
    render(<CustomersTable customers={buildSearchResponse([customer])} />);

    const table = screen.getByRole('table');
    fireEvent.click(within(table).getAllByRole('button')[0]);

    expect(mockPush).toHaveBeenCalledWith('/customers/customer-001');
  });

  it('should hide the delete action for inactive customers', () => {
    const customer = buildCustomer({ active: false });
    render(<CustomersTable customers={buildSearchResponse([customer])} />);

    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('button')).toHaveLength(2);
  });

  it('should open the edit modal when the edit action is clicked', () => {
    const customer = buildCustomer();
    render(<CustomersTable customers={buildSearchResponse([customer])} />);

    const table = screen.getByRole('table');
    fireEvent.click(within(table).getAllByRole('button')[1]);

    expect(screen.getByTestId('edit-customer-modal')).toBeInTheDocument();
  });

  it('should open the delete modal when the delete action is clicked', () => {
    const customer = buildCustomer();
    render(<CustomersTable customers={buildSearchResponse([customer])} />);

    const table = screen.getByRole('table');
    fireEvent.click(within(table).getAllByRole('button')[2]);

    expect(screen.getByTestId('delete-customer-modal')).toBeInTheDocument();
  });

  it('should open the create modal when the search bar requests it', () => {
    render(<CustomersTable customers={buildSearchResponse([])} />);

    fireEvent.click(screen.getByText('Open create'));

    expect(screen.getByTestId('create-customer-modal')).toBeInTheDocument();
  });

  it('should open the filter modal when the search bar requests it', () => {
    render(<CustomersTable customers={buildSearchResponse([])} />);

    fireEvent.click(screen.getByText('Open filters'));

    expect(screen.getByText('Filtro')).toBeInTheDocument();
  });

  it('should pass paging and initialPage to the shared Pagination component', () => {
    render(
      <CustomersTable customers={buildSearchResponse([])} initialPage={2} />
    );

    expect(screen.getByTestId('pagination')).toHaveTextContent('2');
  });
});
