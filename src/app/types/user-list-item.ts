import { UserRole } from './user';

export type UserListItem = {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  active: boolean;
};
