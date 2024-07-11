"use server";
import { Contractor } from "@/app/types/contractor";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

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
      const unauthorized = response.status === 401;
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na busca da seguradora";
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
    console.error(ex);

    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    };
  }
}
