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

export function getDefaultCaseStatuses(isAdmin: boolean): CaseStatus[] {
  return isAdmin ? Object.values(CaseStatus) : defaultCaseStatuses;
}

// Cases only get an owner once they leave intake (Draft/New); every other
// open status implies the case has already been assigned to someone.
export const unassignedCaseStatuses = [CaseStatus.DRAFT, CaseStatus.NEW];

// Payment/Receipt are back-office steps handled from the payments screen,
// not part of the "assigned, working the case" flow.
export const assignedOpenCaseStatuses = [
  CaseStatus.CUSTOMER_INFO,
  CaseStatus.WAITING_PARTNER,
  CaseStatus.ONGOING,
  CaseStatus.REPORT,
];

export const operatorVisibleOpenCaseStatuses = defaultCaseStatuses.filter(
  (status) => !onlyAdminStatuses.includes(status)
);
