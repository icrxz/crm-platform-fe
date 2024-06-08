"use server";
import { cookies } from "next/headers";
import { Partner } from "../types/partner";
import { getServerSession } from "next-auth/next";

export async function fetchPartners(query: string): Promise<Partner[]> {
  return [
    {
      id: "1",
      first_name: "José",
      last_name: "Filho",
      document: "123.456.789-00",
      created_date: "27/04/2024",
    } as Partner
  ];
}

export async function createPartner(_currentState: unknown, formData: FormData) {
  console.log("form-data", formData)

  const session = await getServerSession();
  console.log("session", session)

  const jwt = cookies().get("jwt")
  console.log("jwt", jwt)

  return {
    success: true,
    message: "técnico criado com sucesso!",
    unauthorized: false,
  };
}