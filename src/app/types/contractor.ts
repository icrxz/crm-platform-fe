import { Contact } from './contact';

export type CreateContractor = {
  company_name: string;
  legal_name: string;
  document: string;
  business_contact: Contact;
  created_by: string;
};

export type EditContractor = {
  company_name: string;
  legal_name: string;
  document: string;
  business_contact: Contact;
  updated_by: string;
};

export type CreateContractorResponse = {
  id: string;
};

export type Contractor = {
  contractor_id: string;
  company_name: string;
  legal_name: string;
  document: string;
  business_contact?: Contact;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  active: boolean;
};
