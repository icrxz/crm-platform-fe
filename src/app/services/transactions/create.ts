"use server";
import { parseCurrencyToNumber } from "@/app/libs/parser";
import { getCurrentUser } from "@/app/libs/session";
import { ServiceResponse } from "@/app/types/service";
import { CreateTransaction, CreateTransactionResponse, TransactionType } from "@/app/types/transaction";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function createTransaction(caseID: string, formData: FormData): Promise<ServiceResponse<CreateTransactionResponse>> {
  try {
    if (!caseID) {
      return {
        success: false,
        message: "ID do caso não informado",
      };
    }

    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/cases/${caseID}/transactions`;

    const session = await getCurrentUser();
    const author = session?.username || '';

    const formValue = formData.get("amount")?.toString() || '';
    const transactionValue = parseCurrencyToNumber(formValue);

    const payload: CreateTransaction = {
      type: formData.get("transaction_type")?.toString() as TransactionType || '',
      value: transactionValue,
      created_by: author,
      description: formData.get("description")?.toString(),
    };

    const resp = await fetch(url, {
      method: "POST",
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
      message: "transação criada com sucesso",
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
