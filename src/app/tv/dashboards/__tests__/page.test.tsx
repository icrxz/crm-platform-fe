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

jest.mock('../../../components/dashboards/category-filter', () => ({
  __esModule: true,
  default: () => <div data-testid="category-filter" />,
}));

jest.mock('../../../components/dashboards/kpi-cards', () => ({
  __esModule: true,
  default: () => <div data-testid="kpi-cards" />,
}));

jest.mock('../../../components/dashboards/ranking', () => ({
  __esModule: true,
  default: () => <div data-testid="ranking" />,
}));

jest.mock('../../../components/dashboards/attendance-bonus-server', () => ({
  __esModule: true,
  default: () => <div data-testid="attendance-bonus" />,
}));

jest.mock('../../../components/dashboards/performance-chart-server', () => ({
  __esModule: true,
  default: () => <div data-testid="performance-chart" />,
}));

jest.mock('../../../components/dashboards/daily-entries-chart-server', () => ({
  __esModule: true,
  default: () => <div data-testid="daily-entries-chart" />,
}));

jest.mock('../../../components/dashboards/skeletons', () => ({
  KpiCardsSkeleton: () => <div data-testid="kpi-cards-skeleton" />,
  RankingSkeleton: () => <div data-testid="ranking-skeleton" />,
  ChartSkeleton: () => <div data-testid="chart-skeleton" />,
  AttendanceBonusSkeleton: () => (
    <div data-testid="attendance-bonus-skeleton" />
  ),
}));

jest.mock('../../../components/tv/auto-refresh', () => ({
  __esModule: true,
  default: () => <div data-testid="auto-refresh" />,
}));

jest.mock('@heroicons/react/24/outline', () => ({
  TrophyIcon: () => <svg data-testid="trophy-icon" />,
}));

const { getCurrentUser } = jest.requireMock('../../../libs/session');
const mockAdminUser = { id: 'user-1', role: 'admin', name: 'Test User' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TvDashboardPage', () => {
  describe('authentication', () => {
    it('should redirect to /login when user is not authenticated', async () => {
      getCurrentUser.mockResolvedValue(null);
      await expect(Page({ searchParams: Promise.resolve({}) })).rejects.toThrow(
        'NEXT_REDIRECT:/login'
      );
      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('should redirect to /home when user lacks admin role', async () => {
      getCurrentUser.mockResolvedValue({ id: 'user-2', role: 'operator' });
      await expect(Page({ searchParams: Promise.resolve({}) })).rejects.toThrow(
        'NEXT_REDIRECT:/home'
      );
      expect(redirect).toHaveBeenCalledWith('/home');
    });

    it('should not redirect when user has admin role', async () => {
      getCurrentUser.mockResolvedValue(mockAdminUser);
      await Page({ searchParams: Promise.resolve({}) });
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('rendering', () => {
    beforeEach(() => {
      getCurrentUser.mockResolvedValue(mockAdminUser);
    });

    it('should render the page title', async () => {
      render(await Page({ searchParams: Promise.resolve({}) }));
      expect(screen.getByText('Desempenho do Time')).toBeInTheDocument();
    });

    it('should render the auto-refresh component', async () => {
      render(await Page({ searchParams: Promise.resolve({}) }));
      expect(screen.getByTestId('auto-refresh')).toBeInTheDocument();
    });

    it('should render KPI cards', async () => {
      render(await Page({ searchParams: Promise.resolve({}) }));
      expect(screen.getByTestId('kpi-cards')).toBeInTheDocument();
    });

    it('should render the ranking', async () => {
      render(await Page({ searchParams: Promise.resolve({}) }));
      expect(screen.getByTestId('ranking')).toBeInTheDocument();
    });

    it('should render the attendance bonus board', async () => {
      render(await Page({ searchParams: Promise.resolve({}) }));
      expect(screen.getByTestId('attendance-bonus')).toBeInTheDocument();
    });

    it('should render the performance chart', async () => {
      render(await Page({ searchParams: Promise.resolve({}) }));
      expect(screen.getByTestId('performance-chart')).toBeInTheDocument();
    });

    it('should render the daily entries chart', async () => {
      render(await Page({ searchParams: Promise.resolve({}) }));
      expect(screen.getByTestId('daily-entries-chart')).toBeInTheDocument();
    });
  });
});
