"use server";
import CaseDetails from "@/app/components/cases/details";
import { getCaseByID } from "@/app/services/cases";
import { getContractorByID } from "@/app/services/contractors";
import { getCustomerByID } from "@/app/services/customers";
import { getPartnerByID } from "@/app/services/partners";
import { getProductByID } from "@/app/services/products";
import { getUserByID } from "@/app/services/user";
import { CaseFull } from "@/app/types/case";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function getData(caseID: string): Promise<CaseFull | null> {
  const { success, unauthorized, data: crmCase } = await getCaseByID(caseID);
  if (!success || !crmCase) {
    if (unauthorized) {
      redirect("/login");
    }
    return null;
  }

  const [customer, contractor, partner, owner, product] = await Promise.all([
    getCustomerByID(crmCase.customer_id),
    getContractorByID(crmCase.contractor_id),
    crmCase.partner_id && getPartnerByID(crmCase.partner_id),
    crmCase.owner_id && getUserByID(crmCase.owner_id),
    getProductByID(crmCase.product_id)
  ]);

  return {
    ...crmCase,
    customer: customer.data,
    contractor: contractor.data,
    partner: partner && partner.data ? partner.data : undefined,
    owner: owner && owner.data ? owner.data : undefined,
    product: product.data,
  };
}

export default async function Page({ params: { caseID } }: { params: { caseID: string; }; }) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const crmCase = await getData(caseID);

  return (
    <main>
      <Suspense fallback={<p>Carregando caso...</p>}>
        {crmCase && <CaseDetails crmCase={crmCase} />}
      </Suspense>
    </main>
  );
}
