import { render, screen } from '@testing-library/react';
import CardWrapper from '../cards';
import { fetchCases } from '../../../services/cases';
import { UserRole } from '../../../types/user';

jest.mock('../../../services/cases', () => ({
  fetchCases: jest.fn(),
}));

const mockFetchCases = fetchCases as jest.Mock;

function totalFor(count: number) {
  return {
    success: true,
    message: '',
    data: { result: [], paging: { total: count, limit: 1, offset: 0 } },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CardWrapper', () => {
  it('shows the four admin cards with the counts for each query', async () => {
    mockFetchCases.mockImplementation((query: string) => {
      if (query === 'status=Draft&status=New') return totalFor(3);
      if (query.includes('status=Payment') && !query.includes('status=Receipt'))
        return totalFor(5);
      if (query === 'status=Receipt') return totalFor(2);
      return totalFor(11);
    });

    const jsx = await CardWrapper({
      user: { user_id: 'user-1', role: UserRole.ADMIN },
    });
    render(jsx);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Casos sem responsável')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('Casos atribuídos pendentes')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Pendentes de valores')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Pendentes de comprovante')).toBeInTheDocument();

    expect(
      screen.getByText('Casos sem responsável').closest('a')
    ).toHaveAttribute('href', '/cases?status=Draft&status=New');
    expect(
      screen.getByText('Pendentes de valores').closest('a')
    ).toHaveAttribute('href', '/cases?status=Payment');
    expect(
      screen.getByText('Pendentes de comprovante').closest('a')
    ).toHaveAttribute('href', '/payments');
  });

  it('scopes "atribuídos" to CustomerInfo through Report, excluding intake and back-office statuses', async () => {
    mockFetchCases.mockResolvedValue(totalFor(0));

    const jsx = await CardWrapper({
      user: { user_id: 'user-1', role: UserRole.ADMIN },
    });
    render(jsx);

    const assignedHref = screen
      .getByText('Casos atribuídos pendentes')
      .closest('a')
      ?.getAttribute('href');

    expect(assignedHref).not.toContain('status=Draft');
    expect(assignedHref).not.toContain('status=New');
    expect(assignedHref).not.toContain('status=Payment');
    expect(assignedHref).not.toContain('status=Receipt');
    expect(assignedHref).not.toContain('status=Closed');
    expect(assignedHref).not.toContain('status=Canceled');
    expect(assignedHref).toContain('status=CustomerInfo');
    expect(assignedHref).toContain('status=WaitingPartner');
    expect(assignedHref).toContain('status=Ongoing');
    expect(assignedHref).toContain('status=Report');
  });

  it('shows only two cards for operators, scoped to their own cases', async () => {
    mockFetchCases.mockImplementation((query: string) => {
      if (query === 'status=Draft&status=New') return totalFor(7);
      return totalFor(4);
    });

    const jsx = await CardWrapper({
      user: { user_id: 'operator-1', role: UserRole.OPERATOR },
    });
    render(jsx);

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Casos sem responsável')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Meus casos pendentes')).toBeInTheDocument();
    expect(
      screen.queryByText('Casos atribuídos pendentes')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Pendentes de comprovante')
    ).not.toBeInTheDocument();

    expect(
      screen.getByText('Meus casos pendentes').closest('a')
    ).toHaveAttribute('href', '/cases?only_mine=true');

    const mineCall = mockFetchCases.mock.calls.find(([query]) =>
      query.includes('owner_id=operator-1')
    );
    expect(mineCall?.[0]).not.toContain('status=Payment');
    expect(mineCall?.[0]).not.toContain('status=Receipt');
    expect(mineCall?.[0]).not.toContain('status=Report');
  });
});
