import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/app/types/user';
import { UserListItem } from '@/app/types/user-list-item';
import UsersTable from '../table';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@heroui/pagination', () => ({
  Pagination: ({
    onChange,
    page,
  }: {
    onChange: (value: number) => void;
    page: number;
  }) => (
    <button aria-label="next-page" onClick={() => onChange(page + 1)}>
      Pagination
    </button>
  ),
}));

const mockPush = jest.fn();

const mockUsers: UserListItem[] = [
  {
    user_id: 'user-1',
    username: 'joao.silva',
    first_name: 'João',
    last_name: 'Silva',
    email: 'joao@example.com',
    role: UserRole.OPERATOR,
    active: true,
  },
  {
    user_id: 'user-2',
    username: 'maria.souza',
    first_name: 'Maria',
    last_name: 'Souza',
    email: 'maria@example.com',
    role: UserRole.ADMIN,
    active: false,
  },
  {
    user_id: 'user-3',
    username: 'thavanna.root',
    first_name: 'Thavanna',
    last_name: 'Root',
    email: 'root@example.com',
    role: UserRole.THAVANNA_ADMIN,
    active: true,
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

describe('UsersTable', () => {
  it('should render the readable role label for each visible user', () => {
    render(
      <UsersTable
        users={{
          result: mockUsers,
          paging: { total: 3, limit: 10, offset: 0 },
        }}
      />
    );

    expect(screen.getByText('Operador')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
  });

  it('should hide thavanna_admin users from the list', () => {
    render(
      <UsersTable
        users={{
          result: mockUsers,
          paging: { total: 3, limit: 10, offset: 0 },
        }}
      />
    );

    expect(screen.queryByText('Thavanna Root')).not.toBeInTheDocument();
  });

  it('should render active/inactive status', () => {
    render(
      <UsersTable
        users={{
          result: mockUsers,
          paging: { total: 3, limit: 10, offset: 0 },
        }}
      />
    );

    expect(screen.getAllByText('Ativo').length).toBeGreaterThan(0);
    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });

  it('should navigate to the user detail page when the row action is clicked', () => {
    render(
      <UsersTable
        users={{
          result: mockUsers,
          paging: { total: 3, limit: 10, offset: 0 },
        }}
      />
    );

    const [firstActionButton] = screen.getAllByRole('button', {
      hidden: false,
    });
    fireEvent.click(firstActionButton);

    expect(mockPush).toHaveBeenCalledWith('/users/user-1');
  });

  it('should navigate with the new page when pagination changes', () => {
    render(
      <UsersTable
        users={{
          result: mockUsers,
          paging: { total: 3, limit: 10, offset: 0 },
        }}
        initialPage={1}
      />
    );

    fireEvent.click(screen.getByLabelText('next-page'));

    expect(mockPush).toHaveBeenCalledWith('?page=2');
  });

  it('should render without crashing when there are no users', () => {
    render(<UsersTable />);

    expect(screen.getByText('Usuários')).toBeInTheDocument();
  });
});
