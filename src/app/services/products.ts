"use server";

import { cookies } from "next/headers";
import { Product } from "../types/product";
import { ServiceResponse } from "../types/service";

const crmCoreEndpoint = process.env.CRM_CORE_ENDPOINT;
const crmCoreApiKey = process.env.CRM_CORE_API_KEY;

export async function getProductByID(productID: string): Promise<ServiceResponse<Product>> {
  try {
    if (productID == "") {
      return {
        success: false,
        message: "ID do produto não informado",
      };
    }

    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/products/${productID}`;

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
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na busca do produto";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const data = await resp.json() as Product;
    return {
      success: true,
      message: "produto encontrado com sucesso",
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    };
  }
}
