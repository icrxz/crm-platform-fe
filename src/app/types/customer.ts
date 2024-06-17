import { Address } from "./address";
import { Contact } from "./contact";

export type CreateCustomer = {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  legal_name?: string;
  document: string;
  document_type: string;
  shipping: Address;
  personal_contact?: Contact;
  created_by: string;
}

export type CreateCustomerResponse = {
  customer_id: string;
}

export type EditCustomer = {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  legal_name?: string;
  document: string;
  document_type: string;
  shipping: Address;
  personal_contact?: Contact;
  updated_by: string;
}

export type Customer = {
  customer_id: string;
  first_name: string;
  last_name: string;
  company_name: string;
  legal_name: string;
  document: string;
  document_type: string;
  shipping: Address;
  billing: Address;
  personal_contact?: Contact;
  business_contact?: Contact;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  cases: string[];
  active: boolean;
}