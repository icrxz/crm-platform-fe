import { render, screen } from '@testing-library/react';
import { Pill } from './index';

describe('Pill', () => {
  it('renders the given text', () => {
    render(<Pill text="Ativo" />);

    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('defaults to neutral color and quiet scheme', () => {
    render(<Pill text="Ativo" />);

    expect(screen.getByText('Ativo')).toHaveClass(
      'bg-gray-200',
      'text-gray-700'
    );
  });

  it('applies the loud scheme for the success color', () => {
    render(<Pill text="Ativo" color="success" scheme="loud" />);

    expect(screen.getByText('Ativo')).toHaveClass('bg-green-500', 'text-white');
  });

  it('applies the quiet scheme for the success color', () => {
    render(<Pill text="Ativo" color="success" scheme="quiet" />);

    expect(screen.getByText('Ativo')).toHaveClass(
      'bg-green-100',
      'text-green-700'
    );
  });

  it('applies the loud scheme for the error color', () => {
    render(<Pill text="Inativo" color="error" scheme="loud" />);

    expect(screen.getByText('Inativo')).toHaveClass('bg-red-500', 'text-white');
  });

  it('applies the requested component size', () => {
    render(<Pill text="Ativo" size="lg" />);

    expect(screen.getByText('Ativo')).toHaveClass('px-4', 'py-1.5');
  });

  it('applies the requested text size', () => {
    render(<Pill text="Ativo" textSize="md" />);

    expect(screen.getByText('Ativo')).toHaveClass('text-base');
  });

  it('accepts an additional className', () => {
    render(<Pill text="Ativo" className="ml-2" />);

    expect(screen.getByText('Ativo')).toHaveClass('ml-2');
  });
});
