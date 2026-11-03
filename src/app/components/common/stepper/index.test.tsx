import { fireEvent, render, screen, within } from '@testing-library/react';
import { Stepper } from './index';

const steps = [
  { key: 'a', label: 'Primeira', done: true },
  { key: 'b', label: 'Segunda' },
  { key: 'c', label: 'Terceira' },
];

function renderStepper(currentKey = 'b') {
  const onSelect = jest.fn();
  render(
    <Stepper
      ariaLabel="Etapas"
      steps={steps}
      currentKey={currentKey}
      onSelect={onSelect}
    />
  );
  return onSelect;
}

describe('Stepper', () => {
  it('numbers the steps and tells which ones are done', () => {
    renderStepper();

    const names = within(screen.getByRole('navigation', { name: 'Etapas' }))
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label'));
    expect(names).toEqual([
      '1. Primeira (concluída)',
      '2. Segunda',
      '3. Terceira',
    ]);
  });

  it('marks the current step', () => {
    renderStepper();

    expect(screen.getByRole('button', { name: '2. Segunda' })).toHaveAttribute(
      'aria-current',
      'step'
    );
    expect(
      screen.getByRole('button', { name: '1. Primeira (concluída)' })
    ).not.toHaveAttribute('aria-current');
  });

  it('lets any step be picked, from the row or the select', () => {
    const onSelect = renderStepper();

    fireEvent.click(screen.getByRole('button', { name: '3. Terceira' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Etapas' }), {
      target: { value: 'a' },
    });

    expect(onSelect.mock.calls).toEqual([['c'], ['a']]);
  });

  it('describes position and completion in the select options', () => {
    renderStepper('a');

    const select = screen.getByRole('combobox', {
      name: 'Etapas',
    }) as HTMLSelectElement;
    expect(select.value).toBe('a');
    expect(
      Array.from(select.options).map((option) => option.textContent)
    ).toEqual([
      'Etapa 1 de 3 · Primeira ✓',
      'Etapa 2 de 3 · Segunda',
      'Etapa 3 de 3 · Terceira',
    ]);
  });
});
