"use server";
import { Partner } from "@/app/types/partner";
import { ServiceResponse } from "@/app/types/service";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function getPartnerByID(partnerID: string): Promise<ServiceResponse<Partner>> {
  try {
    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/partners/${partnerID}`;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`
      }
    });

    if (!resp.ok) {
      const unauthorized = resp.status === 401;
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na busca do técnico";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const respData = await resp.json() as Partner;

    return {
      message: "",
      success: true,
      data: respData,
    };

  } catch (ex) {
    console.error(ex);

    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    };
  }
}
