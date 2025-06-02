import { CreateAttachment } from "./attachments";
import { CaseStatus } from "./case";

export type ChangeStatus = {
  status: CaseStatus;
  content?: string;
  attachments?: CreateAttachment[];
  type?: string;
  updated_by: string;
};
