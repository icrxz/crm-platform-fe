import { render, screen, fireEvent, within } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import PartnersTable from '../table';
import { PartnerListItem } from '@/app/types/partner-list-item';
import { SearchResponse } from '@/app/types/search_response';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../search-bar', () => ({
  __esModule: true,
  default: ({
    setIsCreationModalOpen,
  }: {
    setIsCreationModalOpen: (open: boolean) => void;
  }) => (
    <div data-testid="partners-search-bar">
      <button onClick={() => setIsCreationModalOpen(true)}>Open create</button>
    </div>
  ),
}));

jest.mock('../create-partner', () => ({
  __esModule: true,
  default: () => <div data-testid="create-partner-modal" />,
}));

jest.mock('../edit-partner', () => ({
  __esModule: true,
  default: () => <div data-testid="edit-partner-modal" />,
}));

jest.mock('../delete-partner', () => ({
  DeletePartnerModal: () => <div data-testid="delete-partner-modal" />,
}));

jest.mock('../../common/pagination', () => ({
  Pagination: ({ page }: { page?: number }) => (
    <div data-testid="pagination">{page}</div>
  ),
}));

const mockPush = jest.fn();

function buildPartner(
  overrides: Partial<PartnerListItem> = {}
): PartnerListItem {
  return {
    partner_id: 'partner-001',
    first_name: 'Maria',
    last_name: 'Souza',
    partner_type: 'technician',
    document: '12345678900',
    city: 'São Paulo',
    state: 'SP',
    active: true,
    ...overrides,
  };
}

function buildSearchResponse(
  result: PartnerListItem[]
): SearchResponse<PartnerListItem> {
  return { result, paging: { total: result.length, limit: 10, offset: 0 } };
}

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

describe('PartnersTable', () => {
  it('should render the page title and search bar', () => {
    render(<PartnersTable partners={buildSearchResponse([])} />);

    expect(screen.getByText('Técnicos')).toBeInTheDocument();
    expect(screen.getByTestId('partners-search-bar')).toBeInTheDocument();
  });

  it('should render without crashing when there are no partners', () => {
    render(<PartnersTable />);

    expect(screen.getByText('Técnicos')).toBeInTheDocument();
  });

  it('should render partner data and active status', () => {
    const partner = buildPartner();
    render(<PartnersTable partners={buildSearchResponse([partner])} />);

    expect(screen.getByText('Maria Souza')).toBeInTheDocument();
    expect(screen.getByText('São Paulo')).toBeInTheDocument();
    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('should render Inativo for inactive partners', () => {
    const partner = buildPartner({ active: false });
    render(<PartnersTable partners={buildSearchResponse([partner])} />);

    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });

  it('should navigate to the partner detail page when the view action is clicked', () => {
    const partner = buildPartner();
    render(<PartnersTable partners={buildSearchResponse([partner])} />);

    const table = screen.getByRole('table');
    fireEvent.click(within(table).getAllByRole('button')[0]);

    expect(mockPush).toHaveBeenCalledWith('/partners/partner-001');
  });

  it('should hide the delete action for inactive partners', () => {
    const partner = buildPartner({ active: false });
    render(<PartnersTable partners={buildSearchResponse([partner])} />);

    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('button')).toHaveLength(2);
  });

  it('should open the edit modal when the edit action is clicked', () => {
    const partner = buildPartner();
    render(<PartnersTable partners={buildSearchResponse([partner])} />);

    const table = screen.getByRole('table');
    fireEvent.click(within(table).getAllByRole('button')[1]);

    expect(screen.getByTestId('edit-partner-modal')).toBeInTheDocument();
  });

  it('should open the delete modal when the delete action is clicked', () => {
    const partner = buildPartner();
    render(<PartnersTable partners={buildSearchResponse([partner])} />);

    const table = screen.getByRole('table');
    fireEvent.click(within(table).getAllByRole('button')[2]);

    expect(screen.getByTestId('delete-partner-modal')).toBeInTheDocument();
  });

  it('should open the create modal when the search bar requests it', () => {
    render(<PartnersTable partners={buildSearchResponse([])} />);

    fireEvent.click(screen.getByText('Open create'));

    expect(screen.getByTestId('create-partner-modal')).toBeInTheDocument();
  });

  it('should pass paging and initialPage to the shared Pagination component', () => {
    render(
      <PartnersTable partners={buildSearchResponse([])} initialPage={2} />
    );

    expect(screen.getByTestId('pagination')).toHaveTextContent('2');
  });
});
