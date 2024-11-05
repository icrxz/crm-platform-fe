"use server";
import { getCurrentUser } from "@/app/libs/session";
import { ServiceResponse } from "@/app/types/service";
import { UpdateUser } from "@/app/types/user";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function updateUser(userID: string, update: UpdateUser): Promise<ServiceResponse<null>> {
  try {
    if (userID == "") {
      return {
        success: false,
        message: "ID do usuário não informado",
      };
    }

    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/users/${userID}`;
    const session = await getCurrentUser();
    const author = session?.username || '';

    const payload: UpdateUser = {
      ...update,
      updated_by: author,
    };

    const resp = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const unauthorized = resp.status === 401;
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na atualização do usuário";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    return {
      success: true,
      message: "usuário atualizado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    };
  }
}
