import { act, render, screen } from '@testing-library/react';
import AutoRefresh from '../auto-refresh';

const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

describe('AutoRefresh', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockRefresh.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the initial countdown as mm:ss', () => {
    render(<AutoRefresh />);
    expect(screen.getByText('05:00')).toBeInTheDocument();
  });

  it('counts down every second', () => {
    render(<AutoRefresh />);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByText('04:57')).toBeInTheDocument();
  });

  it('refreshes the router and resets the countdown when it reaches zero', () => {
    render(<AutoRefresh />);

    act(() => {
      jest.advanceTimersByTime(300_000);
    });

    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(screen.getByText('05:00')).toBeInTheDocument();
  });
});
