`use server`;
import PartnersTable from '@/app/components/partners/table';
import { removeDocumentSymbols } from '@/app/libs/parser';
import { getCurrentUser } from '@/app/libs/session';
import { fetchPartners } from '@/app/services/partners';
import { Partner } from '@/app/types/partner';
import { SearchResponse } from '@/app/types/search_response';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

interface PartnerFilters {
  documento?: string;
  cidade?: string;
  estado?: string;
  nome?: string;
  first_name?: string;
  last_name?: string;
  page?: number;
}

type PartnerPageParams = {
  searchParams: Promise<PartnerFilters>;
};

function prepareQuery(filters?: PartnerFilters): string {
  let query = '';

  if (filters?.documento) {
    const parsedDocument = removeDocumentSymbols(filters.documento);
    query += `document=${parsedDocument}&`;
  }

  if (filters?.nome) {
    const fullName = filters.nome.trim();
    query += `name=${fullName}&`;
  }

  if (filters?.cidade) {
    query += `city=${filters.cidade.trim()}&`;
  }

  if (filters?.estado) {
    query += `state=${filters.estado.trim()}&`;
  }

  if (filters?.first_name) {
    query += `first_name=${filters.first_name.trim()}&`;
  }

  if (filters?.last_name) {
    query += `last_name=${filters.last_name.trim()}&`;
  }

  if (query.endsWith('&')) {
    query = query.slice(0, -1);
  }

  return query;
}

async function getData(
  filters?: PartnerFilters
): Promise<SearchResponse<Partner>> {
  let { page, ...rest } = filters || {};
  page = page || 1;

  const query = prepareQuery(rest);

  const { success, unauthorized, data } = await fetchPartners(query, page);
  if (!success || !data) {
    if (unauthorized) {
      redirect('/login');
    }
    return { result: [], paging: { limit: 10, offset: page * 10, total: 0 } };
  }

  const partners = data.result;

  return {
    result: partners,
    paging: data.paging,
  };
}

export default async function Page({ searchParams }: PartnerPageParams) {
  const filters = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const data = await getData(filters);

  return (
    <main>
      <Suspense fallback={<p>Carregando técnicos...</p>}>
        <PartnersTable partners={data} initialPage={filters?.page} />
      </Suspense>
    </main>
  );
}
