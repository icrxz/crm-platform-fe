import { Contractor } from "../types/contractor";

export async function fetchContractors(query: string): Promise<Contractor[]> {
  return [
    {
      contractor_id: "1",
      legal_name: "Luizaseg",
      document: "123.456.789-00",
      cases: [
        "123",
        "456",
        "789"
      ],
      created_at: "27/04/2024",
      company_name: "",
      created_by: "",
      updated_at: "",
      updated_by: "",
    } as Contractor
  ];
}