import { User } from "./user";

export type Partner = {
  id: string;
  owner_id: User;
  first_name: string;
  last_name: string;
  document: string;
  type: string;
  shipping_street: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  shipping_country: string;
  personal_email: string;
  personal_phone: string;
  created_date: string;
  created_by: string;
  updated_date: string;
  updated_by: string;
}