"use server";
import { ServiceResponse } from "@/app/types/service";
import { Transaction } from "@/app/types/transaction";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function getTransactionByID(transactionID: string): Promise<ServiceResponse<Transaction>> {
  try {
    if (transactionID == "") {
      return {
        success: false,
        message: "ID da transação não informado",
      };
    }

    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/transactions/${transactionID}`;
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
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na busca da transação";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const respData = await resp.json() as Transaction;
    return {
      message: "transação encontrada com sucesso",
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
