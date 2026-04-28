import { render, screen } from '@testing-library/react';
import KpiCards from '../kpi-cards';

describe('KpiCards', () => {
  describe('rendering', () => {
    it('should render all four KPI card titles', () => {
      render(<KpiCards />);
      expect(screen.getByText('Casos Finalizados')).toBeInTheDocument();
      expect(screen.getByText('SLA no Prazo')).toBeInTheDocument();
      expect(screen.getByText('Satisfação do Cliente')).toBeInTheDocument();
      expect(screen.getByText('Pontos do Time')).toBeInTheDocument();
    });

    it('should render the closed cases count', () => {
      render(<KpiCards />);
      expect(screen.getByText('102')).toBeInTheDocument();
    });

    it('should render the SLA percentage', () => {
      render(<KpiCards />);
      expect(screen.getByText('96%')).toBeInTheDocument();
    });

    it('should render the team points value', () => {
      render(<KpiCards />);
      expect(screen.getByText('3.650')).toBeInTheDocument();
    });

    it('should render the positive trend indicator for closed cases', () => {
      render(<KpiCards />);
      expect(screen.getByText('+ 12% vs semana passada')).toBeInTheDocument();
    });

    it('should render the client satisfaction score', () => {
      render(<KpiCards />);
      expect(screen.getByText('4.0 / 5.0')).toBeInTheDocument();
    });
  });
});
