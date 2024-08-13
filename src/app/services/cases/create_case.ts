"use server";
import { parseCurrencyToNumber } from "@/app/libs/parser";
import { getCurrentUser } from "@/app/libs/session";
import { CreateCase, CreateCaseResponse } from "@/app/types/case";
import { ServiceResponse } from "@/app/types/service";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";
import { createCustomer } from "../customers";
import { DateTime } from "next-auth/providers/kakao";

export async function createCase(_currentState: unknown, formData: FormData): Promise<ServiceResponse<CreateCaseResponse>> {
  try {
    const jwt = cookies().get("jwt")?.value;
    const url = `${crmCoreEndpoint}/crm/core/api/v1/cases`;

    const session = await getCurrentUser();
    const author = session?.user_id || '';

    let customerID = formData.get("customer_id")?.toString() || '';

    if (customerID == "") {
      const customerResp = await createCustomer(_currentState, formData);
      if (!customerResp.success || !customerResp.data) {
        return {
          message: customerResp.message,
          success: customerResp.success,
          unauthorized: customerResp.unauthorized,
        };
      }
      customerID = customerResp.data.customer_id;
    }

    const dueDate = getWorkingDays(new Date(), 7);

    const formValue = formData.get("amount")?.toString() || '';
    const productValue = parseCurrencyToNumber(formValue);

    const payload: CreateCase = {
      contractor_id: formData.get("contractor")?.toString() || '',
      customer_id: customerID,
      origin_channel: "platform",
      case_type: "insurance",
      due_date: dueDate,
      subject: formData.get("description")?.toString() || '',
      created_by: author,
      brand: formData.get("brand")?.toString() || '',
      model: formData.get("model")?.toString() || '',
      external_reference: formData.get("claim")?.toString() || '',
      value: productValue,
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const unauthorized = resp.status === 401;
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha na criação do caso";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
        data: { customer_id: customerID } as CreateCaseResponse,
      };
    }

    const respData = await resp.json() as CreateCaseResponse;
    return {
      message: "caso criado com sucesso!",
      success: true,
      data: respData,
    };
  } catch (ex) {
    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    };
  }
};

function getWorkingDays(startDate: Date, days: number): string {
  var currentDate = startDate;
  for (let i = 0; i < days;) {
    let weekDay = currentDate.getDay();

    currentDate.setDate(currentDate.getDate() + 1);
    if (weekDay != 0 && weekDay != 6) {
      i++;
    }
  }
  console.log('saiu daqui')

  return currentDate.toISOString();
}
