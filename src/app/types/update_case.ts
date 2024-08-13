import { CaseStatus } from "./case";

export type UpdateCase = {
  due_date?: string;
  target_date?: string;
  updated_by: string;
};
