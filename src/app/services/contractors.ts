"use server";
import { getServerSession } from "next-auth";
import { Contractor, CreateContractor } from "../types/contractor";
import { revalidatePath } from "next/cache";
import { ok } from "assert";

const hostname = process.env.NEXT_API_URL

interface AnyResp {
  success: boolean;
  message: string;
  unauthorized?: boolean;
}

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

export async function createContractor(_currentState: unknown, formData: FormData): Promise<AnyResp> {
  console.log(formData);
  const session = await getServerSession();

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
    // const response = await fetch(new URL(`${hostname}/api/contractors`), {
    //   method: "POST",
    //   body: JSON.stringify(payload),
    //   headers: {
    //     "Content-Type": 'application/json',
    //   }
    // })
    const response = {
      ok: true,
      json: async () => {
        return {
          message: "teste",
        }
      },
      status: 400,
    }

    console.log("resposta", response)

    if (response.ok) {
      // revalidatePath("/contractors");
      return {
        success: true,
        message: "contractor created successfully"
      }
    }

    const error = await response.json();
    return {
      success: false,
      message: error.message,
      unauthorized: response.status === 401,
    };
  } catch (ex) {
    console.log(ex)
    return {
      success: false,
      message: "something went wrong",
    }
  }
}