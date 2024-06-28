"use client";
import { CaseFull, CaseStatus } from "@/app/types/case";
import { CustomerInfoStatusForm } from "./customer_info";
import { NewCaseStatusForm } from "./new_case";
import { OnGoingStatusForm } from "./ongoing_case";
import { PartnerInfoStatusForm } from "./partner_info";

interface FormDetailsProps {
    crmCase: CaseFull;
}

export function FormDetails({ crmCase }: FormDetailsProps) {
    switch (crmCase.status) {
        case CaseStatus.NEW:
            return <NewCaseStatusForm crmCase={crmCase} />;
        case CaseStatus.CUSTOMER_INFO:
            return <CustomerInfoStatusForm crmCase={crmCase} />;
        case CaseStatus.WAITING_PARTNER:
            return <PartnerInfoStatusForm crmCase={crmCase} />;
        case CaseStatus.ONGOING:
            return <OnGoingStatusForm crmCase={crmCase} />;
        default:
            return <></>;
    }
}
