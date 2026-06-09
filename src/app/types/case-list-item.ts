import { CaseStatus } from './case';

export type CaseListItem = {
  case_id: string;
  external_reference: string;
  status: CaseStatus;
  due_date: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_city?: string;
  contractor_company_name?: string;
  partner_first_name?: string;
};
