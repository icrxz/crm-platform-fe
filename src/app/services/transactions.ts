"use server";
import { getServerSession } from "next-auth/next";
import { cookies } from "next/headers";
import { ServiceResponse } from "../types/service";
import { CreateTransaction, CreateTransactionResponse, Transaction, TransactionType } from "../types/transaction";

const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT;
const crmCoreApiKey = process.env.CRM_CORE_API_KEY;

export async function fetchTransactions(query: string): Promise<ServiceResponse<Transaction[]>> {
  console.log("query", query);
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

export async function createTransaction(_currentState: unknown, formData: FormData): Promise<ServiceResponse<CreateTransactionResponse>> {
  try {
    const caseID = formData.get("case_id");
    if (!caseID) {
      return {
        success: false,
        message: "ID do caso não informado",
      };
    }

    const session = await getServerSession();
    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/cases/${caseID}/transactions`;

    const formTransactionValue = formData.get("value")?.toString();
    let transactionValue = 0;
    if (formTransactionValue && !Number.isNaN(formTransactionValue)) {
      transactionValue = Number.parseFloat(formTransactionValue);
    }

    const payload: CreateTransaction = {
      type: formData.get("type")?.toString() as TransactionType || '',
      value: transactionValue,
      created_by: session?.user?.name || '',
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
