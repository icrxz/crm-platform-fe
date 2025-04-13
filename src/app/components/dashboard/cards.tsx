import { CaseReportsCard } from './case-reports-card';
import { CaseReceiptsCard } from './case-receipt-card';
import { CaseFirstPaymentsCard } from './case-first-payments-card';

export default async function CardWrapper() {
  return (
    <>
      <CaseReportsCard />

      <CaseFirstPaymentsCard />

      <CaseReceiptsCard />
    </>
  );
}


