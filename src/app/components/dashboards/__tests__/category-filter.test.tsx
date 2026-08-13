import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import CategoryFilter from '../category-filter';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

const mockPush = jest.fn();

function setupMocks(searchParamsEntries: Record<string, string> = {}) {
  const params = new URLSearchParams(searchParamsEntries);

  (useSearchParams as jest.Mock).mockReturnValue({
    get: (key: string) => params.get(key),
    toString: () => params.toString(),
  });
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (usePathname as jest.Mock).mockReturnValue('/dashboards');
}

beforeEach(() => {
  jest.clearAllMocks();
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
  });
});
