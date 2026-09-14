import { render, screen } from '@testing-library/react';
import { PanelSkeleton } from '../skeleton';

describe('PanelSkeleton', () => {
  it('renders the real page title and the table column headers', () => {
    render(<PanelSkeleton />);

    expect(screen.getByText('Painel de controle')).toBeInTheDocument();
    expect(screen.getByText('Segurado')).toBeInTheDocument();
    expect(screen.getByText('Mão de obra Seguradora')).toBeInTheDocument();
    expect(screen.getByText('Serviço')).toBeInTheDocument();
  });

  it('renders eight summary cards and eight placeholder rows', () => {
    const { container } = render(<PanelSkeleton />);

    expect(container.querySelectorAll('tbody tr').length).toBe(8);
  });
});
