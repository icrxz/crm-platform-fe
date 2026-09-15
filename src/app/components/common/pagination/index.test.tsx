import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Pagination } from './index';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@heroui/pagination', () => ({
  Pagination: ({
    onChange,
    total,
    page,
  }: {
    onChange: (page: number) => void;
    total: number;
    page: number;
  }) => (
    <div>
      <span data-testid="pagination-total">{total}</span>
      <span data-testid="pagination-current">{page}</span>
      <button onClick={() => onChange(2)}>Go to page 2</button>
    </div>
  ),
}));

describe('Pagination', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
    (usePathname as jest.Mock).mockReturnValue('/customers');
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams('sinistro=abc')
    );
  });

  it('calculates total pages from paging.total/paging.limit', () => {
    render(<Pagination paging={{ total: 95, limit: 10 }} page={1} />);
    expect(screen.getByTestId('pagination-total')).toHaveTextContent('10');
  });

  it('defaults to a single page when paging is missing', () => {
    render(<Pagination page={1} />);
    expect(screen.getByTestId('pagination-total')).toHaveTextContent('1');
  });

  it('defaults to page 1 when page is missing', () => {
    render(<Pagination paging={{ total: 20, limit: 10 }} />);
    expect(screen.getByTestId('pagination-current')).toHaveTextContent('1');
  });

  it('preserves existing query params when changing page', () => {
    render(<Pagination paging={{ total: 95, limit: 10 }} page={1} />);

    fireEvent.click(screen.getByText('Go to page 2'));

    expect(push).toHaveBeenCalledWith('/customers?sinistro=abc&page=2');
  });
});
