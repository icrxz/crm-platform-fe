'use server';
import CaseDetails from '@/app/components/cases/details';
import { unauthorizedRedirect } from '@/app/libs/auth-redirect';
import { getCurrentUser } from '@/app/libs/session';
import { getCaseFullByID } from '@/app/services/cases';
import { CaseFull } from '@/app/types/case';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function getData(caseID: string): Promise<CaseFull | null> {
  const {
    success,
    unauthorized,
    data: crmCase,
  } = await getCaseFullByID(caseID);
  if (!success || !crmCase) {
    if (unauthorized) {
      await unauthorizedRedirect();
    }
    redirect('/cases');
  }

  return crmCase;
}

export default async function Page({
  params,
}: {
  params: Promise<{ caseID: string }>;
}) {
  const { caseID } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const crmCase = await getData(caseID);

  return (
    <main>
      <Suspense fallback={<p>Carregando caso...</p>}>
        {crmCase && <CaseDetails crmCase={crmCase} userRole={user.role} />}
      </Suspense>
    </main>
  );
}
