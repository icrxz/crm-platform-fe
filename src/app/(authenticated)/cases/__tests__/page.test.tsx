import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../../libs/session';
import { fetchCasesFull } from '../../../services/cases';
import { CaseStatus } from '../../../types/case';
import { UserRole } from '../../../types/user';
import Page from '../page';
import {
  buildCaseListItem,
  buildSearchResponse,
} from '../../../components/cases/__fixtures__/builders';

jest.mock('../../../libs/session', () => ({ getCurrentUser: jest.fn() }));
jest.mock('../../../libs/auth-redirect', () => ({
  unauthorizedRedirect: jest.fn(),
}));
jest.mock('next-auth/react', () => ({ signOut: jest.fn() }));
jest.mock('next/navigation', () => ({
  redirect: jest.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

jest.mock('../../../services/cases', () => ({ fetchCasesFull: jest.fn() }));

jest.mock('../../../components/cases/table', () => ({
  __esModule: true,
  default: ({
    cases,
    initialPage,
  }: {
    cases: { result: { case_id: string }[] };
    initialPage?: number;
  }) => (
    <div data-testid="cases-table">
      <span data-testid="case-count">{cases.result.length}</span>
      <span data-testid="initial-page">{initialPage ?? 1}</span>
    </div>
  ),
}));

const mockFetchCasesFull = fetchCasesFull as jest.Mock;
const mockGetCurrentUser = getCurrentUser as jest.Mock;
const mockRedirect = redirect as unknown as jest.Mock;

function setupAuthenticatedSession(
  overrides: { user_id?: string; role?: UserRole } = {}
) {
  mockGetCurrentUser.mockResolvedValue({
    user_id: 'user-1',
    role: UserRole.ADMIN,
    ...overrides,
  });
}

function setupCases(cases = [buildCaseListItem()]) {
  mockFetchCasesFull.mockResolvedValue({
    success: true,
    data: buildSearchResponse(cases),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Cases Page', () => {
  describe('authentication', () => {
    it('should redirect to /login when there is no session', async () => {
      // Arrange
      mockGetCurrentUser.mockResolvedValue(null);
      const searchParams = Promise.resolve({});

      // Act & Assert
      await expect(Page({ searchParams })).rejects.toThrow(
        'NEXT_REDIRECT:/login'
      );
      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });

    it('should not redirect when there is an active session', async () => {
      // Arrange
      setupAuthenticatedSession();
      setupCases();
      const searchParams = Promise.resolve({});

      // Act
      await Page({ searchParams });

      // Assert
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('data fetching', () => {
    it('should apply the default (non-final) status filter when none is provided', async () => {
      // Arrange
      setupAuthenticatedSession();
      setupCases();
      const searchParams = Promise.resolve({});

      // Act
      await Page({ searchParams });

      // Assert
      const query = mockFetchCasesFull.mock.calls[0][0] as string;
      expect(query).not.toContain(`status=${CaseStatus.CLOSED}`);
      expect(query).not.toContain(`status=${CaseStatus.CANCELED}`);
      expect(query).toContain(`status=${CaseStatus.NEW}`);
    });

    it('should use the provided status params instead of the default when present', async () => {
      // Arrange
      setupAuthenticatedSession();
      setupCases();
      const searchParams = Promise.resolve({ status: [CaseStatus.CLOSED] });

      // Act
      await Page({ searchParams });

      // Assert
      expect(mockFetchCasesFull).toHaveBeenCalledWith(
        expect.stringContaining(`status=${CaseStatus.CLOSED}`),
        1
      );
      expect(mockFetchCasesFull.mock.calls[0][0]).not.toContain(
        `status=${CaseStatus.NEW}`
      );
    });

    it('should include external_reference when sinistro is provided', async () => {
      // Arrange
      setupAuthenticatedSession();
      setupCases();
      const searchParams = Promise.resolve({ sinistro: 'SIN-001' });

      // Act
      await Page({ searchParams });

      // Assert
      expect(mockFetchCasesFull).toHaveBeenCalledWith(
        expect.stringContaining('external_reference=SIN-001'),
        1
      );
    });

    it('should include contractor_id params when provided', async () => {
      // Arrange
      setupAuthenticatedSession();
      setupCases();
      const searchParams = Promise.resolve({
        contractor_id: ['contractor-1', 'contractor-2'],
      });

      // Act
      await Page({ searchParams });

      // Assert
      const query = mockFetchCasesFull.mock.calls[0][0] as string;
      expect(query).toContain('contractor_id=contractor-1');
      expect(query).toContain('contractor_id=contractor-2');
    });

    it('should include owner_id when only_mine is true', async () => {
      // Arrange
      setupAuthenticatedSession({ user_id: 'user-42' });
      setupCases();
      const searchParams = Promise.resolve({ only_mine: 'true' });

      // Act
      await Page({ searchParams });

      // Assert
      expect(mockFetchCasesFull).toHaveBeenCalledWith(
        expect.stringContaining('owner_id=user-42'),
        1
      );
    });

    it('should not include owner_id when only_mine is not set', async () => {
      // Arrange
      setupAuthenticatedSession({ user_id: 'user-42' });
      setupCases();
      const searchParams = Promise.resolve({});

      // Act
      await Page({ searchParams });

      // Assert
      expect(mockFetchCasesFull.mock.calls[0][0]).not.toContain('owner_id');
    });

    it('should fetch cases for the given page number', async () => {
      // Arrange
      setupAuthenticatedSession();
      setupCases();
      const searchParams = Promise.resolve({ page: 3 });

      // Act
      await Page({ searchParams });

      // Assert
      expect(mockFetchCasesFull).toHaveBeenCalledWith(expect.any(String), 3);
    });

    it('should filter out admin-only statuses for operator users', async () => {
      // Arrange
      setupAuthenticatedSession({ role: UserRole.OPERATOR });
      setupCases([
        buildCaseListItem({ case_id: 'case-1', status: CaseStatus.NEW }),
        buildCaseListItem({ case_id: 'case-2', status: CaseStatus.CLOSED }),
      ]);
      const searchParams = Promise.resolve({});

      // Act
      const jsx = await Page({ searchParams });
      render(jsx);

      // Assert
      expect(screen.getByTestId('case-count').textContent).toBe('1');
    });
  });

  describe('rendering', () => {
    it('should render CasesTable with the fetched cases', async () => {
      // Arrange
      setupAuthenticatedSession();
      setupCases([
        buildCaseListItem({ case_id: 'case-1' }),
        buildCaseListItem({ case_id: 'case-2' }),
      ]);
      const searchParams = Promise.resolve({});

      // Act
      const jsx = await Page({ searchParams });
      render(jsx);

      // Assert
      expect(screen.getByTestId('case-count').textContent).toBe('2');
    });

    it('should pass the page number to CasesTable', async () => {
      // Arrange
      setupAuthenticatedSession();
      setupCases();
      const searchParams = Promise.resolve({ page: 2 });

      // Act
      const jsx = await Page({ searchParams });
      render(jsx);

      // Assert
      expect(screen.getByTestId('initial-page').textContent).toBe('2');
    });
  });
});
