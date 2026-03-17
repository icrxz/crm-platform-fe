import { render, screen } from '@testing-library/react';
import ControlPanelTable from '../table';
import {
  buildCaseFull,
  buildCustomer,
  buildSearchResponse,
} from '../__fixtures__/builders';

jest.mock('../../../libs/date', () => ({
  parseDateTime: (date: string) => (date ? `date:${date}` : ''),
}));

jest.mock('../../../libs/parser', () => ({
  parseToCurrency: (value: number) => `R$${value}`,
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ControlPanelTable', () => {
  describe('rendering', () => {
    it('should render all column headers', () => {
      // Arrange
      const cases = buildSearchResponse([]);

      // Act
      render(<ControlPanelTable cases={cases} />);

      // Assert
      expect(screen.getByText('Data')).toBeInTheDocument();
      expect(screen.getByText('Cidade')).toBeInTheDocument();
      expect(screen.getByText('Segurado')).toBeInTheDocument();
      expect(screen.getByText('Técnico')).toBeInTheDocument();
      expect(screen.getByText('Senha')).toBeInTheDocument();
      expect(screen.getByText('Seguradora')).toBeInTheDocument();
    });

    it('should render the segurado full name from customer', () => {
      // Arrange
      const crmCase = buildCaseFull({
        customer: buildCustomer({ first_name: 'Ana', last_name: 'Pereira' }),
      });
      const cases = buildSearchResponse([crmCase]);

      // Act
      render(<ControlPanelTable cases={cases} />);

      // Assert
      expect(screen.getByText('Ana Pereira')).toBeInTheDocument();
    });

    it('should show a dash when case has no customer', () => {
      // Arrange
      const crmCase = buildCaseFull({ customer: undefined });
      const cases = buildSearchResponse([crmCase]);

      // Act
      render(<ControlPanelTable cases={cases} />);

      // Assert
      expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });

    it('should render partner first name in Técnico column', () => {
      // Arrange
      const crmCase = buildCaseFull();
      const cases = buildSearchResponse([crmCase]);

      // Act
      render(<ControlPanelTable cases={cases} />);

      // Assert
      expect(screen.getByText('João')).toBeInTheDocument();
    });

    it('should render external reference in Senha column', () => {
      // Arrange
      const crmCase = buildCaseFull({ external_reference: 'SIN-999' });
      const cases = buildSearchResponse([crmCase]);

      // Act
      render(<ControlPanelTable cases={cases} />);

      // Assert
      expect(screen.getByText('SIN-999')).toBeInTheDocument();
    });

    it('should render contractor company name in Seguradora column', () => {
      // Arrange
      const crmCase = buildCaseFull();
      const cases = buildSearchResponse([crmCase]);

      // Act
      render(<ControlPanelTable cases={cases} />);

      // Assert
      expect(screen.getByText('Seguradora ABC')).toBeInTheDocument();
    });
  });

  describe('duplicate document highlighting', () => {
    it('should not apply red color when all documents are unique', () => {
      // Arrange
      const case1 = buildCaseFull({
        case_id: 'case-001',
        customer: buildCustomer({
          document: '111.111.111-11',
          first_name: 'Ana',
          last_name: 'Lima',
        }),
      });
      const case2 = buildCaseFull({
        case_id: 'case-002',
        customer: buildCustomer({
          document: '222.222.222-22',
          first_name: 'Pedro',
          last_name: 'Costa',
        }),
      });
      const cases = buildSearchResponse([case1, case2]);

      // Act
      render(<ControlPanelTable cases={cases} />);

      // Assert
      const anaCell = screen.getByText('Ana Lima').closest('td');
      const pedroCell = screen.getByText('Pedro Costa').closest('td');
      expect(anaCell?.className).not.toContain('text-red-500');
      expect(pedroCell?.className).not.toContain('text-red-500');
    });

    it('should apply red color to segurado names when the same document appears more than once', () => {
      // Arrange
      const sharedDocument = '111.111.111-11';
      const case1 = buildCaseFull({
        case_id: 'case-001',
        customer: buildCustomer({
          document: sharedDocument,
          first_name: 'Maria',
          last_name: 'Santos',
        }),
      });
      const case2 = buildCaseFull({
        case_id: 'case-002',
        customer: buildCustomer({
          document: sharedDocument,
          first_name: 'Maria',
          last_name: 'Santos',
        }),
      });
      const cases = buildSearchResponse([case1, case2]);

      // Act
      render(<ControlPanelTable cases={cases} />);

      // Assert
      const nameCells = screen
        .getAllByText('Maria Santos')
        .map((el) => el.closest('td'));
      nameCells.forEach((cell) => {
        expect(cell?.className).toContain('text-red-500');
      });
    });

    it('should only color the duplicate entries red, not unique ones', () => {
      // Arrange
      const sharedDocument = '111.111.111-11';
      const case1 = buildCaseFull({
        case_id: 'case-001',
        customer: buildCustomer({
          document: sharedDocument,
          first_name: 'Maria',
          last_name: 'Santos',
        }),
      });
      const case2 = buildCaseFull({
        case_id: 'case-002',
        customer: buildCustomer({
          document: sharedDocument,
          first_name: 'Maria',
          last_name: 'Santos',
        }),
      });
      const case3 = buildCaseFull({
        case_id: 'case-003',
        customer: buildCustomer({
          document: '999.999.999-99',
          first_name: 'Pedro',
          last_name: 'Alves',
        }),
      });
      const cases = buildSearchResponse([case1, case2, case3]);

      // Act
      render(<ControlPanelTable cases={cases} />);

      // Assert
      const pedroCell = screen.getByText('Pedro Alves').closest('td');
      expect(pedroCell?.className).not.toContain('text-red-500');
    });
  });
});
