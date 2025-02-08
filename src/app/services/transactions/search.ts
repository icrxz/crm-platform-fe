"use server";
import { ServiceResponse } from "@/app/types/service";
import { Transaction } from "@/app/types/transaction";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function fetchTransactions(query: string): Promise<ServiceResponse<Transaction[]>> {
  try {
    const jwt = cookies().get("jwt")?.value;
    let url = `${crmCoreEndpoint}/crm/core/api/v1/transactions`;
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
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na busca das transações";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const respData = await resp.json() as Transaction[];
    return {
      message: "transações encontradas com sucesso",
      success: true,
      data: respData,
    };
  } catch (error) {
    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    };
  }
}
