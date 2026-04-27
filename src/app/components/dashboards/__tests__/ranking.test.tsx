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

    it('should render all four agents', () => {
      render(<Ranking />);
      expect(screen.getByText('D')).toBeInTheDocument();
      expect(screen.getByText('M')).toBeInTheDocument();
      expect(screen.getByText('J')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
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
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should render the table column headers', () => {
      render(<Ranking />);
      expect(screen.getByText('FINALIZADOS')).toBeInTheDocument();
      expect(screen.getByText('VIST. / REPARO')).toBeInTheDocument();
    });
  });
});
