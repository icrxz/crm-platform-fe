import { CaseStatus } from "./case";

export type AssignOwner = {
  owner_id: string;
  status: CaseStatus;
  updated_by: string;
};
