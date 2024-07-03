import { Metadata } from 'next';

import { getCurrentUser } from '@/app/libs/session';
import { getContractorByID } from '@/app/services/contractors';
import { getCustomerByID } from '@/app/services/customers';
import { getPartnerByID } from '@/app/services/partners';
import { Case, CaseFull } from '@/app/types/case';
import { signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import CasesTable from '../../components/cases/table';
import { fetchCases } from '../../services/cases';

export const metadata: Metadata = {
  title: 'Casos',
};

async function getData(query: string): Promise<CaseFull[]> {
  const { success, unauthorized, data: cases } = await fetchCases(query);
  if (!success || !cases) {
    if (unauthorized) {
      redirect("/login");
    }
    return [];
  }

  const casesFull = await Promise.all(cases.map(async (crmCase: Case) => {
    const [customer, contractor, partner] = await Promise.all([
      getCustomerByID(crmCase.customer_id),
      getContractorByID(crmCase.contractor_id),
      crmCase.partner_id && getPartnerByID(crmCase.partner_id)
    ]);

    return {
      ...crmCase,
      customer: customer.data,
      contractor: contractor.data,
      partner: partner && partner.data ? partner.data : undefined,
    };
  }));

  return casesFull;
}

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const session = await getCurrentUser();
  if (!session) {
    signOut();
  }

  const data = await getData(searchParams?.query || '');

  return (
    <main>
      <Suspense fallback={<p>carregando casos...</p>} >
        {data && <CasesTable cases={data} />}
      </Suspense>
    </main>
  );
}
