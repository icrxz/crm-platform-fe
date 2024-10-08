"use server";
import { getCurrentUser } from "@/app/libs/session";
import { CreateAttachment } from "@/app/types/attachments";
import { Comment, CommentType, CreateComment } from "@/app/types/comment";
import { ServiceResponse } from "@/app/types/service";
import { cookies } from "next/headers";
import { crmCoreApiKey, crmCoreEndpoint } from ".";

export async function addComment(caseID: string, formData: FormData, attachments?: CreateAttachment[]): Promise<ServiceResponse<any>> {
  try {
    if (!caseID) {
      return {
        success: false,
        message: "ID do caso não fornecido!",
      };
    }

    const url = `${crmCoreEndpoint}/crm/core/api/v1/cases/${caseID}/comments`;
    const jwt = cookies().get("jwt")?.value;

    const session = await getCurrentUser();
    const author = session?.username || '';

    const payload: CreateComment = {
      content: formData.get("content")?.toString() || '',
      created_by: author,
      comment_type: CommentType.COMMENT,
      case_id: caseID,
      attachments: attachments,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": 'application/json',
        "X-API-Key": crmCoreApiKey || '',
        "Authorization": `Bearer ${jwt}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const unauthorized = response.status === 401;
      const errorMessage = unauthorized ? "usuário não autorizado" : "falha ao criar comentários no caso";
      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const data = await response.json() as Comment[];

    return {
      success: true,
      message: "comentários criado com sucesso",
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      message: "algo de errado aconteceu, contate o suporte!",
    };
  }
}
