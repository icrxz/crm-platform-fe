import { CaseStatus } from "./case";

export type ChangeStatus = {
  status: CaseStatus;
  content?: string;
  attachments?: string[];
  updated_by: string;
};
