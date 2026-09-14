import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { unauthorizedRedirect } from '../../../libs/auth-redirect';
import { getCurrentUser } from '../../../libs/session';
import { fetchCasesFull } from '../../../services/cases';
import { fetchContractors } from '../../../services/contractors';
import { fetchPartners } from '../../../services/partners';
import { UserRole } from '../../../types/user';
import { months } from '../../../types/month';
import Page from '../page';
import {
  buildCaseFull,
  buildContractor,
  buildPartner,
  buildCustomer,
  buildSearchResponse,
} from '../../../components/panel/__fixtures__/builders';

jest.mock('next-auth/react', () => ({ signOut: jest.fn() }));
jest.mock('next/navigation', () => ({
  redirect: jest.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));
jest.mock('../../../libs/auth-redirect', () => ({
  unauthorizedRedirect: jest.fn().mockImplementation(() => {
    throw new Error('NEXT_REDIRECT:/login');
  }),
}));

jest.mock('../../../libs/session', () => ({ getCurrentUser: jest.fn() }));
jest.mock('../../../services/cases', () => ({ fetchCasesFull: jest.fn() }));
jest.mock('../../../services/contractors', () => ({
  fetchContractors: jest.fn(),
}));
jest.mock('../../../services/partners', () => ({ fetchPartners: jest.fn() }));

jest.mock('../../../components/panel/table', () => ({
  __esModule: true,
  default: ({ cases }: { cases: { result: { case_id: string }[] } }) => (
    <div data-testid="panel-table">
      <span data-testid="case-count">{cases.result.length}</span>
      {cases.result.map((c) => (
        <span key={c.case_id} data-testid="case-id">
          {c.case_id}
        </span>
      ))}
    </div>
  ),
}));

jest.mock('../../../components/panel/summary', () => ({
  __esModule: true,
  default: () => <div data-testid="panel-summary" />,
}));

jest.mock('../../../components/panel/search', () => ({
  __esModule: true,
  default: () => <div data-testid="panel-search" />,
}));

jest.mock('../../../components/dashboard/skeletons', () => ({
  CardsSkeleton: () => <div data-testid="cards-skeleton" />,
}));

jest.mock('../../../ui/fonts', () => ({
  roboto: { className: 'roboto' },
}));

const mockRedirect = redirect as unknown as jest.Mock;
const mockUnauthorizedRedirect = unauthorizedRedirect as unknown as jest.Mock;
const mockGetCurrentUser = getCurrentUser as unknown as jest.Mock;
const mockFetchCasesFull = fetchCasesFull as jest.Mock;
const mockFetchContractors = fetchContractors as jest.Mock;
const mockFetchPartners = fetchPartners as jest.Mock;

function setupAdminUser() {
  mockGetCurrentUser.mockResolvedValue({ role: UserRole.ADMIN });
}

function setupServices({
  cases = [buildCaseFull()],
  contractors = [buildContractor()],
  partners = [buildPartner()],
} = {}) {
  mockFetchCasesFull.mockResolvedValue({
    success: true,
    data: buildSearchResponse(cases),
  });
  mockFetchContractors.mockResolvedValue({
    success: true,
    data: buildSearchResponse(contractors),
  });
  mockFetchPartners.mockResolvedValue({
    success: true,
    data: buildSearchResponse(partners),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Panel Page', () => {
  describe('authorization', () => {
    it('should redirect to /home when user is OPERATOR', async () => {
      // Arrange
      mockGetCurrentUser.mockResolvedValue({ role: UserRole.OPERATOR });
      const searchParams = Promise.resolve({});

      // Act & Assert
      await expect(Page({ searchParams })).rejects.toThrow(
        'NEXT_REDIRECT:/home'
      );
      expect(mockRedirect).toHaveBeenCalledWith('/home');
    });

    it('should not redirect to /home when user is ADMIN', async () => {
      // Arrange
      setupAdminUser();
      setupServices();
      const searchParams = Promise.resolve({});

      // Act
      await Page({ searchParams });

      // Assert
      expect(mockRedirect).not.toHaveBeenCalledWith('/home');
    });
  });

  describe('data fetching', () => {
    it('should fetch cases with status=Closed', async () => {
      // Arrange
      setupAdminUser();
      setupServices();
      const searchParams = Promise.resolve({});

      // Act
      await Page({ searchParams });

      // Assert
      expect(mockFetchCasesFull).toHaveBeenCalledWith(
        expect.stringContaining('status=Closed'),
        1,
        10000
      );
    });

    it('should include contractor_id in query when seguradora filter is set', async () => {
      // Arrange
      setupAdminUser();
      setupServices();
      const searchParams = Promise.resolve({ seguradora: 'contractor-001' });

      // Act
      await Page({ searchParams });

      // Assert
      expect(mockFetchCasesFull).toHaveBeenCalledWith(
        expect.stringContaining('contractor_id=contractor-001'),
        1,
        10000
      );
    });

    it('should include partner_id in query when tecnico filter is set', async () => {
      // Arrange
      setupAdminUser();
      setupServices();
      const searchParams = Promise.resolve({ tecnico: 'partner-123' });

      // Act
      await Page({ searchParams });

      // Assert
      expect(mockFetchCasesFull).toHaveBeenCalledWith(
        expect.stringContaining('partner_id=partner-123'),
        1,
        10000
      );
    });

    it('should use the provided ano in the date range query', async () => {
      // Arrange
      setupAdminUser();
      setupServices();
      const searchParams = Promise.resolve({
        ano: '2022',
        mes: months[0],
      });

      // Act
      await Page({ searchParams });

      // Assert
      expect(mockFetchCasesFull).toHaveBeenCalledWith(
        expect.stringContaining('start_date=2022-01-01'),
        1,
        10000
      );
    });

    it('should redirect to /login when fetchCasesFull returns unauthorized', async () => {
      // Arrange
      setupAdminUser();
      mockFetchCasesFull.mockResolvedValue({
        success: false,
        unauthorized: true,
      });
      const searchParams = Promise.resolve({});

      // Act & Assert
      await expect(Page({ searchParams })).rejects.toThrow(
        'NEXT_REDIRECT:/login'
      );
      expect(mockUnauthorizedRedirect).toHaveBeenCalled();
    });
  });

  describe('sorting and grouping', () => {
    it('should sort cases by date ascending', async () => {
      // Arrange
      setupAdminUser();
      const older = buildCaseFull({
        case_id: 'case-001',
        created_at: '2024-01-01T00:00:00Z',
      });
      const newer = buildCaseFull({
        case_id: 'case-002',
        created_at: '2024-03-01T00:00:00Z',
      });
      setupServices({ cases: [newer, older] });
      const searchParams = Promise.resolve({});

      // Act
      const jsx = await Page({ searchParams });
      render(jsx);

      // Assert
      const caseIds = screen
        .getAllByTestId('case-id')
        .map((el) => el.textContent);
      expect(caseIds).toEqual(['case-001', 'case-002']);
    });

    it('should group cases from the same customer together regardless of date order', async () => {
      // Arrange
      setupAdminUser();
      const sharedDocument = '111.111.111-11';
      const caseA = buildCaseFull({
        case_id: 'case-A',
        created_at: '2024-01-01T00:00:00Z',
        customer: buildCustomer({ document: sharedDocument }),
      });
      const caseB = buildCaseFull({
        case_id: 'case-B',
        created_at: '2024-02-01T00:00:00Z',
        customer: buildCustomer({ document: '999.999.999-99' }),
      });
      const caseC = buildCaseFull({
        case_id: 'case-C',
        created_at: '2024-03-01T00:00:00Z',
        customer: buildCustomer({ document: sharedDocument }),
      });
      setupServices({ cases: [caseA, caseB, caseC] });
      const searchParams = Promise.resolve({});

      // Act
      const jsx = await Page({ searchParams });
      render(jsx);

      // Assert — case-A and case-C share the same customer so must be adjacent
      const caseIds = screen
        .getAllByTestId('case-id')
        .map((el) => el.textContent);
      const indexA = caseIds.indexOf('case-A');
      const indexC = caseIds.indexOf('case-C');
      expect(Math.abs(indexA - indexC)).toBe(1);
    });
  });

  describe('rendering', () => {
    it('should render the page title', async () => {
      // Arrange
      setupAdminUser();
      setupServices();
      const searchParams = Promise.resolve({});

      // Act
      const jsx = await Page({ searchParams });
      render(jsx);

      // Assert
      expect(screen.getByText('Painel de controle')).toBeInTheDocument();
    });

    it('should render ControlPanelSearch when contractors and partners are available', async () => {
      // Arrange
      setupAdminUser();
      setupServices();
      const searchParams = Promise.resolve({});

      // Act
      const jsx = await Page({ searchParams });
      render(jsx);

      // Assert
      expect(screen.getByTestId('panel-search')).toBeInTheDocument();
    });

    it('should render ControlPanelTable with the correct number of cases', async () => {
      // Arrange
      setupAdminUser();
      setupServices({
        cases: [buildCaseFull(), buildCaseFull({ case_id: 'case-002' })],
      });
      const searchParams = Promise.resolve({});

      // Act
      const jsx = await Page({ searchParams });
      render(jsx);

      // Assert
      expect(screen.getByTestId('case-count').textContent).toBe('2');
    });
  });
});
