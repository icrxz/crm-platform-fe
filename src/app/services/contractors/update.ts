"use server";
import { removeDocumentSymbols } from "@/app/libs/parser";
import { getCurrentUser } from "@/app/libs/session";
import { CreateContractorResponse, EditContractor } from "@/app/types/contractor";
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

    const session = await getCurrentUser();
    const author = session?.username || '';

    const jwt = cookies().get("jwt");

    const formDocument = formData.get("document")?.toString() || '';
    const document = removeDocumentSymbols(formDocument);

    const payload: EditContractor = {
      company_name: formData.get("company_name")?.toString(),
      legal_name: formData.get("legal_name")?.toString(),
      business_contact: {
        email: formData.get("email")?.toString() || '',
        phone_number: formData.get("phone")?.toString() || '',
      },
      document: document,
      updated_by: author,
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
