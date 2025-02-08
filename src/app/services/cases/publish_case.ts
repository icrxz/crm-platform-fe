"use server";
import { getCurrentUser } from "@/app/libs/session";
import { CaseStatus } from "@/app/types/case";
import { ServiceResponse } from "@/app/types/service";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";
import { PublishCase } from "@/app/types/publish_case";
import { createCustomer, editCustomer } from "../customers";
import { createProduct } from "../products/create";
import { updateProduct } from "../products/update";

export async function publishCase(
  _currentState: unknown,
  caseID: string,
  formData: FormData,
): Promise<ServiceResponse<any>> {
  try {
    if (!caseID) {
      return {
        success: false,
        message: "ID do caso não fornecido!",
      };
    }

    const url = `${crmCoreEndpoint}/crm/core/api/v1/cases/${caseID}`;
    const jwt = cookies().get("jwt")?.value;

    const session = await getCurrentUser();
    const author = session?.username || '';

    let customerID = formData?.get('customer_id')?.toString() || '';
    if (!customerID) {
      const customerResp = await createCustomer(_currentState, formData);
      if (!customerResp.success || !customerResp.data) {
        return {
          message: customerResp.message,
          success: customerResp.success,
          unauthorized: customerResp.unauthorized,
        };
      }
      customerID = customerResp.data.customer_id;
    } else {
      const customerResp = await editCustomer(_currentState, formData);
      if (!customerResp.success) {
        return {
          message: customerResp.message,
          success: customerResp.success,
          unauthorized: customerResp.unauthorized,
        };
      }
    }

    let productID = formData?.get('product_id')?.toString() || '';
    if (!productID) {
      const productResp = await createProduct(_currentState, formData);
      if (!productResp.success || !productResp.data) {
        return {
          message: productResp.message,
          success: productResp.success,
          unauthorized: productResp.unauthorized,
        };
      }
      productID = productResp.data.product_id;
    } else {
      const productResp = await updateProduct(_currentState, formData);
      if (!productResp.success) {
        return {
          message: productResp.message,
          success: productResp.success,
          unauthorized: productResp.unauthorized,
        };
      }
    }

    const payload: PublishCase = {
      status: CaseStatus.NEW,
      customer_id: customerID,
      product_id: productID,
      subject: formData?.get('subject')?.toString() || '',
      updated_by: author,
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const resp = await response.json();
      console.error(resp);
      const unauthorized = response.status === 401;
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha ao publicar caso";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    return {
      success: true,
      message: "status do caso atualizado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    };
  }
}
