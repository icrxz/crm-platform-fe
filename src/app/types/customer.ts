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

export type Customer = {
  id: string;
  owner_id: string;
  first_name: string;
  last_name: string;
  company_name: string;
  legal_name: string;
  document: string;
  type: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  personal_email: string;
  personal_phone: string;
  created_date: string;
  created_by: string;
  updated_date: string;
  updated_by: string;
  cases: string[];
}