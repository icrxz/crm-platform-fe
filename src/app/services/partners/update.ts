"use server";
import { removeDocumentSymbols } from "@/app/libs/parser";
import { getCurrentUser } from "@/app/libs/session";
import { EditPartner } from "@/app/types/partner";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function editPartner(_currentState: unknown, formData: FormData) {
  try {
    const partnerID = formData.get('partner_id')?.toString() || '';
    if (!partnerID) {
      return {
        success: false,
        message: "ID do técnico não informado",
      };
    }

    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/partners/${partnerID}`;

    const session = await getCurrentUser();
    const author = session?.username || '';

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
      document: document,
      document_type: isCPF ? "CPF" : "CNPJ",
      partner_type: formData.get('partner_type')?.toString() || '',
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
      updated_by: author,
      payment_key: formData.get('payment_key')?.toString() || '',
      payment_key_option: formData.get('payment_key_option')?.toString() || '',
    } as EditPartner;

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
      const unauthorized = resp.status === 401;
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na edição do técnico";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    return {
      message: "técnico editado com sucesso!",
      success: true,
    };

  } catch (ex) {
    console.error(ex);

    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    };
  }
}
