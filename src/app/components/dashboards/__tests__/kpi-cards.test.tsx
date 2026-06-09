import { render, screen } from '@testing-library/react';
import KpiCards from '../kpi-cards';

jest.mock('../../../services/cases/fetch_dashboard_kpis', () => ({
  fetchDashboardKpis: jest.fn(),
}));

const { fetchDashboardKpis } = jest.requireMock(
  '../../../services/cases/fetch_dashboard_kpis'
);

const mockKpis = {
  success: true,
  message: '',
  data: {
    closedHistory: [
      { month: 'Abr', count: 82 },
      { month: 'Mai', count: 88 },
      { month: 'Jun', count: 102 },
    ],
    slaPercentage: 94.2,
    slaGoal: 90,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  fetchDashboardKpis.mockResolvedValue(mockKpis);
});

describe('KpiCards', () => {
  describe('rendering', () => {
    it('should render all KPI card titles', async () => {
      render(await KpiCards());
      expect(screen.getByText('Casos Finalizados')).toBeInTheDocument();
      expect(screen.getByText('SLA no Prazo')).toBeInTheDocument();
    });

    it('should render the closed cases count from the latest month', async () => {
      render(await KpiCards());
      expect(screen.getByText('102')).toBeInTheDocument();
    });

    it('should render the SLA percentage', async () => {
      render(await KpiCards());
      expect(screen.getByText('94.2%')).toBeInTheDocument();
    });

    it('should render the positive trend indicator for closed cases', async () => {
      render(await KpiCards());
      expect(screen.getByText(/\+\d+% vs mês anterior/)).toBeInTheDocument();
    });

    it('should render the SLA goal as achieved', async () => {
      render(await KpiCards());
      expect(screen.getByText(/Meta:/)).toBeInTheDocument();
      expect(screen.getByText(/Atingida/)).toBeInTheDocument();
    });

    it('should render mini history bars for the last 3 months', async () => {
      render(await KpiCards());
      expect(screen.getByText('Abr')).toBeInTheDocument();
      expect(screen.getByText('Mai')).toBeInTheDocument();
      expect(screen.getByText('Jun')).toBeInTheDocument();
    });

    it('should render fallback values when service fails', async () => {
      fetchDashboardKpis.mockResolvedValue({
        success: false,
        message: 'error',
      });
      render(await KpiCards());
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });
});
