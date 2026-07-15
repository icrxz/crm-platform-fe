import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './index';

describe('Button', () => {
  it('renders children when not loading', () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByText('Salvar')).toBeInTheDocument();
  });

  it('shows a spinner and hides children when isLoading is true', () => {
    render(<Button isLoading>Salvar</Button>);

    expect(screen.queryByText('Salvar')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toContainHTML('svg');
  });

  it('disables the button when isLoading is true, even without an explicit disabled prop', () => {
    render(<Button isLoading>Salvar</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('respects an explicit disabled prop when isLoading is false', () => {
    render(<Button disabled>Salvar</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is not disabled when neither isLoading nor disabled is set', () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('stays disabled when both isLoading and disabled are true', () => {
    render(
      <Button isLoading disabled>
        Salvar
      </Button>
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not fire onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Salvar
      </Button>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies the color class for the given color variant', () => {
    render(<Button color="error">Excluir</Button>);

    expect(screen.getByRole('button')).toHaveClass('bg-red-500');
  });

  it('defaults to the info color when no color is given', () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole('button')).toHaveClass('bg-blue-500');
  });
});
