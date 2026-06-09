import { TransactionType } from './transaction';

export type PanelTransactionItem = {
  type: TransactionType;
  description?: string;
  value: number;
};

export type PanelCaseItem = {
  case_id: string;
  created_at: string;
  type: string;
  external_reference: string;
  customer_document?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_city?: string;
  partner_first_name?: string;
  contractor_company_name?: string;
  transactions?: PanelTransactionItem[];
};

export type PanelContractorOption = {
  contractor_id: string;
  company_name: string;
};

export type PanelPartnerOption = {
  partner_id: string;
  first_name: string;
  last_name: string;
  city?: string;
  state?: string;
};
