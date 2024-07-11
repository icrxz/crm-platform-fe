"use server";
import { Case } from "@/app/types/case";
import { ServiceResponse } from "@/app/types/service";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function fetchCases(query: string): Promise<ServiceResponse<Case[]>> {
  try {
    const jwt = cookies().get("jwt")?.value;
    let url = `${crmCoreEndpoint}/crm/core/api/v1/cases`;
    if (query) {
      url = `${url}?${query}`;
    }

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
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na busca das seguradoras";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const respData = await resp.json() as Case[];
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
};
