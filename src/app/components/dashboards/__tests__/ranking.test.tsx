import { render, screen } from '@testing-library/react';
import Ranking from '../ranking';

describe('Ranking', () => {
  describe('rendering', () => {
    it('should render the section title', () => {
      render(<Ranking />);
      expect(screen.getByText('Ranking – Atendimento')).toBeInTheDocument();
    });

    it('should render the "Ver Todos" action link', () => {
      render(<Ranking />);
      expect(screen.getByText('Ver Todos')).toBeInTheDocument();
    });

    it('should render the bonus banner', () => {
      render(<Ranking />);
      expect(screen.getByText(/Bônus Liderança Geral/)).toBeInTheDocument();
      expect(screen.getByText(/R\$ 400,00/)).toBeInTheDocument();
    });

    it('should render all four agents by first name', () => {
      render(<Ranking />);
      expect(screen.getByText('João')).toBeInTheDocument();
      expect(screen.getByText('Maria')).toBeInTheDocument();
      expect(screen.getByText('Daniel')).toBeInTheDocument();
      expect(screen.getByText('Ana')).toBeInTheDocument();
    });

    it('should render gold medal for first place', () => {
      render(<Ranking />);
      expect(screen.getByText('🥇')).toBeInTheDocument();
    });

    it('should render silver medal for second place', () => {
      render(<Ranking />);
      expect(screen.getByText('🥈')).toBeInTheDocument();
    });

    it('should render bronze medal for third place', () => {
      render(<Ranking />);
      expect(screen.getByText('🥉')).toBeInTheDocument();
    });

    it('should render numeric position for fourth place', () => {
      render(<Ranking />);
      const matches = screen.getAllByText('4');
      expect(matches.length).toBeGreaterThan(0);
    });

    it('should render the delay traffic light labels', () => {
      render(<Ranking />);
      const labels = screen.getAllByText(/≤5d/);
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should render the most delayed case number', () => {
      render(<Ranking />);
      expect(screen.getByText(/CASO-099/)).toBeInTheDocument();
    });
  });
});
