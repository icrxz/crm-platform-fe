import { render, screen, fireEvent } from '@testing-library/react';
import PeriodFilter from '../period-filter';

describe('PeriodFilter', () => {
  describe('rendering', () => {
    it('should render all three period options', () => {
      render(<PeriodFilter />);
      expect(screen.getByText('Hoje')).toBeInTheDocument();
      expect(screen.getByText('Semana')).toBeInTheDocument();
      expect(screen.getByText('Mês')).toBeInTheDocument();
    });

    it('should render the SLA goal badge', () => {
      render(<PeriodFilter />);
      expect(screen.getByText('Meta: SLA 95%')).toBeInTheDocument();
    });

    it('should have "Semana" active by default', () => {
      render(<PeriodFilter />);
      const semanaButton = screen.getByText('Semana');
      expect(semanaButton.className).toContain('bg-sky-100');
      expect(semanaButton.className).toContain('text-blue-600');
    });

    it('should not have "Hoje" active by default', () => {
      render(<PeriodFilter />);
      const hojeButton = screen.getByText('Hoje');
      expect(hojeButton.className).not.toContain('bg-sky-100');
    });
  });

  describe('interaction', () => {
    it('should activate "Hoje" when clicked', () => {
      render(<PeriodFilter />);
      fireEvent.click(screen.getByText('Hoje'));
      expect(screen.getByText('Hoje').className).toContain('bg-sky-100');
    });

    it('should deactivate "Semana" when "Hoje" is clicked', () => {
      render(<PeriodFilter />);
      fireEvent.click(screen.getByText('Hoje'));
      expect(screen.getByText('Semana').className).not.toContain('bg-sky-100');
    });

    it('should activate "Mês" when clicked', () => {
      render(<PeriodFilter />);
      fireEvent.click(screen.getByText('Mês'));
      expect(screen.getByText('Mês').className).toContain('bg-sky-100');
    });

    it('should allow switching back to "Semana" after selecting another period', () => {
      render(<PeriodFilter />);
      fireEvent.click(screen.getByText('Hoje'));
      fireEvent.click(screen.getByText('Semana'));
      expect(screen.getByText('Semana').className).toContain('bg-sky-100');
      expect(screen.getByText('Hoje').className).not.toContain('bg-sky-100');
    });
  });
});
