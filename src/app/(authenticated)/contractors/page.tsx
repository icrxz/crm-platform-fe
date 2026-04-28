`use server`;
import { unauthorizedRedirect } from '@/app/libs/auth-redirect';
import { getCurrentUser } from '@/app/libs/session';
import { Suspense } from 'react';
import ContractorsTable from '../../components/contractors/table';
import { fetchContractors } from '../../services/contractors';
import { SearchResponse } from '@/app/types/search_response';
import { Contractor } from '@/app/types/contractor';
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
): Promise<SearchResponse<Contractor>> {
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

  const contractors = data.result;

  return {
    result: contractors,
    paging: data.paging,
  };
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
