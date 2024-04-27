import { Customer } from "../types/customer";

export async function fetchCustomers(query: string): Promise<Customer[]> {
  return [
    {
      id: "1",
      first_name: "José",
      last_name: "Claudio",
      document: "123.456.789-00",
      cases: [
        "123",
        "456",
        "789"
      ],
      personal_email: "jose@email.com",
      created_date: "27/04/2024",
    } as Customer
  ];
}