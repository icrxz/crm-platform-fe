"use server";
import { getServerSession } from "next-auth/next";
import { cookies } from "next/headers";
import { CreatePartner, EditPartner, Partner } from "../types/partner";
import { ServiceResponse } from "../types/service";

const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT;
const crmCoreApiKey = process.env.CRM_CORE_API_KEY;

export async function fetchPartners(query: string): Promise<ServiceResponse<Partner[]>> {
  console.log("query", query);
  try {
    const jwt = cookies().get("jwt")?.value;
    let url = `${crmCoreEndpoint}/crm/core/api/v1/partners`;
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
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na busca dos técnicos";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const respData = await resp.json() as Partner[];

    return {
      message: "",
      success: true,
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

export async function getPartnerByID(partnerID: string): Promise<ServiceResponse<Partner>> {
  try {
    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/partners/${partnerID}`;

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
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na busca do técnico";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const respData = await resp.json() as Partner;

    return {
      message: "",
      success: true,
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

export async function createPartner(_currentState: unknown, formData: FormData): Promise<ServiceResponse<any>> {
  try {
    const session = await getServerSession();
    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/partners`;

    const isCPF = true;
    const author = session?.user?.name || '';
    let address = '';
    if (formData.get("address")) {
      address = `${formData.get('address')?.toString() || ''}, ${formData.get('number')?.toString() || ''} - ${formData.get('complement')?.toString() || ''}`;
    }

    const payload = {
      first_name: formData.get('first_name')?.toString() || '',
      last_name: formData.get('last_name')?.toString() || '',
      document: formData.get('document')?.toString() || '',
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

export async function deletePartner(_currentState: unknown, formData: FormData): Promise<ServiceResponse<null>> {
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

    const resp = await fetch(url, {
      method: "DELETE",
      headers: {
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`
      }
    });

    if (!resp.ok) {
      const unauthorized = resp.status === 401;
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na exclusão do técnico";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    return {
      message: "técnico desativado com sucesso!",
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

    const isCPF = true;
    let address = '';
    if (formData.get("address")) {
      address = `${formData.get('address')?.toString() || ''}, ${formData.get('number')?.toString() || ''} - ${formData.get('complement')?.toString() || ''}`;
    }

    const payload = {
      first_name: formData.get('first_name')?.toString() || '',
      last_name: formData.get('last_name')?.toString() || '',
      document: formData.get('document')?.toString() || '',
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
