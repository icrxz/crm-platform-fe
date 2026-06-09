import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import Page from '../page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

jest.mock('../../../libs/session', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('../../../components/dashboards/kpi-cards', () => ({
  __esModule: true,
  default: () => <div data-testid="kpi-cards" />,
}));

jest.mock('../../../components/dashboards/ranking', () => ({
  __esModule: true,
  default: () => <div data-testid="ranking" />,
}));

jest.mock('../../../components/dashboards/attendance-bonus', () => ({
  __esModule: true,
  default: () => <div data-testid="attendance-bonus" />,
}));

jest.mock('../../../components/dashboards/performance-chart', () => ({
  __esModule: true,
  default: () => <div data-testid="performance-chart" />,
}));

jest.mock('../../../components/dashboards/skeletons', () => ({
  KpiCardsSkeleton: () => <div data-testid="kpi-cards-skeleton" />,
  RankingSkeleton: () => <div data-testid="ranking-skeleton" />,
  ChartSkeleton: () => <div data-testid="chart-skeleton" />,
  AttendanceBonusSkeleton: () => (
    <div data-testid="attendance-bonus-skeleton" />
  ),
}));

jest.mock('@heroicons/react/24/outline', () => ({
  TrophyIcon: () => <svg data-testid="trophy-icon" />,
}));

const { getCurrentUser } = jest.requireMock('../../../libs/session');
const mockUser = { id: 'user-1', role: 'admin', name: 'Test User' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Page', () => {
  describe('authentication', () => {
    it('should redirect to /login when user is not authenticated', async () => {
      getCurrentUser.mockResolvedValue(null);
      await expect(Page()).rejects.toThrow('NEXT_REDIRECT:/login');
      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('should not redirect when user is authenticated', async () => {
      getCurrentUser.mockResolvedValue(mockUser);
      await Page();
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('rendering', () => {
    beforeEach(() => {
      getCurrentUser.mockResolvedValue(mockUser);
    });

    it('should render the page title', async () => {
      render(await Page());
      expect(screen.getByText('Desempenho do Time')).toBeInTheDocument();
    });

    it('should render the page subtitle', async () => {
      render(await Page());
      expect(
        screen.getByText(
          'Acompanhe rankings, assiduidade e evolução no atendimento'
        )
      ).toBeInTheDocument();
    });

    it('should render the KPI cards', async () => {
      render(await Page());
      expect(screen.getByTestId('kpi-cards')).toBeInTheDocument();
    });

    it('should render the ranking', async () => {
      render(await Page());
      expect(screen.getByTestId('ranking')).toBeInTheDocument();
    });

    it('should render the attendance bonus board', async () => {
      render(await Page());
      expect(screen.getByTestId('attendance-bonus')).toBeInTheDocument();
    });

    it('should render the performance chart', async () => {
      render(await Page());
      expect(screen.getByTestId('performance-chart')).toBeInTheDocument();
    });
  });
});
