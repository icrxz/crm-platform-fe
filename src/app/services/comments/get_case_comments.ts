"use server";
import { Comment } from "@/app/types/comment";
import { ServiceResponse } from "@/app/types/service";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function getCaseComments(caseId: string): Promise<ServiceResponse<Comment[]>> {
  try {
    if (!caseId) {
      return {
        success: false,
        message: "ID do caso não fornecido!",
      };
    }

    const url = `${crmCoreEndpoint}/crm/core/api/v1/cases/${caseId}/comments`;
    const jwt = cookies().get("jwt")?.value;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`
      },
    });

    if (!response.ok) {
      const unauthorized = response.status === 401;
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha ao buscar comentários do caso";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const data = await response.json() as Comment[];

    return {
      success: true,
      message: "comentários do caso obtidos com sucesso",
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    };
  }
}
