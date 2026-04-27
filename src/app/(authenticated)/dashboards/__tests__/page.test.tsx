import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import Page from '../page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('../../../libs/session', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('../../../components/dashboards/period-filter', () => ({
  __esModule: true,
  default: () => <div data-testid="period-filter" />,
}));

jest.mock('../../../components/dashboards/kpi-cards', () => ({
  __esModule: true,
  default: () => <div data-testid="kpi-cards" />,
}));

jest.mock('../../../components/dashboards/ranking', () => ({
  __esModule: true,
  default: () => <div data-testid="ranking" />,
}));

jest.mock('../../../components/dashboards/achievements', () => ({
  __esModule: true,
  default: () => <div data-testid="achievements" />,
}));

jest.mock('../../../components/dashboards/performance-chart', () => ({
  __esModule: true,
  default: () => <div data-testid="performance-chart" />,
}));

jest.mock('../../../components/dashboards/rewards', () => ({
  __esModule: true,
  default: () => <div data-testid="rewards" />,
}));

jest.mock('../../../components/dashboards/skeletons', () => ({
  KpiCardsSkeleton: () => <div data-testid="kpi-cards-skeleton" />,
  RankingSkeleton: () => <div data-testid="ranking-skeleton" />,
  ChartSkeleton: () => <div data-testid="chart-skeleton" />,
  GenericSkeleton: () => <div data-testid="generic-skeleton" />,
}));

jest.mock('@heroicons/react/24/outline', () => ({
  TrophyIcon: () => <svg data-testid="trophy-icon" />,
}));

const { getCurrentUser } = jest.requireMock('../../../libs/session');
const mockUser = { id: 'user-1', role: 'ADMIN', name: 'Test User' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Page', () => {
  describe('authentication', () => {
    it('should redirect to /login when user is not authenticated', async () => {
      getCurrentUser.mockResolvedValue(null);
      await Page();
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
          'Acompanhe rankings, conquistas e evolução no atendimento'
        )
      ).toBeInTheDocument();
    });

    it('should render the period filter', async () => {
      render(await Page());
      expect(screen.getByTestId('period-filter')).toBeInTheDocument();
    });

    it('should render the KPI cards', async () => {
      render(await Page());
      expect(screen.getByTestId('kpi-cards')).toBeInTheDocument();
    });

    it('should render the ranking', async () => {
      render(await Page());
      expect(screen.getByTestId('ranking')).toBeInTheDocument();
    });

    it('should render the achievements', async () => {
      render(await Page());
      expect(screen.getByTestId('achievements')).toBeInTheDocument();
    });

    it('should render the performance chart', async () => {
      render(await Page());
      expect(screen.getByTestId('performance-chart')).toBeInTheDocument();
    });

    it('should render the rewards', async () => {
      render(await Page());
      expect(screen.getByTestId('rewards')).toBeInTheDocument();
    });
  });
});
