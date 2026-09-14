import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import Page from '../page';
import { getCurrentUser } from '../../../libs/session';
import { UserRole } from '../../../types/user';

jest.mock('../../../libs/session', () => ({ getCurrentUser: jest.fn() }));
jest.mock('next/navigation', () => ({
  redirect: jest.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

jest.mock('../../../components/dashboard/cards', () => ({
  __esModule: true,
  default: ({ user }: { user: { user_id: string; role: UserRole } }) => (
    <div data-testid="card-wrapper">{`${user.user_id}-${user.role}`}</div>
  ),
}));

const mockGetCurrentUser = getCurrentUser as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Home Page', () => {
  it('redirects to /login when there is no session', async () => {
    mockGetCurrentUser.mockResolvedValue(undefined);

    await expect(Page()).rejects.toThrow('NEXT_REDIRECT:/login');
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('renders the card wrapper with the current user', async () => {
    mockGetCurrentUser.mockResolvedValue({
      user_id: 'user-1',
      role: UserRole.ADMIN,
    });

    const jsx = await Page();
    render(jsx);

    expect(screen.getByTestId('card-wrapper')).toHaveTextContent(
      'user-1-admin'
    );
  });
});
