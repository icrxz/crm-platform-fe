"use server";
import { getCurrentUser } from "@/app/libs/session";
import { UpdateProduct } from "@/app/types/product";
import { ServiceResponse } from "@/app/types/service";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";
import { parseCurrencyToNumber } from "@/app/libs/parser";

export async function updateProduct(_currentState: unknown, formData: FormData): Promise<ServiceResponse<any>> {
  try {
    const productID = formData.get('product_id')?.toString() || '';
    if (!productID) {
      return {
        success: false,
        message: "ID do produto não informado",
      };
    }

    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/products/${productID}`;

    const session = await getCurrentUser();
    const author = session?.username || '';

    const payload: UpdateProduct = {
      updated_by: author,
      brand: formData.get('brand')?.toString(),
      model: formData.get('model')?.toString(),
      value: parseCurrencyToNumber(formData.get('amount')?.toString() || ''),
      product_description: formData.get('product_description')?.toString(),
      product_name: formData.get('product_name')?.toString(),
      serial_number: formData.get('serial_number')?.toString(),
    };

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
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na edição do produto";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    return {
      message: "produto editado com sucesso!",
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
