`use server`;
import PartnersTable from '@/app/components/partners/table';
import { unauthorizedRedirect } from '@/app/libs/auth-redirect';
import { removeDocumentSymbols } from '@/app/libs/parser';
import { getCurrentUser } from '@/app/libs/session';
import { fetchPartners } from '@/app/services/partners';
import { PartnerListItem } from '@/app/types/partner-list-item';
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
): Promise<SearchResponse<PartnerListItem>> {
  let { page, ...rest } = filters || {};
  page = page || 1;

  const query = prepareQuery(rest);

  const { success, unauthorized, data } = await fetchPartners(query, page);
  if (!success || !data) {
    if (unauthorized) {
      await unauthorizedRedirect();
    }
    return { result: [], paging: { limit: 10, offset: page * 10, total: 0 } };
  }

  const listItems = data.result.map(
    (p): PartnerListItem => ({
      partner_id: p.partner_id,
      first_name: p.first_name,
      last_name: p.last_name,
      partner_type: p.partner_type,
      document: p.document,
      city: p.shipping.city,
      state: p.shipping.state,
      active: p.active,
    })
  );

  return { result: listItems, paging: data.paging };
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
