import { Metadata } from 'next';

import { getCurrentUser } from '@/app/libs/session';
import { getContractorByID } from '@/app/services/contractors';
import { getCustomerByID } from '@/app/services/customers';
import { getPartnerByID } from '@/app/services/partners';
import { Case, CaseFull, CaseStatus } from '@/app/types/case';
import { User, UserRole } from '@/app/types/user';
import { signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import CasesTable from '../../components/cases/table';
import { fetchCases } from '../../services/cases';

export const metadata: Metadata = {
  title: 'Casos',
};

async function getData(query: string, user: User): Promise<CaseFull[]> {
  const { success, unauthorized, data: cases } = await fetchCases(query);
  if (!success || !cases) {
    if (unauthorized) {
      redirect("/login");
    }
    return [];
  }

  let filteredCases = cases;
  if (user.role === UserRole.OPERATOR) {
    filteredCases = cases.filter((crmCase) => crmCase.status !== CaseStatus.PAYMENT && crmCase.status !== CaseStatus.CLOSED && crmCase.status !== CaseStatus.CANCELED);
  }


  const casesFull = await Promise.all(filteredCases.map(async (crmCase: Case) => {
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
  const user = await getCurrentUser();
  if (!user) {
    signOut();
  }

  const data = await getData(searchParams?.query || '', user as User);

  return (
    <main>
      <Suspense fallback={<p>carregando casos...</p>} >
        {data && <CasesTable cases={data} />}
      </Suspense>
    </main>
  );
}
