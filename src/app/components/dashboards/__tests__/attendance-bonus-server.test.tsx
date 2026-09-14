import { render, screen } from '@testing-library/react';
import AttendanceBonusServer from '../attendance-bonus-server';

jest.mock('../attendance-bonus', () => ({
  __esModule: true,
  default: ({
    employees,
  }: {
    employees: { id: string; name: string; isAbsent: boolean }[];
  }) => (
    <div data-testid="attendance-bonus">
      {employees.map((e) => `${e.id}:${e.name}:${e.isAbsent}`).join('|')}
    </div>
  ),
}));

jest.mock('../../../services/users/fetch_operators', () => ({
  fetchOperators: jest.fn(),
}));

const { fetchOperators } = jest.requireMock(
  '../../../services/users/fetch_operators'
);

describe('AttendanceBonusServer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('marks a user absent this month', async () => {
    const now = new Date().toISOString();
    fetchOperators.mockResolvedValue({
      success: true,
      message: '',
      data: [
        {
          user_id: 'user-1',
          first_name: 'João',
          last_name: 'Silva',
          last_absence_at: now,
        },
      ],
    });

    render(await AttendanceBonusServer());

    expect(screen.getByTestId('attendance-bonus')).toHaveTextContent(
      'user-1:João Silva:true'
    );
  });

  it('does not mark a user absent if the absence is from a previous month', async () => {
    const lastMonth = new Date();
    lastMonth.setUTCMonth(lastMonth.getUTCMonth() - 1);

    fetchOperators.mockResolvedValue({
      success: true,
      message: '',
      data: [
        {
          user_id: 'user-1',
          first_name: 'João',
          last_name: 'Silva',
          last_absence_at: lastMonth.toISOString(),
        },
      ],
    });

    render(await AttendanceBonusServer());

    expect(screen.getByTestId('attendance-bonus')).toHaveTextContent(
      'user-1:João Silva:false'
    );
  });

  it('renders no employees when the service fails', async () => {
    fetchOperators.mockResolvedValue({ success: false, message: 'error' });

    render(await AttendanceBonusServer());

    expect(screen.getByTestId('attendance-bonus')).toHaveTextContent('');
  });
});
