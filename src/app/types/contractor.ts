import { Case } from './case';

export type Contractor = {
  contractor_id: string;
  company_name: string;
  legal_name: string;
  document: string;
  cases: string[];
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
}