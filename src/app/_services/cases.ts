import { Case } from "../_types/case";

export async function fetchCases(query: string): Promise<Case[]> {
  return [
    {
      id: "1",
      partner_id: "Jose",
      customer_id: "João",
      status: "Em Andamento",
      priority: "Alta",
      due_date: "30/04/2024"
    } as Case
  ];
}