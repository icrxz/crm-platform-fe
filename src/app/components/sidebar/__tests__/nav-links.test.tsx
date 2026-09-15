import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/app/types/user';
import NavLinks from '../nav-links';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  (usePathname as jest.Mock).mockReturnValue('/home');
});

describe('NavLinks', () => {
  it('should render links available to every role', () => {
    render(<NavLinks userRole={UserRole.OPERATOR} />);

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Casos' })).toBeInTheDocument();
  });

  it('should not render a Meu Perfil item (accessed via the sidebar avatar instead)', () => {
    render(<NavLinks userRole={UserRole.ADMIN} />);

    expect(
      screen.queryByRole('link', { name: 'Meu Perfil' })
    ).not.toBeInTheDocument();
  });

  it('should hide admin-only links for an operator', () => {
    render(<NavLinks userRole={UserRole.OPERATOR} />);

    expect(
      screen.queryByRole('link', { name: 'Usuários' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Gamificação' })
    ).not.toBeInTheDocument();
  });

  it('should show admin-only links for an admin', () => {
    render(<NavLinks userRole={UserRole.ADMIN} />);

    expect(screen.getByRole('link', { name: 'Usuários' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Gamificação' })
    ).toBeInTheDocument();
  });
});
