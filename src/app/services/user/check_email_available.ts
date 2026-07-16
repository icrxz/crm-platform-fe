'use server';
import { fetchUsers } from './search';

export async function isEmailTaken(
  email: string,
  currentUserID: string
): Promise<boolean> {
  const result = await fetchUsers(`email=${encodeURIComponent(email)}`, 1, 10);

  if (!result.success || !result.data) {
    return false;
  }

  return result.data.result.some((user) => user.user_id !== currentUserID);
}
