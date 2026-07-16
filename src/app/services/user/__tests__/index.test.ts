jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({ get: () => undefined }),
}));

jest.mock('../../../libs/session', () => ({
  getCurrentUser: jest.fn().mockResolvedValue(undefined),
}));

import * as userService from '../index';

describe('user service barrel', () => {
  it('should export all user service functions', () => {
    expect(typeof userService.fetchUsers).toBe('function');
    expect(typeof userService.getUserByID).toBe('function');
    expect(typeof userService.updateUser).toBe('function');
    expect(typeof userService.changePassword).toBe('function');
    expect(typeof userService.isEmailTaken).toBe('function');
  });
});
