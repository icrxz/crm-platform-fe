import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import CasesSearchBar from '../search-bar';
import {
  setStoredCaseFilters,
  getStoredCaseFilters,
} from '../../../libs/case-filters-storage';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@heroui/react', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@heroicons/react/24/outline', () => ({
  XMarkIcon: () => <svg data-testid="x-icon" />,
}));

jest.mock('../../../components/common/search', () => ({
  __esModule: true,
  default: ({
    handleSearch,
    placeholder,
    initialValue,
  }: {
    handleSearch: (value: string) => void;
    placeholder: string;
    initialValue: string;
  }) => (
    <input
      placeholder={placeholder}
      defaultValue={initialValue}
      onChange={(e) => handleSearch(e.target.value)}
      data-testid="search-input"
    />
  ),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();

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
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    replace: mockReplace,
  });
  (usePathname as jest.Mock).mockReturnValue('/cases');
}

function renderSearchBar() {
  return render(
    <CasesSearchBar
      setIsFilterModalOpen={jest.fn()}
      setIsCreationModalOpen={jest.fn()}
      setIsCreationBatchModalOpen={jest.fn()}
    />
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
});

describe('CasesSearchBar', () => {
  describe('rendering', () => {
    it('should render the search input', () => {
      // Arrange
      setupMocks();

      // Act
      renderSearchBar();

      // Assert
      expect(
        screen.getByPlaceholderText('Buscar casos...')
      ).toBeInTheDocument();
    });

    it('should render the only-mine checkbox', () => {
      // Arrange
      setupMocks();

      // Act
      renderSearchBar();

      // Assert
      expect(screen.getByText('Atribuídos a mim')).toBeInTheDocument();
    });

    it('should render the filters button', () => {
      // Arrange
      setupMocks();

      // Act
      renderSearchBar();

      // Assert
      expect(screen.getByText('Filtros')).toBeInTheDocument();
    });

    it('should not render the clear filters button when there are no active filters', () => {
      // Arrange
      setupMocks();

      // Act
      renderSearchBar();

      // Assert
      expect(screen.queryByLabelText('Limpar filtros')).not.toBeInTheDocument();
    });

    it('should render the clear filters button when a filter is active', () => {
      // Arrange
      setupMocks({ status: 'New' });

      // Act
      renderSearchBar();

      // Assert
      expect(screen.getByLabelText('Limpar filtros')).toBeInTheDocument();
    });
  });

  describe('sinistro search', () => {
    it('should set sinistro param and reset page when searching', () => {
      // Arrange
      setupMocks();
      renderSearchBar();

      // Act
      fireEvent.change(screen.getByTestId('search-input'), {
        target: { value: 'SIN-001' },
      });

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/cases?sinistro=SIN-001&page=1');
    });
  });

  describe('only mine checkbox', () => {
    it('should set only_mine param and persist it when checked', () => {
      // Arrange
      setupMocks();
      renderSearchBar();

      // Act
      fireEvent.click(screen.getByLabelText('Atribuídos a mim'));

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/cases?only_mine=true&page=1');
      expect(getStoredCaseFilters().onlyMine).toBe(true);
    });

    it('should remove only_mine param when unchecked', () => {
      // Arrange
      setupMocks({ only_mine: 'true' });
      renderSearchBar();

      // Act
      fireEvent.click(screen.getByLabelText('Atribuídos a mim'));

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/cases?page=1');
    });
  });

  describe('clear filters', () => {
    it('should remove status, contractor_id and only_mine params and clear storage', () => {
      // Arrange
      setupMocks({
        status: ['New', 'Ongoing'],
        contractor_id: 'contractor-1',
        only_mine: 'true',
      });
      setStoredCaseFilters({
        status: ['New'],
        contractorId: ['contractor-1'],
        onlyMine: true,
      });
      renderSearchBar();

      // Act
      fireEvent.click(screen.getByLabelText('Limpar filtros'));

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/cases?page=1');
      expect(getStoredCaseFilters()).toEqual({});
    });
  });

  describe('storage hydration', () => {
    it('should redirect merging stored filters when the URL has none', () => {
      // Arrange
      setStoredCaseFilters({
        status: ['New'],
        contractorId: ['contractor-1'],
        onlyMine: true,
      });
      setupMocks();

      // Act
      renderSearchBar();

      // Assert
      expect(mockReplace).toHaveBeenCalledWith(
        '/cases?status=New&contractor_id=contractor-1&only_mine=true'
      );
    });

    it('should not redirect when the URL already has filter params', () => {
      // Arrange
      setStoredCaseFilters({ status: ['New'] });
      setupMocks({ status: 'Ongoing' });

      // Act
      renderSearchBar();

      // Assert
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('should not redirect when there is nothing stored', () => {
      // Arrange
      setupMocks();

      // Act
      renderSearchBar();

      // Assert
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
