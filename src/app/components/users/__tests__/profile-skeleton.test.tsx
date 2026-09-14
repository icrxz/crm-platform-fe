import { render, screen } from '@testing-library/react';
import { ProfileSkeleton } from '../profile-skeleton';

describe('ProfileSkeleton', () => {
  it('renders the real page title', () => {
    render(<ProfileSkeleton />);

    expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
  });

  it('renders the personal info and password card shapes', () => {
    const { container } = render(<ProfileSkeleton />);

    expect(container.querySelectorAll('.rounded-xl.bg-gray-50')).toHaveLength(
      2
    );
  });
});
