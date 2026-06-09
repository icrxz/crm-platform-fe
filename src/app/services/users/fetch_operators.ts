'use server';
import { SearchResponse } from '@/app/types/search_response';
import { ServiceResponse } from '@/app/types/service';
import { User, UserRole } from '@/app/types/user';
import { cookies } from 'next/headers';
import { crmCoreEndpoint } from '../cases';

export async function fetchOperators(): Promise<ServiceResponse<User[]>> {
  try {
    const jwt = (await cookies()).get('jwt')?.value;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.CRM_CORE_API_KEY || '',
      Authorization: `Bearer ${jwt}`,
    };

    const base = `${crmCoreEndpoint}/crm/core/api/v1`;
    const limit = 500;
    let offset = 0;
    const result: User[] = [];

    while (true) {
      const resp = await fetch(
        `${base}/users?role=${UserRole.OPERATOR}&active=true&limit=${limit}&offset=${offset}`,
        { method: 'GET', headers }
      );
      if (!resp.ok) break;
      const data = (await resp.json()) as SearchResponse<User>;
      result.push(...data.result);
      if (offset + limit >= data.paging.total) break;
      offset += limit;
    }

    return { success: true, message: '', data: result };
  } catch (ex) {
    console.error(ex);
    return {
      success: false,
      message: 'algo de errado aconteceu, contate o suporte!',
    };
  }
}
