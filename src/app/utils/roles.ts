import { UserRole } from '../types/user';

export const adminRoles = [
  UserRole.ADMIN,
  UserRole.THAVANNA_ADMIN,
  UserRole.ADMIN_OPERATOR,
];

export const roleLabels: Record<UserRole, string> = {
  [UserRole.OPERATOR]: 'Operador',
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.THAVANNA_ADMIN]: 'Thavanna Admin',
  [UserRole.ADMIN_OPERATOR]: 'Administrador',
};
