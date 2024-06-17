"use client";
import { CaseFull, CaseStatus } from "@/app/types/case";
import { NewCaseStatusForm } from "./new_case";
import { ClientInfoCase } from "./client_info_case";
import { useEffect } from "react";

interface FormDetailsProps {
    crmCase: CaseFull;
}

export function FormDetails({ crmCase }: FormDetailsProps) {
    switch (crmCase.status) {
        case CaseStatus.NEW:
            return <NewCaseStatusForm crmCase={crmCase} />;
        case CaseStatus.CUSTOMER_INFO:
            return <ClientInfoCase crmCase={crmCase} />;
        default:
            return <></>
    }
}