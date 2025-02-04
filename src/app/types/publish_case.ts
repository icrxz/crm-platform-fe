import { CaseStatus } from "./case";

export type PublishCase = {
  subject: string;
  product_id: string;
  customer_id: string;
  status: CaseStatus;
  updated_by: string;
};
