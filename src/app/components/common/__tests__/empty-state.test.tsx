import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../empty-state';

describe('EmptyState', () => {
  it('renders the default message when none is given', () => {
    render(<EmptyState />);

    expect(
      screen.getByText('Nenhum resultado encontrado.')
    ).toBeInTheDocument();
  });

  it('renders a custom message when given', () => {
    render(<EmptyState message="Nenhum caso encontrado." />);

    expect(screen.getByText('Nenhum caso encontrado.')).toBeInTheDocument();
  });

  it('does not render a refresh button when onRefresh is not given', () => {
    render(<EmptyState />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders a refresh button that calls onRefresh when clicked', () => {
    const onRefresh = jest.fn();
    render(<EmptyState onRefresh={onRefresh} />);

    fireEvent.click(screen.getByRole('button', { name: /atualizar/i }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('renders a custom refresh label', () => {
    render(<EmptyState onRefresh={jest.fn()} refreshLabel="Tentar de novo" />);

    expect(
      screen.getByRole('button', { name: /tentar de novo/i })
    ).toBeInTheDocument();
  });
});
