import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import PaymentsSearchBar from '../search-bar';
import { buildPartner } from '../__fixtures__/builders';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@heroui/react', () => ({
  Autocomplete: ({
    onChange,
    'aria-label': ariaLabel,
  }: {
    onChange: (key: string | null) => void;
    'aria-label': string;
  }) => (
    <div>
      <button
        aria-label={`select-${ariaLabel}`}
        onClick={() => onChange('partner-123')}
      >
        Select Partner
      </button>
      <button aria-label={`clear-${ariaLabel}`} onClick={() => onChange(null)}>
        Clear Partner
      </button>
    </div>
  ),
  AutocompleteItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
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

function setupMocks(searchParamsEntries: Record<string, string> = {}) {
  const params = new URLSearchParams(searchParamsEntries);
  (useSearchParams as jest.Mock).mockReturnValue({
    get: (key: string) => params.get(key),
    toString: () => params.toString(),
  });
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (usePathname as jest.Mock).mockReturnValue('/payments');
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PaymentsSearchBar', () => {
  describe('rendering', () => {
    it('should render the case search input', () => {
      // Arrange
      setupMocks();

      // Act
      render(<PaymentsSearchBar />);

      // Assert
      expect(
        screen.getByPlaceholderText('Buscar pagamentos pelo sinistro')
      ).toBeInTheDocument();
    });

    it('should render the partner autocomplete', () => {
      // Arrange
      setupMocks();
      const partner = buildPartner();

      // Act
      render(<PaymentsSearchBar partners={[partner]} />);

      // Assert
      expect(
        screen.getByLabelText('select-Técnico responsável')
      ).toBeInTheDocument();
    });

    it('should initialize the search input with the sinistro URL param', () => {
      // Arrange
      setupMocks({ sinistro: 'SIN-001' });

      // Act
      render(<PaymentsSearchBar />);

      // Assert
      const input = screen.getByTestId('search-input') as HTMLInputElement;
      expect(input.defaultValue).toBe('SIN-001');
    });
  });

  describe('case search (sinistro)', () => {
    it('should set sinistro param and reset page when searching', () => {
      // Arrange
      setupMocks();
      render(<PaymentsSearchBar />);

      // Act
      fireEvent.change(screen.getByTestId('search-input'), {
        target: { value: 'SIN-001' },
      });

      // Assert
      expect(mockPush).toHaveBeenCalledWith(
        '/payments?sinistro=SIN-001&page=1'
      );
    });

    it('should remove sinistro param when search is cleared', () => {
      // Arrange
      setupMocks({ sinistro: 'SIN-001' });
      render(<PaymentsSearchBar />);

      // Act
      fireEvent.change(screen.getByTestId('search-input'), {
        target: { value: '' },
      });

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/payments?page=1');
    });

    it('should preserve existing tecnico param when searching by sinistro', () => {
      // Arrange
      setupMocks({ tecnico: 'partner-123' });
      render(<PaymentsSearchBar />);

      // Act
      fireEvent.change(screen.getByTestId('search-input'), {
        target: { value: 'SIN-002' },
      });

      // Assert
      expect(mockPush).toHaveBeenCalledWith(
        '/payments?tecnico=partner-123&sinistro=SIN-002&page=1'
      );
    });
  });

  describe('partner filter (tecnico)', () => {
    it('should set tecnico param and reset page when a partner is selected', () => {
      // Arrange
      setupMocks();
      const partner = buildPartner({ partner_id: 'partner-123' });
      render(<PaymentsSearchBar partners={[partner]} />);

      // Act
      fireEvent.click(screen.getByLabelText('select-Técnico responsável'));

      // Assert
      expect(mockPush).toHaveBeenCalledWith(
        '/payments?tecnico=partner-123&page=1'
      );
    });

    it('should remove tecnico param when selection is cleared', () => {
      // Arrange
      setupMocks({ tecnico: 'partner-123' });
      const partner = buildPartner({ partner_id: 'partner-123' });
      render(<PaymentsSearchBar partners={[partner]} />);

      // Act
      fireEvent.click(screen.getByLabelText('clear-Técnico responsável'));

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/payments?page=1');
    });

    it('should preserve existing sinistro param when selecting a partner', () => {
      // Arrange
      setupMocks({ sinistro: 'SIN-001' });
      const partner = buildPartner({ partner_id: 'partner-123' });
      render(<PaymentsSearchBar partners={[partner]} />);

      // Act
      fireEvent.click(screen.getByLabelText('select-Técnico responsável'));

      // Assert
      expect(mockPush).toHaveBeenCalledWith(
        '/payments?sinistro=SIN-001&tecnico=partner-123&page=1'
      );
    });
  });
});
