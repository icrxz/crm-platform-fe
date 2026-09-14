'use server';
import { getApiErrorMessage } from '@/app/libs/api-error';
import { getCurrentUser } from '@/app/libs/session';
import { ServiceResponse } from '@/app/types/service';
import { cookies } from 'next/headers';
import { crmCoreApiKey, crmCoreEndpoint } from '.';

export async function updateCommentContent(
  commentID: string,
  content: string
): Promise<ServiceResponse<void>> {
  try {
    if (!commentID) {
      return {
        success: false,
        message: 'ID do comentário não fornecido!',
      };
    }

    const url = `${crmCoreEndpoint}/crm/core/api/v1/comments/${commentID}`;
    const jwt = (await cookies()).get('jwt')?.value;

    const session = await getCurrentUser();
    const author = session?.username || '';

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': crmCoreApiKey || '',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ content, updated_by: author }),
    });

    if (!response.ok) {
      const unauthorized = response.status === 401;
      const errorMessageDefault = unauthorized
        ? 'usuário não autorizado'
        : 'falha ao atualizar comentário';
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
      message: 'comentário atualizado com sucesso',
    };
  } catch (error) {
    return {
      success: false,
      message: 'algo de errado aconteceu, contate o suporte!',
    };
  }
}
