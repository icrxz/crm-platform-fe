"use server";
import { cookies } from "next/headers";
import { Case, CreateCase, CreateCaseResponse } from "../types/case";
import { ServiceResponse } from "../types/service";
import { getServerSession } from "next-auth";
import { createCustomer } from "./customers";

const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT
const crmCoreApiKey = process.env.CRM_CORE_API_KEY

export async function fetchCases(query: string): Promise<ServiceResponse<Case[]>> {
  console.log("query", query)

  try {
    const jwt = cookies().get("jwt")?.value
    const url = `${crmCoreEndpoint}/crm/core/api/v1/cases`;

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

    const respData = await resp.json() as Case[];
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

export async function createCase(_currentState: unknown, formData: FormData): Promise<ServiceResponse<CreateCaseResponse>> {
  console.log("formData", formData)
  try {
    const session = await getServerSession();
    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/cases`;

    let customerID = formData.get("customer_id")?.toString() || '';

    if (customerID == "") {
      const customerResp = await createCustomer(_currentState, formData)
      if (!customerResp.success || !customerResp.data) {
        return {
          message: customerResp.message,
          success: customerResp.success,
          unauthorized: customerResp.unauthorized,
        }
      }
      customerID = customerResp.data.customer_id
    }

    const formDueDate = formData.get("due_date")?.toString() || '';
    const dueDate = new Date(formDueDate).toISOString()

    const formValue = formData.get("amount")?.toString() || '';
    const productValue = Number(formValue)

    const payload: CreateCase = {
      contractor_id: formData.get("contractor")?.toString() || '',
      customer_id: customerID,
      origin_channel: "platform",
      case_type: "insurance",
      due_date: dueDate,
      subject: formData.get("description")?.toString() || '',
      created_by: session?.user?.name || '',
      brand: formData.get("brand")?.toString() || '',
      model: formData.get("model")?.toString() || '',
      external_reference: formData.get("claim")?.toString() || '',
      value: productValue,
    }

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`
      },
      body: JSON.stringify(payload)
    })

    if (!resp.ok) {
      const unauthorized = resp.status === 401
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na criação do caso"
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const respData = await resp.json() as CreateCaseResponse;
    return {
      message: "caso criado com sucesso!",
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

export async function getCaseByID(caseID: string): Promise<ServiceResponse<Case>> {
  try {
    if (caseID == "") {
      return {
        success: false,
        message: "ID do caso não informado",
      };
    }

    const jwt = cookies().get("jwt")?.value
    const url = `${crmCoreEndpoint}/crm/core/api/v1/cases/${caseID}`;

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
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na busca do caso"
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const respData = await resp.json() as Case;
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