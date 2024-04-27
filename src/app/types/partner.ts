import { User } from "./user";

export type Customer = {
  id: string;
  owner_id: User;
  name: string;
  document: string;
  type: string;
  shipping_street: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  shipping_country: string;
  billing_street: string;
  billing_city: string;
  billing_state: string;
  billing_zip_code: string;
  billing_country: string;
  personal_email: string;
  business_email: string;
  personal_phone: string;
  business_phone: string;
  created_date: string;
  created_by: string;
  updated_date: string;
  updated_by: string;
}