import { Case } from "../types/case";
import { ServiceResponse } from "../types/service";

export async function fetchCases(query: string): Promise<Case[]> {
  return [
    {
      id: "1",
      partner_id: "Jose",
      customer_id: "João",
      status: "Em Andamento",
      priority: "Alta",
      due_date: "30/04/2024"
    } as Case
  ];
}

export async function createCase(_currentState: unknown, formData: FormData): Promise<ServiceResponse<any>> {
  console.log('caseData', formData)

  const caseData = {
    partner_id: formData.get('partner_id')?.toString() || '',
    customer_id: formData.get('customer_id')?.toString() || '',
    status: formData.get('status')?.toString() || '',
    priority: formData.get('priority')?.toString() || '',
    due_date: formData.get('due_date')?.toString() || '',
  } as Case;


  return {
    success: true,
    message: "Case created successfully"
  };
}