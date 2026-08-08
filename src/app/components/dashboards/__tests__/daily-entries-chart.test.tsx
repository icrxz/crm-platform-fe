import { render, screen } from '@testing-library/react';
import DailyEntriesChart from '../daily-entries-chart';

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ dataKey }: { dataKey: string }) => (
    <div data-testid={`bar-${dataKey}`} />
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

const mockData = [
  { day: '01', 'Seguradora A': 3, 'Seguradora B': 1 },
  { day: '02', 'Seguradora A': 0, 'Seguradora B': 2 },
];
const mockContractors = ['Seguradora A', 'Seguradora B'];

describe('DailyEntriesChart', () => {
  describe('rendering', () => {
    it('should render the section title', () => {
      render(
        <DailyEntriesChart
          data={mockData}
          contractors={mockContractors}
          month="08"
        />
      );
      expect(screen.getByText('Entrada de Casos por Dia')).toBeInTheDocument();
    });

    it('should render the subtitle', () => {
      render(
        <DailyEntriesChart
          data={mockData}
          contractors={mockContractors}
          month="08"
        />
      );
      expect(
        screen.getByText('Casos criados no mês, por seguradora')
      ).toBeInTheDocument();
    });

    it('should render the chart container', () => {
      render(
        <DailyEntriesChart
          data={mockData}
          contractors={mockContractors}
          month="08"
        />
      );
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render one bar per contractor', () => {
      render(
        <DailyEntriesChart
          data={mockData}
          contractors={mockContractors}
          month="08"
        />
      );
      expect(screen.getByTestId('bar-Seguradora A')).toBeInTheDocument();
      expect(screen.getByTestId('bar-Seguradora B')).toBeInTheDocument();
    });

    it('should render no bars when there are no contractors', () => {
      render(<DailyEntriesChart data={mockData} contractors={[]} month="08" />);
      expect(screen.queryByTestId('bar-Seguradora A')).not.toBeInTheDocument();
      expect(screen.queryByTestId('bar-Seguradora B')).not.toBeInTheDocument();
    });
  });
});
