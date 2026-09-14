'use server';
import { getApiErrorMessage } from '@/app/libs/api-error';
import { Attachment, CreateAttachment } from '@/app/types/attachments';
import { ServiceResponse } from '@/app/types/service';
import { cookies } from 'next/headers';
import { crmCoreApiKey, crmCoreEndpoint } from '.';

export async function addAttachmentToComment(
  commentID: string,
  attachment: CreateAttachment
): Promise<ServiceResponse<Attachment>> {
  try {
    if (!commentID) {
      return {
        success: false,
        message: 'ID do comentário não fornecido!',
      };
    }

    const url = `${crmCoreEndpoint}/crm/core/api/v1/comments/${commentID}/attachments`;
    const jwt = (await cookies()).get('jwt')?.value;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': crmCoreApiKey || '',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(attachment),
    });

    if (!response.ok) {
      const unauthorized = response.status === 401;
      const errorMessageDefault = unauthorized
        ? 'usuário não autorizado'
        : 'falha ao anexar comprovante';
      const errorMessage = await getApiErrorMessage(
        response,
        errorMessageDefault
      );

      return {
        success: false,
        message: errorMessage,
        unauthorized: unauthorized,
      };
    }

    const data = (await response.json()) as Attachment;

    return {
      success: true,
      message: 'anexo adicionado com sucesso',
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      message: 'algo de errado aconteceu, contate o suporte!',
    };
  }
}
