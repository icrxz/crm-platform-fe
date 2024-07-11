"use server";
import { removeDocumentSymbols } from "@/app/libs/parser";
import { getCurrentUser } from "@/app/libs/session";
import { CreatePartner } from "@/app/types/partner";
import { ServiceResponse } from "@/app/types/service";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function createPartner(_currentState: unknown, formData: FormData): Promise<ServiceResponse<any>> {
  try {
    const session = await getCurrentUser();
    const author = session?.user_id || '';

    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/partners`;

    let address = '';
    if (formData.get("address")) {
      address = `${formData.get('address')?.toString() || ''}, ${formData.get('number')?.toString() || ''} - ${formData.get('complement')?.toString() || ''}`;
    }

    const formDocument = formData.get('document')?.toString() || '';
    const document = removeDocumentSymbols(formDocument);
    const isCPF = document.length === 11;

    const payload = {
      first_name: formData.get('first_name')?.toString() || '',
      last_name: formData.get('last_name')?.toString() || '',
      document,
      document_type: isCPF ? "CPF" : "CNPJ",
      partner_type: isCPF ? "Natural" : "Legal",
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
    } as CreatePartner;

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
        message: "Falha na criação do técnico",
        unauthorized: resp.status === 401,
      };
    }

    return {
      success: true,
      message: "Técnico criado com sucesso!",
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
