"use server";
import { getServerSession } from "next-auth";
import { Contractor, CreateContractor } from "../types/contractor";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT
const crmCoreApiKey = process.env.CRM_CORE_API_KEY

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
  console.log("session", session)

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
    const url = `${crmCoreEndpoint}/crm/core/api/v1/contractors`;
    const jwt = cookies().get("jwt");
    console.log("jwt", jwt);
  
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt?.value}`
      }
    });
  
    console.log("resposta da api", response)
  
    if (response.status !== 201) {
      if (response.status === 401) {
        return {
          success: false,
          message: "unauthorized",
          unauthorized: response.status === 401,
        };
      }
  
      return {
        success: false,
        message: "client failed"
      };
    }
  
    const resData = await response.json()
    return {
      success: true,
      message: resData,
    };
  } catch (ex) {
    console.log(ex)
    return {
      success: false,
      message: "something went wrong",
    }
  }
}