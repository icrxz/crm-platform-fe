import { CaseStatus } from "./case";

export type ChangePartner = {
  status: CaseStatus;
  target_date: string;
  partner_id: string;
  updated_by: string;
};
