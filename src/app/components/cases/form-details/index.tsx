'use client';
import { CaseFull, CaseStatus } from '@/app/types/case';
import { CustomerInfoStatusForm } from './customer_info';
import { NewCaseStatusForm } from './new_case';
import { OnGoingStatusForm } from './ongoing_case';
import { OnGoingStatusFormV2 } from './ongoing_case_v2';
import { isOngoingFlowV2 } from '@/app/utils/ongoing_wizard';
import { PartnerInfoStatusForm } from './partner_info';
import { ReceiptStatusForm } from './receipt';
import { ReportStatusForm } from './report';
import { TransactionStatusForm } from './transactions';
import { DraftStatusForm } from './draft_case';

interface FormDetailsProps {
  crmCase: CaseFull;
}

export function FormDetails({ crmCase }: FormDetailsProps) {
  switch (crmCase.status) {
    case CaseStatus.DRAFT:
      return <DraftStatusForm crmCase={crmCase} />;
    case CaseStatus.NEW:
      return <NewCaseStatusForm crmCase={crmCase} />;
    case CaseStatus.CUSTOMER_INFO:
      return <CustomerInfoStatusForm crmCase={crmCase} />;
    case CaseStatus.WAITING_PARTNER:
      return <PartnerInfoStatusForm crmCase={crmCase} />;
    case CaseStatus.ONGOING:
      return isOngoingFlowV2(crmCase) ? (
        <OnGoingStatusFormV2 crmCase={crmCase} />
      ) : (
        <OnGoingStatusForm crmCase={crmCase} />
      );
    case CaseStatus.REPORT:
      return <ReportStatusForm crmCase={crmCase} />;
    case CaseStatus.PAYMENT:
      return <TransactionStatusForm crmCase={crmCase} />;
    case CaseStatus.RECEIPT:
      return <ReceiptStatusForm crmCase={crmCase} />;
    case CaseStatus.CLOSED:
      return <ReceiptStatusForm crmCase={crmCase} />;
    default:
      return <></>;
  }
}
