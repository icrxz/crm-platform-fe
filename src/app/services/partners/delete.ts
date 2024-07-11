"use server";
import { ServiceResponse } from "@/app/types/service";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function deletePartner(_currentState: unknown, formData: FormData): Promise<ServiceResponse<null>> {
  try {
    const partnerID = formData.get('partner_id')?.toString() || '';
    if (!partnerID) {
      return {
        success: false,
        message: "ID do técnico não informado",
      };
    }

    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/partners/${partnerID}`;

    const resp = await fetch(url, {
      method: "DELETE",
      headers: {
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`
      }
    });

    if (!resp.ok) {
      const unauthorized = resp.status === 401;
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na exclusão do técnico";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    return {
      message: "técnico desativado com sucesso!",
      success: true,
    };

  } catch (ex) {
    console.error(ex);

    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    };
  }
}
