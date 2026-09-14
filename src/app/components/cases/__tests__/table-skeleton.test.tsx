import { render, screen } from '@testing-library/react';
import { CasesTableSkeleton } from '../table-skeleton';

describe('CasesTableSkeleton', () => {
  it('renders the page title and every real column header', () => {
    render(<CasesTableSkeleton />);

    expect(screen.getByText('Casos')).toBeInTheDocument();
    [
      'Sinistro',
      'Cliente',
      'Cidade',
      'Seguradora',
      'Categoria',
      'Técnico',
      'Status',
      'Vencimento',
    ].forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  it('renders placeholder rows', () => {
    const { container } = render(<CasesTableSkeleton />);

    expect(container.querySelectorAll('tbody tr').length).toBe(8);
  });
});
