"use server";
import { getCurrentUser } from "@/app/libs/session";
import { CreateCaseBatchResponse } from "@/app/types/case";
import { ServiceResponse } from "@/app/types/service";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function createCaseBatch(formData: FormData): Promise<ServiceResponse<CreateCaseBatchResponse>> {
  try {
    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/cases/batch`;

    const session = await getCurrentUser();
    const author = session?.username || '';

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`,
        "X-Author": author,
      },
      body: formData,
    });

    if (!resp.ok) {
      const unauthorized = resp.status === 401;
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na criação dos casos";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const respData = await resp.json() as CreateCaseBatchResponse;
    return {
      message: "casos criados com sucesso!",
      success: true,
      data: respData,
    };
  } catch (ex) {
    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    };
  }
};
