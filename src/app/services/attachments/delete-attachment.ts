'use server';
import { getApiErrorMessage } from '@/app/libs/api-error';
import { ServiceResponse } from '@/app/types/service';
import { cookies } from 'next/headers';
import { crmCoreApiKey, crmCoreEndpoint } from '.';

export async function deleteAttachment(
  attachmentID: string
): Promise<ServiceResponse<void>> {
  try {
    if (!attachmentID) {
      return {
        success: false,
        message: 'ID do anexo não fornecido!',
      };
    }

    const url = `${crmCoreEndpoint}/crm/core/api/v1/attachments/${attachmentID}`;
    const jwt = (await cookies()).get('jwt')?.value;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'X-API-Key': crmCoreApiKey || '',
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!response.ok) {
      const unauthorized = response.status === 401;
      const errorMessageDefault = unauthorized
        ? 'usuário não autorizado'
        : 'falha ao excluir anexo';
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

    return {
      success: true,
      message: 'anexo excluído com sucesso',
    };
  } catch (error) {
    return {
      success: false,
      message: 'algo de errado aconteceu, contate o suporte!',
    };
  }
}
