import { render, screen } from '@testing-library/react';
import PerformanceChart from '../performance-chart';

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: ({ dataKey }: { dataKey: string }) => (
    <div data-testid={`line-${dataKey}`} />
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

describe('PerformanceChart', () => {
  describe('rendering', () => {
    it('should render the section title', () => {
      render(<PerformanceChart />);
      expect(screen.getByText('Evolução de Desempenho')).toBeInTheDocument();
    });

    it('should render the "Ver Histórico" action link', () => {
      render(<PerformanceChart />);
      expect(screen.getByText(/Ver Histórico/)).toBeInTheDocument();
    });

    it('should render the chart container', () => {
      render(<PerformanceChart />);
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render the line for cases data', () => {
      render(<PerformanceChart />);
      expect(screen.getByTestId('line-cases')).toBeInTheDocument();
    });

    it('should render the line for SLA data', () => {
      render(<PerformanceChart />);
      expect(screen.getByTestId('line-sla')).toBeInTheDocument();
    });

    it('should render the line for points data', () => {
      render(<PerformanceChart />);
      expect(screen.getByTestId('line-points')).toBeInTheDocument();
    });
  });
});
