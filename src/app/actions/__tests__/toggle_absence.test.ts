jest.mock('../../services/user/update', () => ({
  updateUser: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

import { updateUser } from '../../services/user/update';
import { revalidatePath } from 'next/cache';
import { toggleAbsence } from '../toggle_absence';

const mockUpdateUser = updateUser as jest.Mock;
const mockRevalidatePath = revalidatePath as jest.Mock;

describe('toggleAbsence', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sets last_absence_at to now when marking a user absent', async () => {
    mockUpdateUser.mockResolvedValue({ success: true, message: '' });

    await toggleAbsence('user-1', true);

    expect(mockUpdateUser).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ last_absence_at: expect.any(String) })
    );
    const payload = mockUpdateUser.mock.calls[0][1];
    expect(payload.last_absence_at).not.toBeNull();
  });

  it('clears last_absence_at when reactivating a user', async () => {
    mockUpdateUser.mockResolvedValue({ success: true, message: '' });

    await toggleAbsence('user-1', false);

    expect(mockUpdateUser).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ last_absence_at: null })
    );
  });

  it('revalidates the dashboards path on success', async () => {
    mockUpdateUser.mockResolvedValue({ success: true, message: '' });

    await toggleAbsence('user-1', true);

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboards');
  });

  it('does not revalidate when the update fails', async () => {
    mockUpdateUser.mockResolvedValue({ success: false, message: 'error' });

    const result = await toggleAbsence('user-1', true);

    expect(mockRevalidatePath).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
  });
});
