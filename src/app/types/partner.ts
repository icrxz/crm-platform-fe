import { Address } from "./address";
import { Contact } from "./contact";

export type CreatePartner = {
  first_name?: string;
  last_name?: string;
  document: string;
  document_type: string;
  partner_type: string;
  shipping: Address;
  personal_contact?: Contact;
  created_by: string;
};

export type EditPartner = {
  first_name?: string;
  last_name?: string;
  document: string;
  document_type: string;
  partner_type: string;
  shipping: Address;
  personal_contact?: Contact;
  updated_by: string;
};

export type Partner = {
  partner_id: string;
  first_name: string;
  last_name: string;
  company_name: string;
  legal_name: string;
  document: string;
  document_type: string;
  partner_type: string;
  shipping: Address;
  billing: Address;
  personal_contact: Contact;
  business_contact: Contact;
  region: number;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  active: boolean;
};
