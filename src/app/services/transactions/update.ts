"use server";
import { getCurrentUser } from "@/app/libs/session";
import { ServiceResponse } from "@/app/types/service";
import { CreateTransactionResponse, UpdateTransaction } from "@/app/types/transaction";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function updateTransaction(transactionID: string, value: number): Promise<ServiceResponse<CreateTransactionResponse>> {
  try {
    if (!transactionID) {
      return {
        success: false,
        message: "ID do caso não informado",
      };
    }

    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/transactions/${transactionID}`;

    const session = await getCurrentUser();
    const author = session?.username || '';

    const payload: UpdateTransaction = {
      updated_by: author,
      value: value,
    };

    const resp = await fetch(url, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`,
      }
    });

    if (!resp.ok) {
      const unauthorized = resp.status === 401;
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na criação da transação";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const respData = await resp.json() as CreateTransactionResponse;
    return {
      message: "transação alterada com sucesso",
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
