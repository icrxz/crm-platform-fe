"use server";
import { CreateContractorResponse, EditContractor } from "@/app/types/contractor";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function updateContractor(_currentState: unknown, formData: FormData) {
  try {
    const contractorID = formData.get('contractor_id')?.toString() || '';
    if (!contractorID) {
      return {
        success: false,
        message: "ID da seguradora não informado",
      };
    }

    const session = await getServerSession();
    const jwt = cookies().get("jwt");

    const payload: EditContractor = {
      company_name: formData.get("company_name")?.toString() || '',
      legal_name: formData.get("legal_name")?.toString() || '',
      business_contact: {
        email: formData.get("email")?.toString() || '',
        phone_number: formData.get("phone")?.toString() || '',
      },
      document: formData.get("document")?.toString() || '',
      updated_by: session?.user?.name || '',
    };

    const url = `${crmCoreEndpoint}/crm/core/api/v1/contractors/${contractorID}`;

    const response = await fetch(url, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt?.value}`
      }
    });

    if (!response.ok) {
      const unauthorized = response.status === 401;
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na edição da seguradora";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const resData = await response.json() as CreateContractorResponse;
    return {
      success: true,
      message: "seguradora editada com sucesso",
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
