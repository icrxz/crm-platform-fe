import { Metadata } from 'next';

import PartnersTable from '@/app/components/partners/table';
import { getCurrentUser } from '@/app/libs/session';
import { fetchPartners } from '@/app/services/partners';
import { Partner } from '@/app/types/partner';
import { SearchResponse } from '@/app/types/search_response';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { removeDocumentSymbols } from '@/app/libs/parser';

export const metadata: Metadata = {
  title: 'Técnicos',
};

type PartnerPageParams = {
  searchParams?: {
    documento?: string;
    page?: number;
  };
};

async function getData(document: string, page: number): Promise<SearchResponse<Partner>> {
  let query = '';
  if (document) {
    const parsedDocument = removeDocumentSymbols(document)
    query = `document=${parsedDocument}`
  }

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

  const data = await getData(searchParams?.documento || '', searchParams?.page || 1);

  return (
    <main>
      <Suspense fallback={<p>Carregando técnicos...</p>}>
        <PartnersTable partners={data} initialPage={searchParams?.page} />
      </Suspense>
    </main>
  );
}
