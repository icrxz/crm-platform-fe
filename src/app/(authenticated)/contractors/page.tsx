`use server`;
import { unauthorizedRedirect } from '@/app/libs/auth-redirect';
import { getCurrentUser } from '@/app/libs/session';
import { Suspense } from 'react';
import ContractorsTable from '../../components/contractors/table';
import { fetchContractors } from '../../services/contractors';
import { ContractorListItem } from '@/app/types/contractor-list-item';
import { SearchResponse } from '@/app/types/search_response';
import { redirect } from 'next/navigation';

type ContractorPageParams = {
  searchParams: Promise<{
    nome?: string;
    page?: number;
  }>;
};

async function getData(
  nome: string,
  page: number
): Promise<SearchResponse<ContractorListItem>> {
  let query = '';
  if (nome) {
    query = `company_name=${nome}`;
  }

  const { success, unauthorized, data } = await fetchContractors(query, page);
  if (!success || !data) {
    if (unauthorized) {
      await unauthorizedRedirect();
    }
    return { result: [], paging: { limit: 10, offset: page * 10, total: 0 } };
  }

  const listItems = data.result.map(
    (c): ContractorListItem => ({
      contractor_id: c.contractor_id,
      company_name: c.company_name,
      legal_name: c.legal_name,
      document: c.document,
      created_at: c.created_at,
      active: c.active,
    })
  );

  return { result: listItems, paging: data.paging };
}

export default async function Page({ searchParams }: ContractorPageParams) {
  const { nome, page } = await searchParams;
  const session = await getCurrentUser();
  if (!session) {
    redirect('/login');
  }

  const data = await getData(nome || '', page || 1);

  return (
    <main>
      <Suspense fallback={<p>Carregando seguradoras...</p>}>
        <ContractorsTable contractors={data} initialPage={page} />
      </Suspense>
    </main>
  );
}
