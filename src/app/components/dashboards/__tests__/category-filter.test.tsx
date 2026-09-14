import { render, screen, fireEvent, within } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import CategoryFilter from '../category-filter';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useTransition: jest.fn(),
}));

const mockPush = jest.fn();

// Mirrors React's real useTransition: starts as false, flips to true as soon
// as startTransition runs, in the same synchronous batch as the click - so a
// click makes both `pendingKey` (real useState) and `isPending` (mocked)
// update together on the next render, like the real hook would.
let mockIsPending = false;

function setupMocks(searchParamsEntries: Record<string, string> = {}) {
  const params = new URLSearchParams(searchParamsEntries);

  (useSearchParams as jest.Mock).mockReturnValue({
    get: (key: string) => params.get(key),
    toString: () => params.toString(),
  });
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (usePathname as jest.Mock).mockReturnValue('/dashboards');
  (useTransition as jest.Mock).mockImplementation(() => [
    mockIsPending,
    (callback: () => void) => {
      mockIsPending = true;
      callback();
    },
  ]);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockIsPending = false;
});

describe('CategoryFilter', () => {
  describe('rendering', () => {
    it('should render "Todos" plus one option per case category', () => {
      setupMocks();
      render(<CategoryFilter />);
      expect(screen.getByText('Todos')).toBeInTheDocument();
      expect(screen.getByText('D+')).toBeInTheDocument();
      expect(screen.getByText('Móveis')).toBeInTheDocument();
    });

    it('should have "Todos" active when there is no category param', () => {
      setupMocks();
      render(<CategoryFilter />);
      expect(screen.getByText('Todos').className).toContain('bg-sky-100');
    });

    it('should have the matching option active when category param is set', () => {
      setupMocks({ category: 'd+' });
      render(<CategoryFilter />);
      expect(screen.getByText('D+').className).toContain('bg-sky-100');
      expect(screen.getByText('Todos').className).not.toContain('bg-sky-100');
    });
  });

  describe('interaction', () => {
    it('should set category param when a category option is clicked', () => {
      setupMocks();
      render(<CategoryFilter />);

      fireEvent.click(screen.getByText('Móveis'));

      expect(mockPush).toHaveBeenCalledWith('/dashboards?category=furniture');
    });

    it('should remove category param when "Todos" is clicked', () => {
      setupMocks({ category: 'furniture' });
      render(<CategoryFilter />);

      fireEvent.click(screen.getByText('Todos'));

      expect(mockPush).toHaveBeenCalledWith('/dashboards?');
    });

    it('should not navigate when clicking the already-active option', () => {
      setupMocks({ category: 'furniture' });
      render(<CategoryFilter />);

      fireEvent.click(screen.getByText('Móveis'));

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should disable every option and show a spinner only on the clicked one', () => {
      setupMocks();
      render(<CategoryFilter />);

      fireEvent.click(screen.getByText('Móveis'));

      for (const button of screen.getAllByRole('button')) {
        expect(button).toBeDisabled();
      }

      const moveisButton = screen.getByText('Móveis').closest('button')!;
      expect(moveisButton).toHaveAttribute('aria-busy', 'true');
      expect(
        within(moveisButton).getByTestId('category-filter-spinner')
      ).toBeInTheDocument();

      const todosButton = screen.getByText('Todos').closest('button')!;
      expect(todosButton).toHaveAttribute('aria-busy', 'false');
      expect(
        within(todosButton).queryByTestId('category-filter-spinner')
      ).not.toBeInTheDocument();
    });

    it('should not disable options when there is no pending navigation', () => {
      setupMocks();
      render(<CategoryFilter />);

      for (const button of screen.getAllByRole('button')) {
        expect(button).not.toBeDisabled();
      }
    });
  });
});
