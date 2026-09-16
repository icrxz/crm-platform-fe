import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FilterModal } from '../filter-modal';
import { fetchContractors } from '../../../services/contractors';
import { buildContractor, buildSearchResponse } from '../__fixtures__/builders';
import {
  CaseCategory,
  caseCategoryMap,
  CaseStatus,
  caseStatusMap,
} from '../../../types/case';
import { UserRole } from '../../../types/user';
import { onlyAdminStatuses } from '../../../utils/case_status';

jest.mock('../../../services/contractors', () => ({
  fetchContractors: jest.fn(),
}));

jest.mock('@heroui/react', () => ({
  Select: ({
    label,
    selectedKeys,
    onSelectionChange,
    children,
  }: {
    label: string;
    selectedKeys: Set<string>;
    onSelectionChange: (keys: Set<string>) => void;
    children: React.ReactNode;
  }) => (
    <div>
      <span>{label}</span>
      <select
        aria-label={label}
        multiple
        value={Array.from(selectedKeys)}
        onChange={(e) =>
          onSelectionChange(
            new Set(Array.from(e.target.selectedOptions, (o) => o.value))
          )
        }
      >
        {children}
      </select>
    </div>
  ),
  SelectItem: ({ children }: { children: React.ReactNode }) => (
    <option>{children}</option>
  ),
}));

const mockFetchContractors = fetchContractors as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchContractors.mockResolvedValue({
    success: true,
    data: buildSearchResponse([buildContractor()]),
  });
});

describe('FilterModal', () => {
  describe('rendering', () => {
    it('should render the Status, Seguradora and Categoria selects', () => {
      // Arrange & Act
      render(
        <FilterModal
          isModalOpen
          onClose={jest.fn()}
          onApply={jest.fn()}
          initialStatus={[]}
          initialContractorId={[]}
          initialCategory={[]}
        />
      );

      // Assert
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Seguradora')).toBeInTheDocument();
      expect(screen.getByText('Categoria')).toBeInTheDocument();
    });

    it('should fetch active contractors on mount', async () => {
      // Arrange & Act
      render(
        <FilterModal
          isModalOpen
          onClose={jest.fn()}
          onApply={jest.fn()}
          initialStatus={[]}
          initialContractorId={[]}
          initialCategory={[]}
        />
      );

      // Assert
      await waitFor(() =>
        expect(mockFetchContractors).toHaveBeenCalledWith(
          'active=true',
          1,
          1000
        )
      );
    });

    it('should not render when isModalOpen is false', () => {
      // Arrange & Act
      render(
        <FilterModal
          isModalOpen={false}
          onClose={jest.fn()}
          onApply={jest.fn()}
          initialStatus={[]}
          initialContractorId={[]}
          initialCategory={[]}
        />
      );

      // Assert
      expect(screen.queryByText('Filtros')).not.toBeInTheDocument();
    });
  });

  describe('submitting', () => {
    it('should call onApply with the initially selected status and contractor', () => {
      // Arrange
      const onApply = jest.fn();
      render(
        <FilterModal
          isModalOpen
          onClose={jest.fn()}
          onApply={onApply}
          initialStatus={[CaseStatus.NEW, CaseStatus.ONGOING]}
          initialContractorId={['contractor-1']}
          initialCategory={['d+']}
        />
      );

      // Act
      fireEvent.click(screen.getByText('Buscar'));

      // Assert
      expect(onApply).toHaveBeenCalledWith({
        status: [CaseStatus.NEW, CaseStatus.ONGOING],
        contractorId: ['contractor-1'],
        category: ['d+'],
      });
    });

    it('should call onApply with an empty selection when nothing is chosen', () => {
      // Arrange
      const onApply = jest.fn();
      render(
        <FilterModal
          isModalOpen
          onClose={jest.fn()}
          onApply={onApply}
          initialStatus={[]}
          initialContractorId={[]}
          initialCategory={[]}
        />
      );

      // Act
      fireEvent.click(screen.getByText('Buscar'));

      // Assert
      expect(onApply).toHaveBeenCalledWith({
        status: [],
        contractorId: [],
        category: [],
      });
    });
  });

  describe('category options', () => {
    it('should render every case category', () => {
      render(
        <FilterModal
          isModalOpen
          onClose={jest.fn()}
          onApply={jest.fn()}
          initialStatus={[]}
          initialContractorId={[]}
          initialCategory={[]}
        />
      );

      Object.values(CaseCategory).forEach((category) => {
        expect(screen.getByText(caseCategoryMap[category])).toBeInTheDocument();
      });
    });

    it('should call onApply with all categories selected by default', () => {
      const onApply = jest.fn();
      render(
        <FilterModal
          isModalOpen
          onClose={jest.fn()}
          onApply={onApply}
          initialStatus={[]}
          initialContractorId={[]}
          initialCategory={Object.values(CaseCategory)}
        />
      );

      fireEvent.click(screen.getByText('Buscar'));

      expect(onApply).toHaveBeenCalledWith(
        expect.objectContaining({ category: Object.values(CaseCategory) })
      );
    });
  });

  describe('status options by role', () => {
    it('should hide admin-only statuses for operators', () => {
      render(
        <FilterModal
          isModalOpen
          onClose={jest.fn()}
          onApply={jest.fn()}
          initialStatus={[]}
          initialContractorId={[]}
          initialCategory={[]}
          userRole={UserRole.OPERATOR}
        />
      );

      onlyAdminStatuses.forEach((status) => {
        expect(
          screen.queryByText(caseStatusMap[status])
        ).not.toBeInTheDocument();
      });
    });

    it('should show admin-only statuses for admins', () => {
      render(
        <FilterModal
          isModalOpen
          onClose={jest.fn()}
          onApply={jest.fn()}
          initialStatus={[]}
          initialContractorId={[]}
          initialCategory={[]}
          userRole={UserRole.ADMIN}
        />
      );

      onlyAdminStatuses.forEach((status) => {
        expect(screen.getByText(caseStatusMap[status])).toBeInTheDocument();
      });
    });

    it('should hide admin-only statuses when no role is provided', () => {
      render(
        <FilterModal
          isModalOpen
          onClose={jest.fn()}
          onApply={jest.fn()}
          initialStatus={[]}
          initialContractorId={[]}
          initialCategory={[]}
        />
      );

      onlyAdminStatuses.forEach((status) => {
        expect(
          screen.queryByText(caseStatusMap[status])
        ).not.toBeInTheDocument();
      });
    });
  });
});
