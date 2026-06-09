import { render, screen } from '@testing-library/react';
import ControlPanelTable from '../table';
import {
  buildPanelCaseItem,
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
      const cases = buildSearchResponse([]);

      render(<ControlPanelTable cases={cases} />);

      expect(screen.getByText('Data')).toBeInTheDocument();
      expect(screen.getByText('Cidade')).toBeInTheDocument();
      expect(screen.getByText('Segurado')).toBeInTheDocument();
      expect(screen.getByText('Técnico')).toBeInTheDocument();
      expect(screen.getByText('Senha')).toBeInTheDocument();
      expect(screen.getByText('Seguradora')).toBeInTheDocument();
    });

    it('should render the segurado full name from customer', () => {
      const crmCase = buildPanelCaseItem({
        customer_first_name: 'Ana',
        customer_last_name: 'Pereira',
      });
      const cases = buildSearchResponse([crmCase]);

      render(<ControlPanelTable cases={cases} />);

      expect(screen.getByText('Ana Pereira')).toBeInTheDocument();
    });

    it('should show a dash when case has no customer', () => {
      const crmCase = buildPanelCaseItem({
        customer_first_name: undefined,
        customer_last_name: undefined,
      });
      const cases = buildSearchResponse([crmCase]);

      render(<ControlPanelTable cases={cases} />);

      expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });

    it('should render partner first name in Técnico column', () => {
      const crmCase = buildPanelCaseItem({ partner_first_name: 'João' });
      const cases = buildSearchResponse([crmCase]);

      render(<ControlPanelTable cases={cases} />);

      expect(screen.getByText('João')).toBeInTheDocument();
    });

    it('should render external reference in Senha column', () => {
      const crmCase = buildPanelCaseItem({ external_reference: 'SIN-999' });
      const cases = buildSearchResponse([crmCase]);

      render(<ControlPanelTable cases={cases} />);

      expect(screen.getByText('SIN-999')).toBeInTheDocument();
    });

    it('should render contractor company name in Seguradora column', () => {
      const crmCase = buildPanelCaseItem({
        contractor_company_name: 'Seguradora ABC',
      });
      const cases = buildSearchResponse([crmCase]);

      render(<ControlPanelTable cases={cases} />);

      expect(screen.getByText('Seguradora ABC')).toBeInTheDocument();
    });
  });

  describe('duplicate document highlighting', () => {
    it('should not apply red color when all documents are unique', () => {
      const case1 = buildPanelCaseItem({
        case_id: 'case-001',
        customer_document: '111.111.111-11',
        customer_first_name: 'Ana',
        customer_last_name: 'Lima',
      });
      const case2 = buildPanelCaseItem({
        case_id: 'case-002',
        customer_document: '222.222.222-22',
        customer_first_name: 'Pedro',
        customer_last_name: 'Costa',
      });
      const cases = buildSearchResponse([case1, case2]);

      render(<ControlPanelTable cases={cases} />);

      const anaCell = screen.getByText('Ana Lima').closest('td');
      const pedroCell = screen.getByText('Pedro Costa').closest('td');
      expect(anaCell?.className).not.toContain('text-red-500');
      expect(pedroCell?.className).not.toContain('text-red-500');
    });

    it('should apply red color to segurado names when the same document appears more than once', () => {
      const sharedDocument = '111.111.111-11';
      const case1 = buildPanelCaseItem({
        case_id: 'case-001',
        customer_document: sharedDocument,
        customer_first_name: 'Maria',
        customer_last_name: 'Santos',
      });
      const case2 = buildPanelCaseItem({
        case_id: 'case-002',
        customer_document: sharedDocument,
        customer_first_name: 'Maria',
        customer_last_name: 'Santos',
      });
      const cases = buildSearchResponse([case1, case2]);

      render(<ControlPanelTable cases={cases} />);

      const nameCells = screen
        .getAllByText('Maria Santos')
        .map((el) => el.closest('td'));
      nameCells.forEach((cell) => {
        expect(cell?.className).toContain('text-red-500');
      });
    });

    it('should only color the duplicate entries red, not unique ones', () => {
      const sharedDocument = '111.111.111-11';
      const case1 = buildPanelCaseItem({
        case_id: 'case-001',
        customer_document: sharedDocument,
        customer_first_name: 'Maria',
        customer_last_name: 'Santos',
      });
      const case2 = buildPanelCaseItem({
        case_id: 'case-002',
        customer_document: sharedDocument,
        customer_first_name: 'Maria',
        customer_last_name: 'Santos',
      });
      const case3 = buildPanelCaseItem({
        case_id: 'case-003',
        customer_document: '999.999.999-99',
        customer_first_name: 'Pedro',
        customer_last_name: 'Alves',
      });
      const cases = buildSearchResponse([case1, case2, case3]);

      render(<ControlPanelTable cases={cases} />);

      const pedroCell = screen.getByText('Pedro Alves').closest('td');
      expect(pedroCell?.className).not.toContain('text-red-500');
    });
  });
});
