"use server";
import { cookies } from "next/headers";
import { CreateCustomer, CreateCustomerResponse, Customer, EditCustomer } from "../types/customer";
import { getServerSession } from "next-auth/next";
import { ServiceResponse } from "../types/service";

const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT
const crmCoreApiKey = process.env.CRM_CORE_API_KEY

export async function fetchCustomers(query: string): Promise<ServiceResponse<Customer[]>> {
  console.log("query", query)

  try {
    const jwt = cookies().get("jwt")?.value
    let url = `${crmCoreEndpoint}/crm/core/api/v1/customers`;
    if (query) {
      url = `${url}?${query}`
    }

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
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na busca dos clientes"
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const respData = await resp.json() as Customer[]

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

export async function getCustomerByID(customerID: string): Promise<ServiceResponse<Customer>> {
  try {
    if (!customerID) {
      return {
        success: false,
        message: "ID do cliente não informado",
      };
    }

    const jwt = cookies().get("jwt")?.value
    const url = `${crmCoreEndpoint}/crm/core/api/v1/customers/${customerID}`;

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
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na busca do cliente"
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const respData = await resp.json() as Customer;

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

export async function createCustomer(_currentState: unknown, formData: FormData): Promise<ServiceResponse<CreateCustomerResponse>> {
  try {
    console.log("form-data", formData)
    const session = await getServerSession();
    console.log("session", (session?.user as unknown as any)['user'])

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

    const jwt = cookies().get("jwt")?.value
    const url = `${crmCoreEndpoint}/crm/core/api/v1/customers`;

    const resp = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`
      }
    })

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
    console.error(ex)

    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    }
  }
}

export async function editCustomer(_currentState: unknown, formData: FormData): Promise<any> {
  try {
    const session = await getServerSession();
    const customerID = formData.get('customer_id')?.toString() || ''
    if (!customerID) {
      return {
        success: false,
        message: "ID do cliente não informado",
      };
    }

    const isCPF = true;
    const author = session?.user?.name || '';
    const address = `${formData.get('address')?.toString() || ''}, ${formData.get('number')?.toString() || ''} - ${formData.get('complement')?.toString() || ''}`;

    const payload: EditCustomer = {
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
      updated_by: author,
    };

    const jwt = cookies().get("jwt")?.value
    const url = `${crmCoreEndpoint}/crm/core/api/v1/customers/${customerID}`;

    const resp = await fetch(url, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`
      }
    })

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
    console.error(ex)

    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    }
  }
}

export async function deleteCustomer(_currentState: unknown, formData: FormData): Promise<any> {
  try {
    const session = await getServerSession();
    console.log("session", (session?.user as unknown as any)['user'])

    const customerID = formData.get('customer_id')?.toString() || ''
    if (!customerID) {
      return {
        success: false,
        message: "ID do cliente não informado",
      };
    }

    const jwt = cookies().get("jwt")?.value
    const url = `${crmCoreEndpoint}/crm/core/api/v1/customers/${customerID}`;

    const resp = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`
      }
    })

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
    console.error(ex)

    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    }
  }
}
