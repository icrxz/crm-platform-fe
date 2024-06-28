"use server";

import { CreateCustomer, CreateCustomerResponse } from "@/app/types/customer";
import { ServiceResponse } from "@/app/types/service";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function createCustomer(_currentState: unknown, formData: FormData): Promise<ServiceResponse<CreateCustomerResponse>> {
  try {
    console.log("form-data", formData);
    const session = await getServerSession();
    console.log("session", (session?.user as unknown as any)['user']);

    const isCPF = true;
    const author = session?.user?.name || '';
    const address = `${formData.get('address')?.toString() || ''}, ${formData.get('number')?.toString() || ''} - ${formData.get('complement')?.toString() || ''}`;

    const payload = {
      first_name: formData.get('first_name')?.toString() || '',
      last_name: formData.get('last_name')?.toString() || '',
      document: formData.get('document')?.toString() || '',
      document_type: isCPF ? "CPF" : "CNPJ",
      shipping: {
        address: address,
        city: formData.get('city')?.toString() || '',
        state: formData.get('state')?.toString() || '',
        country: 'brazil',
        zip_code: formData.get('zip_code')?.toString() || '',
      },
      personal_contact: {
        email: formData.get('email')?.toString() || '',
        phone_number: formData.get('phone')?.toString() || '',
      },
      created_by: author,
    } as CreateCustomer;

    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/customers`;

    const resp = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`
      }
    });

    if (!resp.ok) {
      return {
        success: false,
        message: "falha na criação do cliente",
        unauthorized: resp.status === 401,
      };
    }

    const respData = await resp.json() as CreateCustomerResponse;

    return {
      success: true,
      message: "cliente criado com sucesso!!",
      unauthorized: false,
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
