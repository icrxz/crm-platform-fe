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
      expect(
        screen.getByText('Evolução de Desempenho (TMA)')
      ).toBeInTheDocument();
    });

    it('should render the subtitle', () => {
      render(<PerformanceChart />);
      expect(
        screen.getByText('Tempo Médio de Atendimento vs Volume Recebido')
      ).toBeInTheDocument();
    });

    it('should render the chart container', () => {
      render(<PerformanceChart />);
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render the TMA line', () => {
      render(<PerformanceChart />);
      expect(screen.getByTestId('line-tma')).toBeInTheDocument();
    });

    it('should render the volume line', () => {
      render(<PerformanceChart />);
      expect(screen.getByTestId('line-volume')).toBeInTheDocument();
    });
  });
});
