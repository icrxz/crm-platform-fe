import { CaseStatus } from '../types/case';

export const onlyAdminStatuses = [
  CaseStatus.CANCELED,
  CaseStatus.CLOSED,
  CaseStatus.RECEIPT,
  CaseStatus.PAYMENT,
  CaseStatus.REPORT,
];

export const showReportStatus = [
  CaseStatus.PAYMENT,
  CaseStatus.RECEIPT,
  CaseStatus.CLOSED,
];

export const finalCaseStatuses = [CaseStatus.CLOSED, CaseStatus.CANCELED];

export const defaultCaseStatuses = Object.values(CaseStatus).filter(
  (status) => !finalCaseStatuses.includes(status)
);
