import { fireEvent, render, screen } from '@testing-library/react';
import AttendanceBonus from '../attendance-bonus';

const mockEmployees = [
  'João Silva',
  'Maria Oliveira',
  'Daniel Costa',
  'Ana Ferreira',
];

describe('AttendanceBonus', () => {
  describe('rendering', () => {
    it('should render the section title', () => {
      render(<AttendanceBonus employees={mockEmployees} />);
      expect(screen.getByText('Bônus Assiduidade')).toBeInTheDocument();
    });

    it('should render the bonus badge', () => {
      render(<AttendanceBonus employees={mockEmployees} />);
      expect(screen.getByText('R$ 200,00')).toBeInTheDocument();
    });

    it('should render all employee first names', () => {
      render(<AttendanceBonus employees={mockEmployees} />);
      expect(screen.getByText('João')).toBeInTheDocument();
      expect(screen.getByText('Maria')).toBeInTheDocument();
      expect(screen.getByText('Daniel')).toBeInTheDocument();
      expect(screen.getByText('Ana')).toBeInTheDocument();
    });

    it('should show all employees as active initially', () => {
      render(<AttendanceBonus employees={mockEmployees} />);
      expect(screen.getByText(`${mockEmployees.length}`)).toBeInTheDocument();
    });

    it('should render empty state with no employees', () => {
      render(<AttendanceBonus employees={[]} />);
      expect(screen.getByText('Bônus Assiduidade')).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should mark an employee as eliminated when clicked', () => {
      render(<AttendanceBonus employees={mockEmployees} />);
      fireEvent.click(screen.getByTitle('Eliminar João Silva'));
      expect(screen.getByTitle('Reativar João Silva')).toBeInTheDocument();
    });

    it('should reactivate an eliminated employee when clicked again', () => {
      render(<AttendanceBonus employees={mockEmployees} />);
      fireEvent.click(screen.getByTitle('Eliminar João Silva'));
      fireEvent.click(screen.getByTitle('Reativar João Silva'));
      expect(screen.getByTitle('Eliminar João Silva')).toBeInTheDocument();
    });

    it('should update the active count when an employee is eliminated', () => {
      render(<AttendanceBonus employees={mockEmployees} />);
      fireEvent.click(screen.getByTitle('Eliminar João Silva'));
      expect(
        screen.getByText(`${mockEmployees.length - 1}`)
      ).toBeInTheDocument();
    });
  });
});
