import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../../libs/session';
import { getUserByID } from '../../../services/user';
import { UserRole } from '../../../types/user';
import Page from '../page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

jest.mock('../../../libs/session', () => ({ getCurrentUser: jest.fn() }));
jest.mock('../../../services/user', () => ({ getUserByID: jest.fn() }));

jest.mock('../../../components/users/profile-form', () => ({
  ProfileForm: ({ user }: { user: { username: string } }) => (
    <div data-testid="profile-form">{user.username}</div>
  ),
}));

const mockRedirect = redirect as unknown as jest.Mock;
const mockGetCurrentUser = getCurrentUser as unknown as jest.Mock;
const mockGetUserByID = getUserByID as unknown as jest.Mock;

const mockUser = {
  user_id: 'user-1',
  username: 'joao.silva',
  first_name: 'João',
  last_name: 'Silva',
  email: 'joao@example.com',
  role: UserRole.OPERATOR,
  region: 1,
  created_at: '',
  updated_at: '',
  created_by: '',
  updated_by: '',
  active: true,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Profile Page', () => {
  it('should redirect to /login when there is no session', async () => {
    mockGetCurrentUser.mockResolvedValue(undefined);

    await expect(Page()).rejects.toThrow('NEXT_REDIRECT:/login');
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('should redirect to /login when the user cannot be fetched', async () => {
    mockGetCurrentUser.mockResolvedValue({ user_id: 'user-1' });
    mockGetUserByID.mockResolvedValue({ success: false, message: 'error' });

    await expect(Page()).rejects.toThrow('NEXT_REDIRECT:/login');
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('should render the profile form with the fetched user', async () => {
    mockGetCurrentUser.mockResolvedValue({ user_id: 'user-1' });
    mockGetUserByID.mockResolvedValue({ success: true, data: mockUser });

    const jsx = await Page();
    render(jsx);

    expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
    expect(screen.getByTestId('profile-form')).toHaveTextContent('joao.silva');
  });
});
