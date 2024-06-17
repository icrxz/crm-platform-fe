"use server";
import { getServerSession } from "next-auth";
import { Contractor, CreateContractor, CreateContractorResponse, EditContractor } from "../types/contractor";
import { cookies } from "next/headers";
import { ServiceResponse } from "../types/service";

const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT
const crmCoreApiKey = process.env.CRM_CORE_API_KEY

export async function fetchContractors(query: string): Promise<ServiceResponse<Contractor[]>> {
  console.log("query", query)

  try {
    const jwt = cookies().get("jwt")?.value
    const url = `${crmCoreEndpoint}/crm/core/api/v1/contractors`;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`
      }
    })

    if (!resp.ok) {
      const unauthorized = resp.status === 401
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na busca das seguradoras"
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const respData = await resp.json() as Contractor[];
    console.log(respData)
    return {
      message: "",
      success: true,
      data: respData,
    }
  } catch (ex) {
    console.error(ex)

    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    }
  }
}

export async function createContractor(_currentState: unknown, formData: FormData): Promise<ServiceResponse<CreateContractorResponse>> {
  console.log(formData);
  const session = await getServerSession();
  console.log("session", session)

  const payload: CreateContractor = {
    company_name: formData.get("company_name")?.toString() || '',
    legal_name: formData.get("legal_name")?.toString() || '',
    business_contact: {
      email: formData.get("email")?.toString() || '',
      phone_number: formData.get("phone")?.toString() || '',
    },
    document: formData.get("document")?.toString() || '',
    created_by: session?.user?.name || '',
  };

  try {
    const url = `${crmCoreEndpoint}/crm/core/api/v1/contractors`;
    const jwt = cookies().get("jwt");

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt?.value}`
      }
    });

    if (!response.ok) {
      const unauthorized = response.status === 401
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na criação da seguradora"
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const resData = await response.json() as CreateContractorResponse;
    return {
      success: true,
      message: "seguradora criada com sucesso",
      data: resData
    };
  } catch (ex) {
    console.error(ex)

    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    }
  }
}

export async function getContractorByID(contractorID: string) {
  try {
    if (!contractorID) {
      return {
        success: false,
        message: "ID da seguradora não informado",
      };
    }

    const url = `${crmCoreEndpoint}/crm/core/api/v1/contractors/${contractorID}`;
    const jwt = cookies().get("jwt");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt?.value}`
      }
    });

    if (!response.ok) {
      const unauthorized = response.status === 401
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na busca da seguradora"
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const resData = await response.json() as Contractor;
    return {
      success: true,
      message: "seguradora encontrado com sucesso",
      data: resData
    };
  } catch (ex) {
    console.error(ex)

    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    }
  }
}

export async function editContractor(_currentState: unknown, formData: FormData) {
  try {
    const contractorID = formData.get('contractor_id')?.toString() || ''
    if (!contractorID) {
      return {
        success: false,
        message: "ID da seguradora não informado",
      };
    }

    const session = await getServerSession();
    const jwt = cookies().get("jwt");

    const payload: EditContractor = {
      company_name: formData.get("company_name")?.toString() || '',
      legal_name: formData.get("legal_name")?.toString() || '',
      business_contact: {
        email: formData.get("email")?.toString() || '',
        phone_number: formData.get("phone")?.toString() || '',
      },
      document: formData.get("document")?.toString() || '',
      updated_by: session?.user?.name || '',
    };

    const url = `${crmCoreEndpoint}/crm/core/api/v1/contractors/${contractorID}`;

    const response = await fetch(url, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt?.value}`
      }
    });

    if (!response.ok) {
      const unauthorized = response.status === 401
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na edição da seguradora"
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const resData = await response.json() as CreateContractorResponse;
    return {
      success: true,
      message: "seguradora editada com sucesso",
      data: resData
    };
  } catch (ex) {
    console.error(ex)

    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    }
  }
}

export async function deleteContractor(_currentState: unknown, formData: FormData) {
  try {
    const contractorID = formData.get('contractor_id')?.toString() || ''
    if (!contractorID) {
      return {
        success: false,
        message: "ID da seguradora não informado",
      };
    }

    const jwt = cookies().get("jwt")?.value
    const url = `${crmCoreEndpoint}/crm/core/api/v1/contractors/${contractorID}`;

    const resp = await fetch(url, {
      method: "DELETE",
      headers: {
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`
      }
    })

    if (!resp.ok) {
      const unauthorized = resp.status === 401
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na desativação da seguradora"
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    return {
      success: true,
      message: "seguradora desativada com sucesso",
      unauthorized: false,
    };
  } catch (ex) {
    console.error(ex)

    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    }
  }
}
