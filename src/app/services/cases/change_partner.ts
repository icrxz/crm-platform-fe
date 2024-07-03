"use server";
import { getCurrentUser } from "@/app/libs/session";
import { CaseStatus } from "@/app/types/case";
import { ChangePartner } from "@/app/types/change_partner";
import { ServiceResponse } from "@/app/types/service";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";


export async function changePartner(caseID: string, formData: FormData): Promise<ServiceResponse<any>> {
  try {
    if (caseID == "") {
      return { success: false, message: "ID do caso não fornecido!" };
    }

    const url = `${crmCoreEndpoint}/crm/core/api/v1/cases/${caseID}/partner`;
    const jwt = cookies().get("jwt")?.value;

    const session = await getCurrentUser();
    const author = session?.user_id || '';

    const formTargetDate = formData.get("target_date")?.toString() || '';
    const targetDate = new Date(formTargetDate).toISOString();

    const payload: ChangePartner = {
      updated_by: author,
      target_date: targetDate,
      partner_id: formData.get("partner")?.toString() || '',
      status: CaseStatus.ONGOING,
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
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na associação do técnico";
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
