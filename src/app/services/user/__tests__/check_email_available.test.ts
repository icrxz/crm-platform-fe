jest.mock('../search', () => ({
  fetchUsers: jest.fn(),
}));

import { fetchUsers } from '../search';
import { isEmailTaken } from '../check_email_available';

const mockFetchUsers = fetchUsers as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('isEmailTaken', () => {
  it('should query users filtered by the given email', async () => {
    mockFetchUsers.mockResolvedValue({
      success: true,
      message: '',
      data: { result: [], paging: { total: 0, limit: 10, offset: 0 } },
    });

    await isEmailTaken('user@example.com', 'user-1');

    expect(mockFetchUsers).toHaveBeenCalledWith(
      'email=user%40example.com',
      1,
      10
    );
  });

  it('should return true when another user already has that email', async () => {
    mockFetchUsers.mockResolvedValue({
      success: true,
      message: '',
      data: {
        result: [{ user_id: 'other-user' }],
        paging: { total: 1, limit: 10, offset: 0 },
      },
    });

    const result = await isEmailTaken('user@example.com', 'user-1');

    expect(result).toBe(true);
  });

  it('should return false when the email belongs to the current user', async () => {
    mockFetchUsers.mockResolvedValue({
      success: true,
      message: '',
      data: {
        result: [{ user_id: 'user-1' }],
        paging: { total: 1, limit: 10, offset: 0 },
      },
    });

    const result = await isEmailTaken('user@example.com', 'user-1');

    expect(result).toBe(false);
  });

  it('should return false when the lookup fails', async () => {
    mockFetchUsers.mockResolvedValue({
      success: false,
      message: 'error',
    });

    const result = await isEmailTaken('user@example.com', 'user-1');

    expect(result).toBe(false);
  });
});
