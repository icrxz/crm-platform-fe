import { render, screen, fireEvent } from '@testing-library/react';
import { TextInput } from './text-input';

describe('TextInput', () => {
  it('renders the label associated with the input via htmlFor/id', () => {
    render(<TextInput name="first_name" label="Nome" />);

    const input = screen.getByLabelText('Nome');
    expect(input).toHaveAttribute('id', 'first_name');
    expect(input).toHaveAttribute('name', 'first_name');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('wraps the input in a relative-positioned div, matching the app pattern', () => {
    render(<TextInput name="first_name" label="Nome" />);

    const input = screen.getByLabelText('Nome');
    expect(input.parentElement).toHaveClass('relative');
  });

  it('supports uncontrolled usage via defaultValue', () => {
    render(<TextInput name="first_name" label="Nome" defaultValue="Ana" />);

    const input = screen.getByLabelText('Nome') as HTMLInputElement;
    expect(input.value).toBe('Ana');
  });

  it('supports controlled usage via value/onChange', () => {
    const handleChange = jest.fn();
    render(
      <TextInput
        name="first_name"
        label="Nome"
        value="Ana"
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText('Nome') as HTMLInputElement;
    expect(input.value).toBe('Ana');

    fireEvent.change(input, { target: { value: 'Beatriz' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies the disabled style and attribute', () => {
    render(<TextInput name="first_name" label="Nome" disabled />);

    const input = screen.getByLabelText('Nome');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:bg-gray-100');
    expect(input).toHaveClass('disabled:cursor-not-allowed');
  });

  it('renders an ErrorMessage and red border when error is set', () => {
    render(
      <TextInput name="first_name" label="Nome" error="Campo obrigatório" />
    );

    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    const input = screen.getByLabelText('Nome');
    expect(input).toHaveClass('border-red-500');
    expect(input).not.toHaveClass('border-gray-200');
  });

  it('does not render an error message when error is not set', () => {
    render(<TextInput name="first_name" label="Nome" />);

    const input = screen.getByLabelText('Nome');
    expect(input).toHaveClass('border-gray-200');
  });

  it('marks the input required when required is true', () => {
    render(<TextInput name="first_name" label="Nome" required />);

    expect(screen.getByLabelText('Nome')).toBeRequired();
  });
});
