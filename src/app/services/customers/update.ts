"use server";
import { removeDocumentSymbols } from "@/app/libs/parser";
import { getCurrentUser } from "@/app/libs/session";
import { EditCustomer } from "@/app/types/customer";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function editCustomer(_currentState: unknown, formData: FormData): Promise<any> {
  try {
    const session = await getCurrentUser();
    const author = session?.username || '';

    const customerID = formData.get('customer_id')?.toString() || '';
    if (!customerID) {
      return {
        success: false,
        message: "ID do cliente não informado",
      };
    }

    const formAddress = formData.get('address')?.toString();
    let address;
    if (formAddress) {
      address = `${formData.get('address')?.toString() || ''}, ${formData.get('number')?.toString() || ''} - ${formData.get('complement')?.toString() || ''}`;
    }

    const formDocument = formData.get('document')?.toString();
    let document;
    let isCPF;
    if (formDocument) {
      document = removeDocumentSymbols(formDocument);
      isCPF = document.length === 11;
    }

    const payload: EditCustomer = {
      first_name: formData.get('first_name')?.toString(),
      last_name: formData.get('last_name')?.toString(),
      document,
      document_type: isCPF !== undefined ? (isCPF ? "CPF" : "CNPJ") : undefined,
      shipping: {
        address: address,
        city: formData.get('city')?.toString(),
        state: formData.get('state')?.toString(),
        zip_code: formData.get('zip_code')?.toString(),
      },
      personal_contact: {
        email: formData.get('email')?.toString(),
        phone_number: formData.get('phone')?.toString(),
      },
      updated_by: author,
    };

    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/customers/${customerID}`;

    const resp = await fetch(url, {
      method: "PUT",
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
        message: "falha na edição do cliente",
        unauthorized: resp.status === 401,
      };
    }

    return {
      success: true,
      message: "cliente editado com sucesso!!",
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
