"use server";
import { getServerSession } from "next-auth";
import { Contractor, CreateContractor } from "../_types/contractor";
import { revalidatePath } from "next/cache";

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

export async function createContractor(_currentState: unknown, formData: FormData) {
  console.log(formData);
  const session = await getServerSession();
  const hostname = 'http://localhost:3000';

  if (!session) {
    throw Error("shit, here we go again")
  }

  const payload: CreateContractor = {
    company_name: formData.get("company_name")?.toString() || '',
    legal_name: formData.get("legal_name")?.toString() || '',
    business_contact: {
      email: formData.get("email")?.toString() || '',
      phone_number: formData.get("phone")?.toString() || '',
    },
    document: formData.get("document")?.toString() || '',
  };

  try {
    const response = await fetch(new URL(`${hostname}/api/contractors`), {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": 'application/json',
      }
    })

    console.log("resposta", response)

    if (response.ok) {
      revalidatePath("/contractors");
      return {
        success: true,
        message: "contractor created successfully"
      }
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.message,
        unauthorized: response.status === 401,
      };
    }
  } catch (ex) {
    console.log(ex)
    return {
      success: false,
      message: "something went wrong",
    }
  }
}