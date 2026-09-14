import { render, screen } from '@testing-library/react';
import { ListTableSkeleton } from '../list-table-skeleton';

describe('ListTableSkeleton', () => {
  it('renders the title and every provided column header', () => {
    render(
      <ListTableSkeleton
        title="Clientes"
        columns={['Nome', 'Email', 'Ações']}
      />
    );

    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Ações')).toBeInTheDocument();
  });

  it('renders the requested number of placeholder rows', () => {
    const { container } = render(
      <ListTableSkeleton title="Clientes" columns={['Nome']} rows={3} />
    );

    expect(container.querySelectorAll('tbody tr').length).toBe(3);
  });
});
