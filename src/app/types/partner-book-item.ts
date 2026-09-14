export type PartnerBookPaymentStatus = 'paid' | 'pending';

export type PartnerBookCaseItem = {
  case_id: string;
  created_at: string;
  type: string;
  external_reference: string;
  customer_document?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_city?: string;
  payment_total: number;
  payment_status: PartnerBookPaymentStatus;
  paid_at?: string;
};
