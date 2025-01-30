import { CaseStatus } from "./case";
import { Product } from "./product";

export type UpdateCase = {
  due_date?: string;
  target_date?: string;
  updated_by: string;
  subject?: string;
  product?: Product;
};
