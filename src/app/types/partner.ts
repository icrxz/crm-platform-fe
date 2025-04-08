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
  payment_key: string;
  payment_key_option: string;
  payment_type: string;
  payment_owner: string;
  payment_is_from_same_owner: boolean;
};

export type EditPartner = {
  first_name?: string;
  last_name?: string;
  document: string;
  document_type: string;
  partner_type: string;
  shipping: Address;
  personal_contact?: Contact;
  payment_key?: string;
  payment_key_option?: string;
  payment_type?: string;
  payment_owner?: string;
  payment_is_from_same_owner?: boolean;
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
  description: string;
  payment_key?: string;
  payment_key_option?: PaymentOptions;
  payment_type?: string;
  payment_owner?: string;
  payment_is_from_same_owner?: boolean;
};

export enum PaymentOptions {
  CPF = 'cpf',
  CNPJ = 'cnpj',
  EMAIL = 'email',
  PHONE = 'phone',
  RANDOM = 'random',
  OTHER = 'other',
}

export const paymentOptionMap: Record<PaymentOptions, string> = {
  cpf: 'CPF',
  cnpj: 'CNPJ',
  email: 'Email',
  phone: 'Telefone',
  random: 'Aleatório',
  other: 'Outro',
}
