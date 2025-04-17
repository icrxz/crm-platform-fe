export type CreateTransaction = {
  type: TransactionType;
  value: number;
  created_by: string;
  description?: string;
};

export type CreateTransactionResponse = {
  transaction_id: string;
};

export type UpdateTransaction = {
  status?: TransactionStatus;
  attachment_id?: string;
  value?: number;
  updated_by: string;
};

export type Transaction = {
  transaction_id: string;
  type: TransactionType;
  value: number;
  case_id: string;
  status: TransactionStatus;
  attachment_id: string;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  description?: string;
};

export enum TransactionType {
  INCOMING = "incoming",
  OUTGOING = "outgoing",
}

export enum TransactionStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export type TransactionItem = {
  case_id: string;
  external_reference: string;
  total: number;
  status: TransactionStatus;
  created_at: string;
  partner_name?: string;
  partner_document?: string;
  partner_account?: string;
  mo: {
    transaction_id: string;
    value: number;
  };
  transport: {
    transaction_id: string;
    value: number;
  };
  parts: {
    transaction_id: string;
    value: number;
  };
};

export type TransactionForm = {
  transaction_id: string,
  type: TransactionType,
  description: string,
  value: string,
}

export const TransactionDescMap = {
  "MO": "Mão de Obra",
  "Peças técnico": "Peças",
  "Deslocamento Técnico": "Deslocamento",
  "Cobrado seguradora": "Mão de Obra",
  "Peças": "Peças",
  "Deslocamento": "Deslocamento",
}
