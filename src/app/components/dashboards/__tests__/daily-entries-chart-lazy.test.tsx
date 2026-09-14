import { render, screen } from '@testing-library/react';
import DailyEntriesChartLazy from '../daily-entries-chart-lazy';

jest.mock('next/dynamic', () => () => {
  function MockDailyEntriesChart({
    data,
    contractors,
    month,
  }: {
    data: unknown[];
    contractors: string[];
    month: string;
  }) {
    return (
      <div data-testid="daily-entries-chart">
        {data.length}|{contractors.join(',')}|{month}
      </div>
    );
  }
  return MockDailyEntriesChart;
});

describe('DailyEntriesChartLazy', () => {
  it('renders the chart with the given props', () => {
    render(
      <DailyEntriesChartLazy
        data={[{ day: '01' }, { day: '02' }]}
        contractors={['Seguradora A']}
        month="08"
      />
    );

    expect(screen.getByTestId('daily-entries-chart')).toHaveTextContent(
      '2|Seguradora A|08'
    );
  });
});
