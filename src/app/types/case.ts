import { Contractor } from "./contractor";
import { Customer } from "./customer";
import { Partner } from "./partner";
import { Product } from "./product";
import { User } from "./user";

export type CreateCase = {
  contractor_id: string;
  customer_id: string;
  origin_channel: string;
  case_type: string;
  due_date: string;
  subject: string;
  created_by: string;
  external_reference: string;
  product_name?: string;
  brand: string;
  model: string;
  product_description?: string;
  value?: number;
  serial_number?: string;
};

export type CreateCaseResponse = {
  case_id: string;
};

export type Case = {
  case_id: string;
  owner_id?: string;
  customer_id: string;
  partner_id?: string;
  contractor_id: string;
  origin_channel: string;
  case_type: string;
  subject: string;
  priority: CasePriority;
  status: CaseStatus;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  closed_at?: string;
  due_date: string;
  region: number;
  external_reference: string;
  product_id: string;
};

export interface CaseFull extends Case {
  customer?: Customer;
  contractor?: Contractor;
  partner?: Partner;
  product?: Product;
  owner?: User;
}

export enum CaseStatus {
  NEW = "New",
  CUSTOMER_INFO = "CustomerInfo",
  WAITING_PARTNER = "WaitingPartner",
  ONGOING = "Ongoing",
  REPORT = "Report",
  PAYMENT = "Payment",
  CLOSED = "Closed",
  CANCELED = "Canceled",
}

export enum CasePriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export const caseStatusMap: Record<CaseStatus, string> = {
  New: "Novo",
  CustomerInfo: "Informações cliente",
  WaitingPartner: "Aguardando técnico",
  Ongoing: "Em andamento",
  Report: "Laudo",
  Payment: "Pagamento",
  Closed: "Encerrado",
  Canceled: "Cancelado",
};

export const casePriorityMap: Record<CasePriority, string> = {
  Low: "Baixa",
  Medium: "Média",
  High: "Alta",
};
