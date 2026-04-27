import { render, screen } from '@testing-library/react';
import Achievements from '../achievements';

describe('Achievements', () => {
  describe('rendering', () => {
    it('should render the section title', () => {
      render(<Achievements />);
      expect(screen.getByText('Conquistas')).toBeInTheDocument();
    });

    it('should render the "Ver Todos" action link', () => {
      render(<Achievements />);
      expect(screen.getByText('Ver Todos')).toBeInTheDocument();
    });

    it('should render all four achievement labels', () => {
      render(<Achievements />);
      expect(screen.getByText('Primeiro Caso do Dia')).toBeInTheDocument();
      expect(screen.getByText('5 Casos em 1 Dia')).toBeInTheDocument();
      expect(screen.getByText('SLA Perfeito (100%)')).toBeInTheDocument();
      expect(screen.getByText('Cliente Avaliou 9★')).toBeInTheDocument();
    });

    it('should show "Conquistado" status for the first achievement', () => {
      render(<Achievements />);
      expect(screen.getByText('Conquistado')).toBeInTheDocument();
    });

    it('should show "Bloqueado" status for the remaining achievements', () => {
      render(<Achievements />);
      const blockedLabels = screen.getAllByText('Bloqueado');
      expect(blockedLabels).toHaveLength(3);
    });

    it('should render exactly one achieved and three locked badges', () => {
      render(<Achievements />);
      expect(screen.getAllByText('Bloqueado')).toHaveLength(3);
      expect(screen.getAllByText('Conquistado')).toHaveLength(1);
    });
  });
});
