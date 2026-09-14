import { render, screen } from '@testing-library/react';
import Rewards from '../rewards';

describe('Rewards', () => {
  describe('rendering', () => {
    it('should render the section title', () => {
      render(<Rewards />);
      expect(screen.getByText('Recompensas do Mês')).toBeInTheDocument();
    });

    it('should render the current ranking label', () => {
      render(<Rewards />);
      expect(screen.getByText('Ranking Atual')).toBeInTheDocument();
    });

    it('should render all three reward items', () => {
      render(<Rewards />);
      expect(screen.getByText('Destaque interno')).toBeInTheDocument();
      expect(screen.getByText('Coffee voucher')).toBeInTheDocument();
      expect(screen.getByText('Bônus coletivo')).toBeInTheDocument();
    });

    it('should render the scoring explanation link', () => {
      render(<Rewards />);
      expect(
        screen.getByText('Como funciona a pontuação?')
      ).toBeInTheDocument();
    });

    it('should render position avatars for each reward', () => {
      render(<Rewards />);
      expect(screen.getByText('D')).toBeInTheDocument();
      expect(screen.getByText('M')).toBeInTheDocument();
      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });
});
