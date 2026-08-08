import { render, screen } from '@testing-library/react';
import DailyEntriesChartServer from '../daily-entries-chart-server';

jest.mock('../daily-entries-chart-lazy', () => ({
  __esModule: true,
  default: ({
    data,
    contractors,
    month,
  }: {
    data: unknown[];
    contractors: string[];
    month: string;
  }) => (
    <div data-testid="daily-entries-chart-lazy">
      {data.length}|{contractors.join(',')}|{month}
    </div>
  ),
}));

jest.mock('../../../services/cases/fetch_daily_entries', () => ({
  fetchDailyEntries: jest.fn(),
}));

const { fetchDailyEntries } = jest.requireMock(
  '../../../services/cases/fetch_daily_entries'
);

describe('DailyEntriesChartServer', () => {
  it('passes fetched data down to the lazy chart', async () => {
    fetchDailyEntries.mockResolvedValue({
      success: true,
      message: '',
      data: {
        data: [{ day: '01' }, { day: '02' }],
        contractors: ['Seguradora A'],
        month: '08',
      },
    });

    render(await DailyEntriesChartServer());

    expect(screen.getByTestId('daily-entries-chart-lazy')).toHaveTextContent(
      '2|Seguradora A|08'
    );
  });

  it('falls back to empty data when the service fails', async () => {
    fetchDailyEntries.mockResolvedValue({
      success: false,
      message: 'error',
    });

    render(await DailyEntriesChartServer());

    expect(screen.getByTestId('daily-entries-chart-lazy').textContent).toMatch(
      /^0\|\|/
    );
  });
});
