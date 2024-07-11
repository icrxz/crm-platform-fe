import { CreateAttachment } from "./attachments";
import { CaseStatus } from "./case";

export type ChangeStatus = {
  status: CaseStatus;
  content?: string;
  attachments?: CreateAttachment[];
  updated_by: string;
};
