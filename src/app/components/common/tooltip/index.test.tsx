import { render, screen, fireEvent } from '@testing-library/react';
import { Tooltip } from './index';

describe('Tooltip', () => {
  it('renders the trigger content', () => {
    render(
      <Tooltip content="Dica">
        <button>Alvo</button>
      </Tooltip>
    );

    expect(screen.getByText('Alvo')).toBeInTheDocument();
  });

  it('keeps the tooltip content in the DOM but invisible before hover', () => {
    render(
      <Tooltip content="Dica">
        <button>Alvo</button>
      </Tooltip>
    );

    expect(screen.getByText('Dica')).toBeInTheDocument();
    expect(screen.getByText('Dica')).toHaveClass('opacity-0');
  });

  it('becomes visible on mouse enter and hides again on mouse leave', () => {
    render(
      <Tooltip content="Dica">
        <button>Alvo</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText('Alvo').parentElement!);
    expect(screen.getByText('Dica')).toHaveClass('opacity-100');

    fireEvent.mouseLeave(screen.getByText('Alvo').parentElement!);
    expect(screen.getByText('Dica')).toHaveClass('opacity-0');
  });

  it('renders the tooltip content as a direct child of document.body', () => {
    const { container } = render(
      <Tooltip content="Dica">
        <button>Alvo</button>
      </Tooltip>
    );

    // The tooltip must not be a descendant of the trigger's own render tree
    // (that's exactly what let a scrollable/overflow ancestor clip it).
    expect(container).not.toContainElement(screen.getByText('Dica'));
  });
});
