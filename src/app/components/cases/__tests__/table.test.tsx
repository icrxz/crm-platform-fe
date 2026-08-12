import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import CasesTable from '../table';
import {
  buildCaseListItem,
  buildSearchResponse,
} from '../__fixtures__/builders';
import { getStoredCaseFilters } from '../../../libs/case-filters-storage';
import { CaseStatus } from '../../../types/case';
import { UserRole } from '../../../types/user';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('../search-bar', () => ({
  __esModule: true,
  default: ({
    setIsFilterModalOpen,
  }: {
    setIsFilterModalOpen: (open: boolean) => void;
  }) => (
    <div data-testid="cases-search-bar">
      <button onClick={() => setIsFilterModalOpen(true)}>Open filters</button>
    </div>
  ),
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
    </div>
  ),
}));

jest.mock('../filter-modal', () => ({
  FilterModal: ({
    onApply,
    initialStatus,
  }: {
    onApply: (filters: { status: string[]; contractorId: string[] }) => void;
    initialStatus: string[];
  }) => (
    <div data-testid="filter-modal">
      <span data-testid="initial-status">{initialStatus.join(',')}</span>
      <button
        onClick={() =>
          onApply({ status: ['Ongoing'], contractorId: ['contractor-1'] })
        }
      >
        Apply filters
      </button>
    </div>
  ),
}));

jest.mock('../create-case', () => ({
  __esModule: true,
  default: () => <div data-testid="create-case-modal" />,
}));

jest.mock('../batch-form-modal', () => ({
  CreateCaseBatchModal: () => <div data-testid="create-case-batch-modal" />,
}));

const mockPush = jest.fn();

function setupMocks(
  searchParamsEntries: Record<string, string | string[]> = {}
) {
  const params = new URLSearchParams();
  Object.entries(searchParamsEntries).forEach(([key, value]) => {
    (Array.isArray(value) ? value : [value]).forEach((v) =>
      params.append(key, v)
    );
  });

  (useSearchParams as jest.Mock).mockReturnValue({
    get: (key: string) => params.get(key),
    getAll: (key: string) => params.getAll(key),
    has: (key: string) => params.has(key),
    toString: () => params.toString(),
  });
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (usePathname as jest.Mock).mockReturnValue('/cases');
}

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
});

describe('CasesTable', () => {
  describe('rendering', () => {
    it('should render the page title', () => {
      // Arrange
      setupMocks();
      const cases = buildSearchResponse([]);

      // Act
      render(<CasesTable cases={cases} />);

      // Assert
      expect(screen.getByText('Casos')).toBeInTheDocument();
    });

    it('should render the search bar', () => {
      // Arrange
      setupMocks();
      const cases = buildSearchResponse([]);

      // Act
      render(<CasesTable cases={cases} />);

      // Assert
      expect(screen.getByTestId('cases-search-bar')).toBeInTheDocument();
    });

    it('should render case data with the Estado column label', () => {
      // Arrange
      setupMocks();
      const item = buildCaseListItem({
        external_reference: 'SIN-001',
        customer_first_name: 'João',
        status: CaseStatus.ONGOING,
      });
      const cases = buildSearchResponse([item]);

      // Act
      render(<CasesTable cases={cases} />);

      // Assert
      expect(screen.getByText('Estado')).toBeInTheDocument();
      expect(screen.queryByText('Status')).not.toBeInTheDocument();
      expect(screen.getByText('SIN-001')).toBeInTheDocument();
      expect(screen.getByText('Em andamento')).toBeInTheDocument();
    });

    it('should render the category column with the mapped label', () => {
      // Arrange
      setupMocks();
      const item = buildCaseListItem({ category: 'd+' });
      const cases = buildSearchResponse([item]);

      // Act
      render(<CasesTable cases={cases} />);

      // Assert
      expect(screen.getByText('Categoria')).toBeInTheDocument();
      expect(screen.getByText('D+')).toBeInTheDocument();
    });

    it('should render a dash when category is missing', () => {
      // Arrange
      setupMocks();
      const item = buildCaseListItem({ category: undefined });
      const cases = buildSearchResponse([item]);

      // Act
      render(<CasesTable cases={cases} />);

      // Assert
      const row = screen.getByText(item.external_reference).closest('tr');
      expect(row).toHaveTextContent('-');
    });

    it('should render the pagination with correct total pages', () => {
      // Arrange
      setupMocks();
      const cases = buildSearchResponse([buildCaseListItem()], {
        total: 25,
        limit: 10,
      });

      // Act
      render(<CasesTable cases={cases} initialPage={1} />);

      // Assert
      expect(screen.getByTestId('pagination-total').textContent).toBe('3');
    });
  });

  describe('pagination', () => {
    it('should preserve existing params when changing page', () => {
      // Arrange
      setupMocks({ sinistro: 'SIN-001' });
      const cases = buildSearchResponse([buildCaseListItem()]);
      render(<CasesTable cases={cases} />);

      // Act
      fireEvent.click(screen.getByText('Go to page 2'));

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/cases?sinistro=SIN-001&page=2');
    });
  });

  describe('filters', () => {
    it('should not render the filter modal by default', () => {
      // Arrange
      setupMocks();
      const cases = buildSearchResponse([]);
      render(<CasesTable cases={cases} />);

      // Assert
      expect(screen.queryByTestId('filter-modal')).not.toBeInTheDocument();
    });

    it('should open the filter modal when the search bar requests it', () => {
      // Arrange
      setupMocks();
      const cases = buildSearchResponse([]);
      render(<CasesTable cases={cases} />);

      // Act
      fireEvent.click(screen.getByText('Open filters'));

      // Assert
      expect(screen.getByTestId('filter-modal')).toBeInTheDocument();
    });

    it('should apply status and contractor filters to the URL, reset the page and persist them', () => {
      // Arrange
      setupMocks({ sinistro: 'SIN-001' });
      const cases = buildSearchResponse([]);
      render(<CasesTable cases={cases} />);
      fireEvent.click(screen.getByText('Open filters'));

      // Act
      fireEvent.click(screen.getByText('Apply filters'));

      // Assert
      expect(mockPush).toHaveBeenCalledWith(
        '/cases?sinistro=SIN-001&status=Ongoing&contractor_id=contractor-1&page=1'
      );
      expect(getStoredCaseFilters()).toEqual({
        status: ['Ongoing'],
        contractorId: ['contractor-1'],
      });
    });

    it('should close the filter modal after applying filters', () => {
      // Arrange
      setupMocks();
      const cases = buildSearchResponse([]);
      render(<CasesTable cases={cases} />);
      fireEvent.click(screen.getByText('Open filters'));

      // Act
      fireEvent.click(screen.getByText('Apply filters'));

      // Assert
      expect(screen.queryByTestId('filter-modal')).not.toBeInTheDocument();
    });

    it('should default the final statuses as selected for admin users', () => {
      // Arrange
      setupMocks();
      const cases = buildSearchResponse([]);
      render(<CasesTable cases={cases} userRole={UserRole.ADMIN} />);

      // Act
      fireEvent.click(screen.getByText('Open filters'));

      // Assert
      const initialStatus =
        screen.getByTestId('initial-status').textContent?.split(',') || [];
      expect(initialStatus).toContain(CaseStatus.CLOSED);
      expect(initialStatus).toContain(CaseStatus.CANCELED);
    });

    it('should not default the final statuses as selected for operator users', () => {
      // Arrange
      setupMocks();
      const cases = buildSearchResponse([]);
      render(<CasesTable cases={cases} userRole={UserRole.OPERATOR} />);

      // Act
      fireEvent.click(screen.getByText('Open filters'));

      // Assert
      const initialStatus =
        screen.getByTestId('initial-status').textContent?.split(',') || [];
      expect(initialStatus).not.toContain(CaseStatus.CLOSED);
      expect(initialStatus).not.toContain(CaseStatus.CANCELED);
    });
  });
});
