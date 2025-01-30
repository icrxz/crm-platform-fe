import { CaseStatus } from "./case";

export type PublishCase = {
  subject: string;
  productID: string;
  customerID: string;
  status: CaseStatus;
  updated_by: string;
};
