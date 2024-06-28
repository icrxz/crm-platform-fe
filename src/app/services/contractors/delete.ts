"use server";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function deleteContractor(_currentState: unknown, formData: FormData) {
  try {
    const contractorID = formData.get('contractor_id')?.toString() || '';
    if (!contractorID) {
      return {
        success: false,
        message: "ID da seguradora não informado",
      };
    }

    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/contractors/${contractorID}`;

    const resp = await fetch(url, {
      method: "DELETE",
      headers: {
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`
      }
    });

    if (!resp.ok) {
      const unauthorized = resp.status === 401;
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na desativação da seguradora";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    return {
      success: true,
      message: "seguradora desativada com sucesso",
      unauthorized: false,
    };
  } catch (ex) {
    console.error(ex);

    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    };
  }
}

