import { render, screen, fireEvent } from '@testing-library/react';
import { Accordion } from './index';

describe('Accordion', () => {
  it('hides the content by default', () => {
    render(
      <Accordion summary="Resumo">
        <p>Conteúdo</p>
      </Accordion>
    );

    expect(screen.getByText('Resumo')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo')).not.toBeInTheDocument();
  });

  it('renders open when defaultOpen is true', () => {
    render(
      <Accordion summary="Resumo" defaultOpen>
        <p>Conteúdo</p>
      </Accordion>
    );

    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });

  it('toggles the content on click', () => {
    render(
      <Accordion summary="Resumo">
        <p>Conteúdo</p>
      </Accordion>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('Conteúdo')).not.toBeInTheDocument();
  });

  it('reflects the open state in aria-expanded', () => {
    render(
      <Accordion summary="Resumo">
        <p>Conteúdo</p>
      </Accordion>
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
