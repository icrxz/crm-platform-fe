import { render, screen, within } from '@testing-library/react';
import PartnerBookTable from '../book-table';
import { PartnerBookCaseItem } from '@/app/types/partner-book-item';
import { SearchResponse } from '@/app/types/search_response';

jest.mock('next/link', () => {
  return function Link({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) {
    return <a href={href}>{children}</a>;
  };
});

function buildItem(
  overrides: Partial<PartnerBookCaseItem> = {}
): PartnerBookCaseItem {
  return {
    case_id: 'case-001',
    created_at: '2024-03-15T10:00:00Z',
    type: 'repair',
    external_reference: 'SIN-001',
    customer_document: '111.222.333-44',
    customer_first_name: 'Maria',
    customer_last_name: 'Santos',
    customer_city: 'São Paulo',
    payment_total: 230,
    payment_status: 'pending',
    ...overrides,
  };
}

function buildResponse(
  result: PartnerBookCaseItem[]
): SearchResponse<PartnerBookCaseItem> {
  return { result, paging: { total: result.length, limit: 10, offset: 0 } };
}

// The mobile card list duplicates every row's content outside the desktop
// <table> (see ListItemCardGroup) — scope row/cell assertions to the table
// so they don't match both.
function getTable() {
  return within(screen.getByRole('table'));
}

describe('PartnerBookTable', () => {
  it('renders the Sinistro column as a link to the case', () => {
    render(<PartnerBookTable cases={buildResponse([buildItem()])} />);

    const link = getTable().getByText('SIN-001').closest('a');
    expect(link).toHaveAttribute('href', '/cases/case-001');
  });

  it('shows the customer name and city', () => {
    render(<PartnerBookTable cases={buildResponse([buildItem()])} />);

    expect(getTable().getByText('Maria Santos')).toBeInTheDocument();
    expect(getTable().getByText('São Paulo')).toBeInTheDocument();
  });

  it('does not render a Seguradora column', () => {
    render(<PartnerBookTable cases={buildResponse([buildItem()])} />);

    expect(screen.queryByText('Seguradora')).not.toBeInTheDocument();
  });

  it('shows the consolidated payment total', () => {
    render(
      <PartnerBookTable
        cases={buildResponse([buildItem({ payment_total: 230 })])}
      />
    );

    expect(getTable().getByText('R$ 230,00')).toBeInTheDocument();
  });

  it('shows "Pago" and the payment date when paid', () => {
    render(
      <PartnerBookTable
        cases={buildResponse([
          buildItem({
            payment_status: 'paid',
            paid_at: '2024-05-03T10:00:00Z',
          }),
        ])}
      />
    );

    expect(getTable().getByText('Pago')).toBeInTheDocument();
    expect(getTable().getByText('03/05/2024')).toBeInTheDocument();
  });

  it('shows "Pendente" and no payment date when not paid', () => {
    render(
      <PartnerBookTable
        cases={buildResponse([buildItem({ payment_status: 'pending' })])}
      />
    );

    expect(getTable().getByText('Pendente')).toBeInTheDocument();
  });

  it('highlights duplicate customer documents', () => {
    render(
      <PartnerBookTable
        cases={buildResponse([
          buildItem({ case_id: 'case-001', customer_document: 'doc-1' }),
          buildItem({ case_id: 'case-002', customer_document: 'doc-1' }),
        ])}
      />
    );

    const names = getTable().getAllByText('Maria Santos');
    expect(names[0]).toHaveClass('text-red-500');
    expect(names[1]).toHaveClass('text-red-500');
  });
});
