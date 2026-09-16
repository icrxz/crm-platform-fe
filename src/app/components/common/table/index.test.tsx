import { render, screen, fireEvent, within } from '@testing-library/react';
import { Table, TableColumn } from './index';

interface Row {
  id: string;
  name: string;
}

const columns: TableColumn<Row>[] = [
  { key: 'name', header: 'Nome', render: (row) => row.name },
];

const rows: Row[] = [
  { id: '1', name: 'João' },
  { id: '2', name: 'Maria' },
];

describe('Table', () => {
  it('renders a header and a cell per column', () => {
    render(<Table columns={columns} data={rows} rowKey={(row) => row.id} />);

    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('João')).toBeInTheDocument();
    expect(screen.getByText('Maria')).toBeInTheDocument();
  });

  it('calls onRowClick with the clicked row', () => {
    const onRowClick = jest.fn();
    render(
      <Table
        columns={columns}
        data={rows}
        rowKey={(row) => row.id}
        onRowClick={onRowClick}
      />
    );

    fireEvent.click(screen.getByText('João').closest('tr')!);
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it('does not attach a click handler when onRowClick is not given', () => {
    render(<Table columns={columns} data={rows} rowKey={(row) => row.id} />);

    const row = screen.getByText('João').closest('tr')!;
    expect(row).not.toHaveClass('cursor-pointer');
  });

  it('respects isRowClickable to skip a row even when onRowClick is given', () => {
    const onRowClick = jest.fn();
    render(
      <Table
        columns={columns}
        data={rows}
        rowKey={(row) => row.id}
        onRowClick={onRowClick}
        isRowClickable={(row) => row.id !== '1'}
      />
    );

    fireEvent.click(screen.getByText('João').closest('tr')!);
    expect(onRowClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Maria').closest('tr')!);
    expect(onRowClick).toHaveBeenCalledWith(rows[1]);
  });

  it('renders skeleton rows instead of data when isLoading', () => {
    const { container } = render(
      <Table
        columns={columns}
        data={rows}
        rowKey={(row) => row.id}
        isLoading
        skeletonRows={3}
      />
    );

    expect(screen.queryByText('João')).not.toBeInTheDocument();
    expect(container.querySelectorAll('tbody tr').length).toBe(3);
  });

  it('applies compact horizontal padding when density is compact', () => {
    render(
      <Table
        columns={columns}
        data={rows}
        rowKey={(row) => row.id}
        density="compact"
      />
    );

    const table = screen.getByRole('table');
    const headerCell = within(table).getByText('Nome');
    expect(headerCell).toHaveClass('px-2');
  });
});
