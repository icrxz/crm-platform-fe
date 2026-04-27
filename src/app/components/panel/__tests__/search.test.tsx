import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ControlPanelSearch from '../search';
import { buildContractor, buildPartner } from '../__fixtures__/builders';
import { months } from '../../../types/month';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@heroui/react', () => ({
  Autocomplete: ({
    onSelectionChange,
    label,
  }: {
    onSelectionChange: (key: string | null) => void;
    label: string;
  }) => (
    <div>
      <button
        aria-label={`select-${label}`}
        onClick={() => onSelectionChange('partner-123')}
      >
        Select Partner
      </button>
      <button
        aria-label={`clear-${label}`}
        onClick={() => onSelectionChange(null)}
      >
        Clear Partner
      </button>
    </div>
  ),
  AutocompleteItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('../../common/dropdown/dropdown', () => ({
  Dropdown: ({
    label,
    name,
    onChange,
    value,
    optional,
    options,
  }: {
    label: string;
    name: string;
    onChange?: (val: string) => void;
    value?: string;
    optional?: boolean;
    options: { id: string; value: string; label: string }[];
  }) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <select
        id={name}
        value={value || ''}
        data-optional={String(!!optional)}
        onChange={(e) => onChange && onChange(e.target.value)}
      >
        {optional && <option value="">--</option>}
        {options.map((opt) => (
          <option key={opt.id} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

jest.mock('../../common/button', () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

jest.mock('@heroicons/react/24/outline', () => ({
  MagnifyingGlassIcon: () => <svg />,
}));

const mockPush = jest.fn();

function setupMocks(searchParamsEntries: Record<string, string> = {}) {
  const params = new URLSearchParams(searchParamsEntries);
  (useSearchParams as jest.Mock).mockReturnValue({
    get: (key: string) => params.get(key),
    toString: () => params.toString(),
  });
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (usePathname as jest.Mock).mockReturnValue('/panel');
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ControlPanelSearch', () => {
  describe('rendering', () => {
    it('should render the Mês dropdown', () => {
      // Arrange
      setupMocks();

      // Act
      render(<ControlPanelSearch contractors={[]} partners={[]} />);

      // Assert
      expect(screen.getByLabelText('Mês')).toBeInTheDocument();
    });

    it('should render the Ano dropdown', () => {
      // Arrange
      setupMocks();

      // Act
      render(<ControlPanelSearch contractors={[]} partners={[]} />);

      // Assert
      expect(screen.getByLabelText('Ano')).toBeInTheDocument();
    });

    it('should render the Técnico autocomplete', () => {
      // Arrange
      setupMocks();

      // Act
      render(<ControlPanelSearch contractors={[]} partners={[]} />);

      // Assert
      expect(
        screen.getByLabelText('select-Técnico responsável')
      ).toBeInTheDocument();
    });

    it('should initialize Mês from URL param', () => {
      // Arrange
      setupMocks({ mes: 'Junho' });

      // Act
      render(<ControlPanelSearch contractors={[]} partners={[]} />);

      // Assert
      expect((screen.getByLabelText('Mês') as HTMLSelectElement).value).toBe(
        'Junho'
      );
    });

    it('should initialize Ano from URL param', () => {
      // Arrange
      setupMocks({ ano: '2023' });

      // Act
      render(<ControlPanelSearch contractors={[]} partners={[]} />);

      // Assert
      expect((screen.getByLabelText('Ano') as HTMLSelectElement).value).toBe(
        '2023'
      );
    });
  });

  describe('month and year optional behavior', () => {
    it('should not allow clearing Mês when no técnico is selected', () => {
      // Arrange
      setupMocks();

      // Act
      render(<ControlPanelSearch contractors={[]} partners={[]} />);

      // Assert
      expect(screen.getByLabelText('Mês').getAttribute('data-optional')).toBe(
        'false'
      );
    });

    it('should not allow clearing Ano when no técnico is selected', () => {
      // Arrange
      setupMocks();

      // Act
      render(<ControlPanelSearch contractors={[]} partners={[]} />);

      // Assert
      expect(screen.getByLabelText('Ano').getAttribute('data-optional')).toBe(
        'false'
      );
    });

    it('should allow clearing Mês when a técnico is selected in URL', () => {
      // Arrange
      setupMocks({ tecnico: 'partner-123' });

      // Act
      render(<ControlPanelSearch contractors={[]} partners={[]} />);

      // Assert
      expect(screen.getByLabelText('Mês').getAttribute('data-optional')).toBe(
        'true'
      );
    });

    it('should allow clearing Ano when a técnico is selected in URL', () => {
      // Arrange
      setupMocks({ tecnico: 'partner-123' });

      // Act
      render(<ControlPanelSearch contractors={[]} partners={[]} />);

      // Assert
      expect(screen.getByLabelText('Ano').getAttribute('data-optional')).toBe(
        'true'
      );
    });

    it('should enable clear option for Mês and Ano after selecting a técnico', () => {
      // Arrange
      setupMocks();
      render(<ControlPanelSearch contractors={[]} partners={[]} />);

      // Act
      fireEvent.click(screen.getByLabelText('select-Técnico responsável'));

      // Assert
      expect(screen.getByLabelText('Mês').getAttribute('data-optional')).toBe(
        'true'
      );
      expect(screen.getByLabelText('Ano').getAttribute('data-optional')).toBe(
        'true'
      );
    });
  });

  describe('técnico removal behavior', () => {
    it('should reset Mês to current month when técnico is cleared', () => {
      // Arrange
      setupMocks({ tecnico: 'partner-123', mes: 'Janeiro' });
      render(<ControlPanelSearch contractors={[]} partners={[]} />);

      // Act
      fireEvent.click(screen.getByLabelText('clear-Técnico responsável'));

      // Assert
      const currentMonth = months[new Date().getMonth()];
      expect((screen.getByLabelText('Mês') as HTMLSelectElement).value).toBe(
        currentMonth
      );
    });

    it('should reset Ano to current year when técnico is cleared', () => {
      // Arrange
      setupMocks({ tecnico: 'partner-123', ano: '2022' });
      render(<ControlPanelSearch contractors={[]} partners={[]} />);

      // Act
      fireEvent.click(screen.getByLabelText('clear-Técnico responsável'));

      // Assert
      const currentYear = String(new Date().getFullYear());
      expect((screen.getByLabelText('Ano') as HTMLSelectElement).value).toBe(
        currentYear
      );
    });

    it('should disable clear option for Mês after técnico is cleared', () => {
      // Arrange
      setupMocks({ tecnico: 'partner-123' });
      render(<ControlPanelSearch contractors={[]} partners={[]} />);

      // Act
      fireEvent.click(screen.getByLabelText('clear-Técnico responsável'));

      // Assert
      expect(screen.getByLabelText('Mês').getAttribute('data-optional')).toBe(
        'false'
      );
    });
  });

  describe('filter actions', () => {
    it('should push URL with mes and ano when Filtrar is clicked', () => {
      // Arrange
      setupMocks({ mes: 'Março', ano: '2024' });
      render(<ControlPanelSearch contractors={[]} partners={[]} />);

      // Act
      fireEvent.click(screen.getByText('Filtrar'));

      // Assert
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('mes=Mar%C3%A7o')
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('ano=2024')
      );
    });

    it('should include tecnico in URL when partner is active and Filtrar is clicked', () => {
      // Arrange
      setupMocks({ tecnico: 'partner-123' });
      render(
        <ControlPanelSearch contractors={[]} partners={[buildPartner()]} />
      );

      // Act
      fireEvent.click(screen.getByText('Filtrar'));

      // Assert
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('tecnico=partner-123')
      );
    });

    it('should include seguradora in URL when contractor is selected', () => {
      // Arrange
      setupMocks({ seguradora: 'contractor-001' });
      render(
        <ControlPanelSearch contractors={[buildContractor()]} partners={[]} />
      );

      // Act
      fireEvent.click(screen.getByText('Filtrar'));

      // Assert
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('seguradora=contractor-001')
      );
    });

    it('should navigate to pathname with current month and year when Limpar filtros is clicked', () => {
      // Arrange
      setupMocks({ mes: 'Março', tecnico: 'partner-123' });
      render(<ControlPanelSearch contractors={[]} partners={[]} />);

      // Act
      fireEvent.click(screen.getByText('Limpar filtros'));

      // Assert
      const currentMonth = months[new Date().getMonth()];
      const currentYear = String(new Date().getFullYear());
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining(`mes=${encodeURIComponent(currentMonth)}`)
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining(`ano=${currentYear}`)
      );
    });

    it('should reset Mês and Ano to current values when Limpar filtros is clicked', () => {
      // Arrange
      setupMocks({ mes: 'Janeiro', ano: '2022', tecnico: 'partner-123' });
      render(<ControlPanelSearch contractors={[]} partners={[]} />);

      // Act
      fireEvent.click(screen.getByText('Limpar filtros'));

      // Assert
      const currentMonth = months[new Date().getMonth()];
      const currentYear = String(new Date().getFullYear());
      expect((screen.getByLabelText('Mês') as HTMLSelectElement).value).toBe(
        currentMonth
      );
      expect((screen.getByLabelText('Ano') as HTMLSelectElement).value).toBe(
        currentYear
      );
    });
  });
});
