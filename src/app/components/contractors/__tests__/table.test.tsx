import { render, screen, fireEvent, within } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ContractorsTable from '../table';
import { ContractorListItem } from '@/app/types/contractor-list-item';
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
    <div data-testid="contractors-search-bar">
      <button onClick={() => setIsCreationModalOpen(true)}>Open create</button>
      <button onClick={() => setIsFilterModalOpen(true)}>Open filters</button>
    </div>
  ),
}));

jest.mock('../create-contractor', () => ({
  __esModule: true,
  default: () => <div data-testid="create-contractor-modal" />,
}));

jest.mock('../edit-contractor', () => ({
  __esModule: true,
  default: () => <div data-testid="edit-contractor-modal" />,
}));

jest.mock('../delete-contractor', () => ({
  DeleteContractorModal: () => <div data-testid="delete-contractor-modal" />,
}));

jest.mock('../../common/pagination', () => ({
  Pagination: ({ page }: { page?: number }) => (
    <div data-testid="pagination">{page}</div>
  ),
}));

const mockPush = jest.fn();

function buildContractor(
  overrides: Partial<ContractorListItem> = {}
): ContractorListItem {
  return {
    contractor_id: 'contractor-001',
    company_name: 'Seguradora ABC',
    legal_name: 'Seguradora ABC Ltda',
    document: '12345678000190',
    created_at: '2024-02-01T00:00:00Z',
    active: true,
    ...overrides,
  };
}

function buildSearchResponse(
  result: ContractorListItem[]
): SearchResponse<ContractorListItem> {
  return { result, paging: { total: result.length, limit: 10, offset: 0 } };
}

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

describe('ContractorsTable', () => {
  it('should render the page title and search bar', () => {
    render(<ContractorsTable contractors={buildSearchResponse([])} />);

    expect(screen.getByText('Seguradoras')).toBeInTheDocument();
    expect(screen.getByTestId('contractors-search-bar')).toBeInTheDocument();
  });

  it('should render without crashing when there are no contractors', () => {
    render(<ContractorsTable />);

    expect(screen.getByText('Seguradoras')).toBeInTheDocument();
  });

  it('should render contractor data and active status', () => {
    const contractor = buildContractor();
    render(
      <ContractorsTable contractors={buildSearchResponse([contractor])} />
    );

    expect(screen.getByText('Seguradora ABC')).toBeInTheDocument();
    expect(screen.getByText('Seguradora ABC Ltda')).toBeInTheDocument();
    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('should render Inativo for inactive contractors', () => {
    const contractor = buildContractor({ active: false });
    render(
      <ContractorsTable contractors={buildSearchResponse([contractor])} />
    );

    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });

  it('should navigate to the contractor detail page when the view action is clicked', () => {
    const contractor = buildContractor();
    render(
      <ContractorsTable contractors={buildSearchResponse([contractor])} />
    );

    const table = screen.getByRole('table');
    fireEvent.click(within(table).getAllByRole('button')[0]);

    expect(mockPush).toHaveBeenCalledWith('/contractors/contractor-001');
  });

  it('should hide the delete action for inactive contractors', () => {
    const contractor = buildContractor({ active: false });
    render(
      <ContractorsTable contractors={buildSearchResponse([contractor])} />
    );

    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('button')).toHaveLength(2);
  });

  it('should open the edit modal when the edit action is clicked', () => {
    const contractor = buildContractor();
    render(
      <ContractorsTable contractors={buildSearchResponse([contractor])} />
    );

    const table = screen.getByRole('table');
    fireEvent.click(within(table).getAllByRole('button')[1]);

    expect(screen.getByTestId('edit-contractor-modal')).toBeInTheDocument();
  });

  it('should open the delete modal when the delete action is clicked', () => {
    const contractor = buildContractor();
    render(
      <ContractorsTable contractors={buildSearchResponse([contractor])} />
    );

    const table = screen.getByRole('table');
    fireEvent.click(within(table).getAllByRole('button')[2]);

    expect(screen.getByTestId('delete-contractor-modal')).toBeInTheDocument();
  });

  it('should open the create modal when the search bar requests it', () => {
    render(<ContractorsTable contractors={buildSearchResponse([])} />);

    fireEvent.click(screen.getByText('Open create'));

    expect(screen.getByTestId('create-contractor-modal')).toBeInTheDocument();
  });

  it('should open the filter modal when the search bar requests it', () => {
    render(<ContractorsTable contractors={buildSearchResponse([])} />);

    fireEvent.click(screen.getByText('Open filters'));

    expect(screen.getByText('Filtro')).toBeInTheDocument();
  });

  it('should pass paging and initialPage to the shared Pagination component', () => {
    render(
      <ContractorsTable contractors={buildSearchResponse([])} initialPage={2} />
    );

    expect(screen.getByTestId('pagination')).toHaveTextContent('2');
  });
});
