"use server";
import { AssignOwner } from "@/app/types/assign_owner";
import { CaseStatus } from "@/app/types/case";
import { ServiceResponse } from "@/app/types/service";
import { getServerSession } from "next-auth/next";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function assignOwner(formData: FormData, caseID: string): Promise<ServiceResponse<null>> {
  try {
    console.log('assignOwner', formData, caseID);
    if (!caseID) {
      return { success: false, message: "ID do caso não informado" };
    }

    const url = `${crmCoreEndpoint}/crm/core/api/v1/cases/${caseID}/owner`;
    const session = await getServerSession();
    const jwt = cookies().get("jwt")?.value;

    const payload: AssignOwner = {
      owner_id: formData.get("owner")?.toString() || '',
      updated_by: session?.user?.name || '',
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
      const err = await response.json();
      console.log('error response', err);
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
