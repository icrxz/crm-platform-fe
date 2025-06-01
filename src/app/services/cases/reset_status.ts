"use server";
import { getCurrentUser } from "@/app/libs/session";
import { ServiceResponse } from "@/app/types/service";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function resetStatus(caseID: string,): Promise<ServiceResponse<any>> {
  try {
    if (!caseID) {
      return {
        success: false,
        message: "ID do caso não fornecido!",
      };
    }

    const url = `${crmCoreEndpoint}/crm/core/api/v1/cases/${caseID}/reset`;
    const jwt = cookies().get("jwt")?.value;

    const session = await getCurrentUser();
    const author = session?.username || '';

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`,
        "X-Author": author,
      },
    });

    if (!response.ok) {
      const resp = await response.json();
      console.error(resp);
      const unauthorized = response.status === 401;
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha ao concluir caso";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    return {
      success: true,
      message: "status do caso resetado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    };
  }
}
