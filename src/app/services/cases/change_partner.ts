'use server';
import { getApiErrorMessage } from '@/app/libs/api-error';
import { getCurrentUser } from '@/app/libs/session';
import { CaseStatus } from '@/app/types/case';
import { ChangePartner } from '@/app/types/change_partner';
import { ServiceResponse } from '@/app/types/service';
import {
  ONGOING_FLOW_VERSION_METADATA_KEY,
  ONGOING_FLOW_VERSION_V2_VALUE,
} from '@/app/utils/case_metadata';
import { cookies } from 'next/headers';
import { crmCoreApiKey, crmCoreEndpoint } from '.';
import { updateCaseMetadata } from './update_case_metadata';

export async function changePartner(
  caseID: string,
  formData: FormData
): Promise<ServiceResponse<any>> {
  try {
    if (caseID == '') {
      return { success: false, message: 'ID do caso não fornecido!' };
    }

    const url = `${crmCoreEndpoint}/crm/core/api/v1/cases/${caseID}/partner`;
    const jwt = (await cookies()).get('jwt')?.value;

    const session = await getCurrentUser();
    const author = session?.username || '';

    const formTargetDate = formData.get('target_date')?.toString() || '';
    const targetDate = new Date(formTargetDate).toISOString();

    const payload: ChangePartner = {
      updated_by: author,
      target_date: targetDate,
      partner_id: formData.get('partner')?.toString() || '',
      status: CaseStatus.ONGOING,
    };

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': crmCoreApiKey || '',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const unauthorized = response.status === 401;
      const errorMessageDefault = unauthorized
        ? 'usuário não autorizado'
        : 'falha na associação do técnico';
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

    // This is the only transition into Ongoing, so it's where a case gets
    // pinned to the v2 wizard. Best effort: the partner is already assigned,
    // and a case left unstamped just keeps the original form.
    if (process.env.ONGOING_WIZARD_V2_ENABLED === 'true') {
      await updateCaseMetadata(caseID, {
        [ONGOING_FLOW_VERSION_METADATA_KEY]: ONGOING_FLOW_VERSION_V2_VALUE,
      });
    }

    return {
      success: true,
      message: 'status do caso atualizado com sucesso',
    };
  } catch (error) {
    return {
      success: false,
      message: 'algo de errado aconteceu, contate o suporte!',
    };
  }
}
