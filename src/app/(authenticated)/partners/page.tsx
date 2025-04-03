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
  page?: number;
}

type PartnerPageParams = {
  searchParams?: PartnerFilters;
};

function prepareQuery(filters?: PartnerFilters): string {
  let query = '';

  if (filters?.documento) {
    const parsedDocument = removeDocumentSymbols(filters.documento);
    query += `document=${parsedDocument}&`;
  }

  if (filters?.nome) {
    const fullName = filters.nome.trim().split(' ');
    const firstName = fullName[0];
    const lastName = fullName.slice(1).join(' ');

    query += `first_name=${firstName}&`;

    if (lastName) {
      query += `last_name=${lastName}&`;
    }
  }

  if (filters?.cidade) {
    query += `city=${filters.cidade}&`;
  }

  if (filters?.estado) {
    query += `state=${filters.estado}&`;
  }

  if (query.endsWith('&')) {
    query = query.slice(0, -1);
  }

  return query;
}

async function getData(filters?: PartnerFilters): Promise<SearchResponse<Partner>> {
  let { page, ...rest } = filters || {};
  page = page || 1;

  const query = prepareQuery(rest);

  const { success, unauthorized, data } = await fetchPartners(query, page);
  if (!success || !data) {
    if (unauthorized) {
      redirect("/login");
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
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const data = await getData(searchParams);

  return (
    <main>
      <Suspense fallback={<p>Carregando técnicos...</p>}>
        <PartnersTable partners={data} initialPage={searchParams?.page} />
      </Suspense>
    </main>
  );
}
