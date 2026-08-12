import { CaseStatus } from '../../types/case';
import {
  defaultCaseStatuses,
  finalCaseStatuses,
  getDefaultCaseStatuses,
} from '../case_status';

describe('case_status utils', () => {
  describe('finalCaseStatuses', () => {
    it('should contain only the terminal statuses', () => {
      // Assert
      expect(finalCaseStatuses).toEqual([
        CaseStatus.CLOSED,
        CaseStatus.CANCELED,
      ]);
    });
  });

  describe('defaultCaseStatuses', () => {
    it('should exclude the final statuses', () => {
      // Assert
      expect(defaultCaseStatuses).not.toContain(CaseStatus.CLOSED);
      expect(defaultCaseStatuses).not.toContain(CaseStatus.CANCELED);
    });

    it('should include every non-final status', () => {
      // Arrange
      const nonFinalStatuses = Object.values(CaseStatus).filter(
        (status) =>
          status !== CaseStatus.CLOSED && status !== CaseStatus.CANCELED
      );

      // Assert
      expect(defaultCaseStatuses.sort()).toEqual(nonFinalStatuses.sort());
    });
  });

  describe('getDefaultCaseStatuses', () => {
    it('should include every status, including the final ones, for admins', () => {
      // Assert
      expect(getDefaultCaseStatuses(true).sort()).toEqual(
        Object.values(CaseStatus).sort()
      );
    });

    it('should exclude the final statuses for non-admins', () => {
      // Assert
      expect(getDefaultCaseStatuses(false)).toEqual(defaultCaseStatuses);
    });
  });
});
