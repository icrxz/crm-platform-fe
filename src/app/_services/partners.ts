import { Partner } from "../_types/partner";

export async function fetchPartners(query: string): Promise<Partner[]> {
  return [
    {
      id: "1",
      created_date: "27/04/2024",
    } as Partner
  ];
}