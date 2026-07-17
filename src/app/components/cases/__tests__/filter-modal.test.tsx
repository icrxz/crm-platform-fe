import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FilterModal } from '../filter-modal';
import { fetchContractors } from '../../../services/contractors';
import { buildContractor, buildSearchResponse } from '../__fixtures__/builders';
import { CaseStatus } from '../../../types/case';

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
    it('should render the Estado and Seguradora selects', () => {
      // Arrange & Act
      render(
        <FilterModal
          isModalOpen
          onClose={jest.fn()}
          onApply={jest.fn()}
          initialStatus={[]}
          initialContractorId={[]}
        />
      );

      // Assert
      expect(screen.getByText('Estado')).toBeInTheDocument();
      expect(screen.getByText('Seguradora')).toBeInTheDocument();
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
        />
      );

      // Act
      fireEvent.click(screen.getByText('Buscar'));

      // Assert
      expect(onApply).toHaveBeenCalledWith({
        status: [CaseStatus.NEW, CaseStatus.ONGOING],
        contractorId: ['contractor-1'],
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
        />
      );

      // Act
      fireEvent.click(screen.getByText('Buscar'));

      // Assert
      expect(onApply).toHaveBeenCalledWith({ status: [], contractorId: [] });
    });
  });
});
