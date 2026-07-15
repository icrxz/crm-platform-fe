import { render, screen, fireEvent } from '@testing-library/react';
import { Dropdown } from './dropdown';

const options = [
  { id: 'SP', value: 'SP', label: 'SP' },
  { id: 'RJ', value: 'RJ', label: 'RJ' },
];

describe('Dropdown', () => {
  it('renders the label associated with the select via htmlFor/id', () => {
    render(<Dropdown name="state" label="Estado" options={options} />);

    const select = screen.getByLabelText('Estado');
    expect(select).toHaveAttribute('id', 'state');
    expect(select).toHaveAttribute('name', 'state');
  });

  it('wraps the select in a relative-positioned div, matching the app pattern', () => {
    render(<Dropdown name="state" label="Estado" options={options} />);

    const select = screen.getByLabelText('Estado');
    expect(select.parentElement).toHaveClass('relative');
  });

  it('renders one option per entry plus an optional placeholder', () => {
    render(
      <Dropdown
        name="state"
        label="Estado"
        options={options}
        placeholder="Selecione"
      />
    );

    expect(screen.getByText('Selecione')).toBeInTheDocument();
    expect(screen.getByText('SP')).toBeInTheDocument();
    expect(screen.getByText('RJ')).toBeInTheDocument();
  });

  it('supports uncontrolled usage via defaultValue', () => {
    render(
      <Dropdown
        name="state"
        label="Estado"
        options={options}
        defaultValue="RJ"
      />
    );

    const select = screen.getByLabelText('Estado') as HTMLSelectElement;
    expect(select.value).toBe('RJ');
  });

  it('supports controlled usage via value/onChange', () => {
    const handleChange = jest.fn();
    render(
      <Dropdown
        name="state"
        label="Estado"
        options={options}
        value="SP"
        onChange={handleChange}
      />
    );

    const select = screen.getByLabelText('Estado') as HTMLSelectElement;
    expect(select.value).toBe('SP');

    fireEvent.change(select, { target: { value: 'RJ' } });
    expect(handleChange).toHaveBeenCalledWith('RJ');
  });

  it('applies the disabled style and attribute', () => {
    render(<Dropdown name="state" label="Estado" options={options} disabled />);

    const select = screen.getByLabelText('Estado');
    expect(select).toBeDisabled();
    expect(select).toHaveClass('disabled:bg-gray-100');
    expect(select).toHaveClass('disabled:cursor-not-allowed');
  });

  it('renders an ErrorMessage and red border when error is set', () => {
    render(
      <Dropdown
        name="state"
        label="Estado"
        options={options}
        error="Campo obrigatório"
      />
    );

    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    const select = screen.getByLabelText('Estado');
    expect(select).toHaveClass('border-red-500');
    expect(select).not.toHaveClass('border-gray-200');
  });

  it('does not render an error message when error is not set', () => {
    render(<Dropdown name="state" label="Estado" options={options} />);

    const select = screen.getByLabelText('Estado');
    expect(select).toHaveClass('border-gray-200');
  });

  it('marks the select required when required is true', () => {
    render(<Dropdown name="state" label="Estado" options={options} required />);

    expect(screen.getByLabelText('Estado')).toBeRequired();
  });
});
