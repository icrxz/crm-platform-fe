"use server";

import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function deleteCustomer(_currentState: unknown, formData: FormData): Promise<any> {
  try {
    const session = await getServerSession();
    console.log("session", (session?.user as unknown as any)['user']);

    const customerID = formData.get('customer_id')?.toString() || '';
    if (!customerID) {
      return {
        success: false,
        message: "ID do cliente não informado",
      };
    }

    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/customers/${customerID}`;

    const resp = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`
      }
    });

    if (!resp.ok) {
      return {
        success: false,
        message: "falha na desativação do cliente",
        unauthorized: resp.status === 401,
      };
    }

    return {
      success: true,
      message: "cliente desativado com sucesso!!",
      unauthorized: false,
    };
  } catch (ex) {
    console.error(ex);

    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    };
  }
}
