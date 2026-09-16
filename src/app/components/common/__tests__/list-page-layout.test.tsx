import { render, screen, fireEvent } from '@testing-library/react';
import { ListPageLayout } from '../list-page-layout';

describe('ListPageLayout', () => {
  it('renders the title, search bar, children and pagination', () => {
    render(
      <ListPageLayout
        title="Clientes"
        searchBar={<div>Busca</div>}
        pagination={<div>Paginação</div>}
      >
        <p>Conteúdo</p>
      </ListPageLayout>
    );

    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByText('Busca')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
    expect(screen.getByText('Paginação')).toBeInTheDocument();
  });

  it('renders children (not the empty state) when isEmpty is false', () => {
    render(
      <ListPageLayout title="Clientes">
        <p>Conteúdo</p>
      </ListPageLayout>
    );

    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
    expect(
      screen.queryByText('Nenhum resultado encontrado.')
    ).not.toBeInTheDocument();
  });

  it('renders the empty state instead of children when isEmpty is true', () => {
    render(
      <ListPageLayout title="Clientes" isEmpty>
        <p>Conteúdo</p>
      </ListPageLayout>
    );

    expect(screen.queryByText('Conteúdo')).not.toBeInTheDocument();
    expect(
      screen.getByText('Nenhum resultado encontrado.')
    ).toBeInTheDocument();
  });

  it('passes a custom empty message through to the empty state', () => {
    render(
      <ListPageLayout title="Clientes" isEmpty emptyMessage="Nenhum cliente.">
        <p>Conteúdo</p>
      </ListPageLayout>
    );

    expect(screen.getByText('Nenhum cliente.')).toBeInTheDocument();
  });

  it('wires onRefresh to the empty state refresh button', () => {
    const onRefresh = jest.fn();
    render(
      <ListPageLayout title="Clientes" isEmpty onRefresh={onRefresh}>
        <p>Conteúdo</p>
      </ListPageLayout>
    );

    fireEvent.click(screen.getByRole('button', { name: /atualizar/i }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
