"use server";
import CaseDetails from "@/app/components/cases/details";
import { getCurrentUser } from "@/app/libs/session";
import { getCaseByID } from "@/app/services/cases";
import { getCaseComments } from "@/app/services/comments/get_case_comments";
import { getContractorByID } from "@/app/services/contractors";
import { getCustomerByID } from "@/app/services/customers";
import { getPartnerByID } from "@/app/services/partners";
import { getProductByID } from "@/app/services/products";
import { getUserByID } from "@/app/services/user";
import { CaseFull } from "@/app/types/case";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function getData(caseID: string): Promise<CaseFull | null> {
  const { success, unauthorized, data: crmCase } = await getCaseByID(caseID);
  if (!success || !crmCase) {
    if (unauthorized) {
      redirect("/login");
    }
    redirect("/cases");
  }

  const [customer, contractor, partner, owner, product, comments] = await Promise.all([
    getCustomerByID(crmCase.customer_id),
    getContractorByID(crmCase.contractor_id),
    crmCase.partner_id && getPartnerByID(crmCase.partner_id),
    crmCase.owner_id && getUserByID(crmCase.owner_id),
    getProductByID(crmCase.product_id),
    getCaseComments(caseID)
  ]);

  return {
    ...crmCase,
    customer: customer.data,
    contractor: contractor.data,
    partner: partner && partner.data ? partner.data : undefined,
    owner: owner && owner.data ? owner.data : undefined,
    product: product.data,
    comments: comments.data,
  };
}

export default async function Page({ params: { caseID } }: { params: { caseID: string; }; }) {
  const user = await getCurrentUser();
  console.log(user);
  if (!user) {
    redirect("/login");
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
