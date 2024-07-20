"use server";
import { getCurrentUser } from "@/app/libs/session";
import { CreateAttachment } from "@/app/types/attachments";
import { CaseStatus } from "@/app/types/case";
import { ChangeStatus } from "@/app/types/change_status";
import { ServiceResponse } from "@/app/types/service";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function changeStatus(
  caseID: string,
  newStatus: CaseStatus,
  formData?: FormData,
  attachments?: CreateAttachment[],
): Promise<ServiceResponse<any>> {
  try {
    if (!caseID) {
      return {
        success: false,
        message: "ID do caso não fornecido!",
      };
    }

    const url = `${crmCoreEndpoint}/crm/core/api/v1/cases/${caseID}/status`;
    const jwt = cookies().get("jwt")?.value;

    const session = await getCurrentUser();
    const author = session?.user_id || '';

    const payload: ChangeStatus = {
      status: newStatus,
      content: formData?.get("content")?.toString(),
      updated_by: author,
      attachments: attachments,
    };

    const response = await fetch(url, {
      method: 'PATCH',
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
