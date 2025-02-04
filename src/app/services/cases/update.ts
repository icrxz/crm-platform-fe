"use server";
import { getCurrentUser } from "@/app/libs/session";
import { ServiceResponse } from "@/app/types/service";
import { UpdateCase } from "@/app/types/update_case";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function update(
  caseID: string,
  formData: FormData,
): Promise<ServiceResponse<any>> {
  try {
    if (!caseID) {
      return {
        success: false,
        message: "ID do caso não fornecido!",
      };
    }

    const url = `${crmCoreEndpoint}/crm/core/api/v1/cases/${caseID}`;
    const jwt = cookies().get("jwt")?.value;

    const session = await getCurrentUser();
    const author = session?.username || '';

    const formTargetDate = formData.get("target_date")?.toString() || '';
    const targetDate = new Date(formTargetDate).toISOString();

    const payload: UpdateCase = {
      target_date: targetDate,
      updated_by: author,
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`
      },
      body: JSON.stringify(payload)
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
      message: "status do caso atualizado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    };
  }
}
