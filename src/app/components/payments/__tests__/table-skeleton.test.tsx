import { render, screen } from '@testing-library/react';
import { PaymentsTableSkeleton } from '../table-skeleton';

describe('PaymentsTableSkeleton', () => {
  it('renders the page title and every real column header', () => {
    render(<PaymentsTableSkeleton />);

    expect(screen.getByText('Pagamentos')).toBeInTheDocument();
    [
      'Sinistro',
      'Segurado',
      'Técnico',
      'PIX',
      'MO',
      'Deslocamento',
      'Peças',
      'Total',
      'Status',
      'Data de criação',
      'Ações',
    ].forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  it('renders placeholder rows', () => {
    const { container } = render(<PaymentsTableSkeleton />);

    expect(container.querySelectorAll('tbody tr').length).toBe(8);
  });
});
