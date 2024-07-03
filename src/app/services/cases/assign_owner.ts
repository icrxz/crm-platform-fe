"use server";
import { getCurrentUser } from "@/app/libs/session";
import { AssignOwner } from "@/app/types/assign_owner";
import { CaseStatus } from "@/app/types/case";
import { ServiceResponse } from "@/app/types/service";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function assignOwner(formData: FormData, caseID: string): Promise<ServiceResponse<null>> {
  try {
    if (!caseID) {
      return { success: false, message: "ID do caso não informado" };
    }

    const url = `${crmCoreEndpoint}/crm/core/api/v1/cases/${caseID}/owner`;
    const jwt = cookies().get("jwt")?.value;

    const session = await getCurrentUser();
    const author = session?.user_id || '';

    const payload: AssignOwner = {
      owner_id: formData.get("owner")?.toString() || '',
      updated_by: author,
      status: CaseStatus.CUSTOMER_INFO,
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
      const unauthorized = response.status === 401;
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na associação do usuário";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    return {
      message: "usuário associado com sucesso!",
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    };
  }
}
