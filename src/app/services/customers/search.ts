"use server";
import { Customer } from "@/app/types/customer";
import { SearchResponse } from "@/app/types/search_response";
import { ServiceResponse } from "@/app/types/service";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function fetchCustomers(query: string, page: number, limit: number = 10): Promise<ServiceResponse<SearchResponse<Customer>>> {
  try {
    page = page - 1;
    const jwt = cookies().get("jwt")?.value;
    let url = `${crmCoreEndpoint}/crm/core/api/v1/customers?offset=${page * (limit)}&limit=${limit}`;
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
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na busca dos clientes";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const respData = await resp.json() as SearchResponse<Customer>;

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
