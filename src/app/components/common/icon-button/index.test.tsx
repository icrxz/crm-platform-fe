import { render, screen, fireEvent } from '@testing-library/react';
import { IconButton } from './index';

describe('IconButton', () => {
  it('renders the icon passed in', () => {
    render(
      <IconButton
        icon={<svg data-testid="my-icon" />}
        color="info"
        onClick={jest.fn()}
      />
    );

    expect(screen.getByTestId('my-icon')).toBeInTheDocument();
  });

  it('fires onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<IconButton icon={<svg />} color="info" onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <IconButton icon={<svg />} color="info" onClick={handleClick} disabled />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies the success color classes', () => {
    render(<IconButton icon={<svg />} color="success" onClick={jest.fn()} />);

    expect(screen.getByRole('button')).toHaveClass('text-green-500');
  });

  it('applies the info color classes', () => {
    render(<IconButton icon={<svg />} color="info" onClick={jest.fn()} />);

    expect(screen.getByRole('button')).toHaveClass('text-blue-600');
  });

  it('applies the error color classes', () => {
    render(<IconButton icon={<svg />} color="error" onClick={jest.fn()} />);

    expect(screen.getByRole('button')).toHaveClass('text-red-600');
  });

  it('applies the title attribute when given', () => {
    render(
      <IconButton
        icon={<svg />}
        color="info"
        onClick={jest.fn()}
        title="Editar"
      />
    );

    expect(screen.getByRole('button')).toHaveAttribute('title', 'Editar');
  });

  it('renders as a type="button" element', () => {
    render(<IconButton icon={<svg />} color="info" onClick={jest.fn()} />);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});
