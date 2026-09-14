import {
  clearStoredCaseFilters,
  getStoredCaseFilters,
  setStoredCaseFilters,
} from '../case-filters-storage';

const STORAGE_KEY = 'crm:cases:filters';

beforeEach(() => {
  window.localStorage.clear();
});

describe('case-filters-storage', () => {
  describe('getStoredCaseFilters', () => {
    it('should return an empty object when nothing is stored', () => {
      // Act
      const result = getStoredCaseFilters();

      // Assert
      expect(result).toEqual({});
    });

    it('should return the parsed filters when present', () => {
      // Arrange
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          status: ['New'],
          contractorId: ['contractor-1'],
          onlyMine: true,
        })
      );

      // Act
      const result = getStoredCaseFilters();

      // Assert
      expect(result).toEqual({
        status: ['New'],
        contractorId: ['contractor-1'],
        onlyMine: true,
      });
    });

    it('should return an empty object when the stored value is malformed JSON', () => {
      // Arrange
      window.localStorage.setItem(STORAGE_KEY, '{not-json');

      // Act
      const result = getStoredCaseFilters();

      // Assert
      expect(result).toEqual({});
    });
  });

  describe('setStoredCaseFilters', () => {
    it('should persist the filters as JSON', () => {
      // Act
      setStoredCaseFilters({
        status: ['Ongoing'],
        contractorId: [],
        onlyMine: false,
      });

      // Assert
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe(
        JSON.stringify({
          status: ['Ongoing'],
          contractorId: [],
          onlyMine: false,
        })
      );
    });

    it('should overwrite previously stored filters', () => {
      // Arrange
      setStoredCaseFilters({ status: ['New'] });

      // Act
      setStoredCaseFilters({ status: ['Closed'] });

      // Assert
      expect(getStoredCaseFilters()).toEqual({ status: ['Closed'] });
    });
  });

  describe('clearStoredCaseFilters', () => {
    it('should remove the stored filters', () => {
      // Arrange
      setStoredCaseFilters({ status: ['New'], onlyMine: true });

      // Act
      clearStoredCaseFilters();

      // Assert
      expect(getStoredCaseFilters()).toEqual({});
      expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});
