import UsersTable from '../../components/users/table';
import { UserRole } from '../../types/user';
import { UserListItem } from '../../types/user-list-item';
import { Shell } from '../shell';

const users: UserListItem[] = Array.from({ length: 10 }, (_, i) => ({
  user_id: `user-${i}`,
  username: 'joao.silva',
  first_name: 'João',
  last_name: 'Silva',
  email: 'joao.silva@example.com',
  role: UserRole.OPERATOR,
  active: true,
}));

export default function Page() {
  return (
    <Shell>
      <UsersTable
        users={{ result: users, paging: { total: 42, limit: 10, offset: 0 } }}
        initialPage={1}
      />
    </Shell>
  );
}
