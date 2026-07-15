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

const mockData = [
  { week: 'S1', tma: 4.2, volume: 38 },
  { week: 'S2', tma: 3.8, volume: 42 },
  { week: 'S3', tma: 5.1, volume: 55 },
  { week: 'S4', tma: 4.6, volume: 50 },
  { week: 'S5', tma: 3.5, volume: 44 },
  { week: 'S6', tma: 3.2, volume: 47 },
];

describe('PerformanceChart', () => {
  describe('rendering', () => {
    it('should render the section title', () => {
      render(<PerformanceChart data={mockData} />);
      expect(
        screen.getByText('Evolução de Desempenho (TMA)')
      ).toBeInTheDocument();
    });

    it('should render the subtitle', () => {
      render(<PerformanceChart data={mockData} />);
      expect(
        screen.getByText(
          'Tempo Mediano de Atendimento (dias úteis) vs Volume Recebido'
        )
      ).toBeInTheDocument();
    });

    it('should render the chart container', () => {
      render(<PerformanceChart data={mockData} />);
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render the TMA line', () => {
      render(<PerformanceChart data={mockData} />);
      expect(screen.getByTestId('line-tma')).toBeInTheDocument();
    });

    it('should render the volume line', () => {
      render(<PerformanceChart data={mockData} />);
      expect(screen.getByTestId('line-volume')).toBeInTheDocument();
    });
  });
});
