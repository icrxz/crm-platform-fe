import { render, screen } from '@testing-library/react';
import { PageSkeleton } from '../page-skeleton';

describe('PageSkeleton', () => {
  it('renders the title when provided', () => {
    render(<PageSkeleton title="Meu Perfil" />);

    expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
  });

  it('renders without a title', () => {
    const { container } = render(<PageSkeleton />);

    expect(container.querySelector('h1')).not.toBeInTheDocument();
  });
});
