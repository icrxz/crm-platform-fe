"use server";

import { CreateContractor, CreateContractorResponse } from "@/app/types/contractor";
import { ServiceResponse } from "@/app/types/service";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function createContractor(_currentState: unknown, formData: FormData): Promise<ServiceResponse<CreateContractorResponse>> {
  console.log(formData);
  const session = await getServerSession();
  console.log("session", session);

  const payload: CreateContractor = {
    company_name: formData.get("company_name")?.toString() || '',
    legal_name: formData.get("legal_name")?.toString() || '',
    business_contact: {
      email: formData.get("email")?.toString() || '',
      phone_number: formData.get("phone")?.toString() || '',
    },
    document: formData.get("document")?.toString() || '',
    created_by: session?.user?.name || '',
  };

  try {
    const url = `${crmCoreEndpoint}/crm/core/api/v1/contractors`;
    const jwt = cookies().get("jwt");

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt?.value}`
      }
    });

    if (!response.ok) {
      const unauthorized = response.status === 401;
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na criação da seguradora";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const resData = await response.json() as CreateContractorResponse;
    return {
      success: true,
      message: "seguradora criada com sucesso",
      data: resData
    };
  } catch (ex) {
    console.error(ex);

    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    };
  }
}
