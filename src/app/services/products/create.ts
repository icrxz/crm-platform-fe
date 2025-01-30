"use server";
import { CreateProduct } from "@/app/types/product";
import { ServiceResponse } from "@/app/types/service";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";
import { getCurrentUser } from "@/app/libs/session";
import { parseCurrencyToNumber } from "@/app/libs/parser";

export async function createProduct(_currentState: unknown, formData: FormData): Promise<ServiceResponse<any>> {
  try {
    const session = await getCurrentUser();
    const author = session?.username || '';

    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/products`;

    const productValue = parseCurrencyToNumber(formData.get("amount")?.toString() || '');

    const payload: CreateProduct = {
      brand: formData.get('brand')?.toString() || '',
      model: formData.get('model')?.toString() || '',
      value: productValue,
      product_description: formData.get('product_description')?.toString() || '',
      product_name: formData.get('product_name')?.toString() || '',
      serial_number: formData.get('serial_number')?.toString() || '',
      created_by: author,
    };

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
        message: "Falha na criação do produto",
        unauthorized: resp.status === 401,
      };
    }

    return {
      success: true,
      message: "Produto criado com sucesso!",
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
