export type User = {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  region: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  active: boolean;
};

export type UpdateUser = {
  first_name?: string;
  last_name?: string;
  email?: string;
  active?: boolean;
  password?: string;
  first_login_completed?: boolean;
  updated_by: string;
};

export enum UserRole {
  THAVANNA_ADMIN = "thavanna_admin",
  ADMIN = "admin",
  OPERATOR = "operator"
}
