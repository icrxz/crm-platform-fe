"use server";
import { Partner } from "@/app/types/partner";
import { ServiceResponse } from "@/app/types/service";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";
import { SearchResponse } from "@/app/types/search_response";

export async function fetchPartners(query: string, page: number, limit: number = 10): Promise<ServiceResponse<SearchResponse<Partner>>> {
  try {
    page = page - 1;
    const jwt = cookies().get("jwt")?.value;
    let url = `${crmCoreEndpoint}/crm/core/api/v1/partners?offset=${page * (limit)}&limit=${limit}`;

    if (query) {
      url = `${url}&${query}`;
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
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na busca dos técnicos";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const respData = await resp.json() as SearchResponse<Partner>;

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
