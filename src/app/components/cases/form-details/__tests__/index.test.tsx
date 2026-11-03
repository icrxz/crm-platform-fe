import { render, screen } from '@testing-library/react';
import { CaseFull, CaseStatus } from '@/app/types/case';
import { FormDetails } from '../index';

jest.mock('../ongoing_case', () => ({
  OnGoingStatusForm: () => <div>formulário original</div>,
}));
jest.mock('../ongoing_case_v2', () => ({
  OnGoingStatusFormV2: () => <div>wizard v2</div>,
}));
jest.mock('../customer_info', () => ({ CustomerInfoStatusForm: () => null }));
jest.mock('../new_case', () => ({ NewCaseStatusForm: () => null }));
jest.mock('../partner_info', () => ({ PartnerInfoStatusForm: () => null }));
jest.mock('../receipt', () => ({ ReceiptStatusForm: () => null }));
jest.mock('../report', () => ({ ReportStatusForm: () => null }));
jest.mock('../transactions', () => ({ TransactionStatusForm: () => null }));
jest.mock('../draft_case', () => ({ DraftStatusForm: () => null }));

function ongoingCase(metadata: Record<string, string>): CaseFull {
  return { status: CaseStatus.ONGOING, metadata } as unknown as CaseFull;
}

describe('FormDetails for an ongoing case', () => {
  // Casos que já estavam em andamento antes do wizard não têm a marca e
  // continuam no formulário original, mesmo com a feature ligada.
  it('keeps the original form for a case without the v2 stamp', () => {
    render(<FormDetails crmCase={ongoingCase({ category: 'furniture' })} />);

    expect(screen.getByText('formulário original')).toBeInTheDocument();
  });

  it('opens the wizard for a case stamped as v2', () => {
    render(
      <FormDetails crmCase={ongoingCase({ ongoing_flow_version: 'v2' })} />
    );

    expect(screen.getByText('wizard v2')).toBeInTheDocument();
  });
});
