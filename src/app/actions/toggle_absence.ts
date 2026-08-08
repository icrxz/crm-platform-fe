'use server';
import { updateUser } from '@/app/services/user/update';
import { ServiceResponse } from '@/app/types/service';
import { revalidatePath } from 'next/cache';

export async function toggleAbsence(
  userID: string,
  absent: boolean
): Promise<ServiceResponse<null>> {
  const result = await updateUser(userID, {
    last_absence_at: absent ? new Date().toISOString() : null,
    updated_by: '',
  });

  if (result.success) {
    revalidatePath('/dashboards');
  }

  return result;
}
