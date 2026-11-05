import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { CaseFull, CaseStatus } from '@/app/types/case';
import { UserRole } from '@/app/types/user';
import {
  ONGOING_FLOW_VERSION_METADATA_KEY,
  ONGOING_FLOW_VERSION_V2_VALUE,
} from '@/app/utils/case_metadata';
import { caseDetailsFixture } from '@/app/qa-fixtures/case-details/fixture';
import CaseDetails from '../details';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('../../../context/SnackbarProvider', () => ({
  useSnackbar: () => ({ showSnackbar: jest.fn() }),
}));
jest.mock('../../../ui/fonts', () => ({ roboto: { className: 'roboto' } }));
// Cada seção tem o próprio teste; aqui só importa o que o card monta em volta.
jest.mock('../form-details', () => ({
  FormDetails: () => <div>formulário do status</div>,
}));
jest.mock('../form-details/case-moments', () => ({
  CaseMoments: () => <div>momentos do caso</div>,
}));
jest.mock('../form-details/comments', () => ({
  CommentDetails: () => <div>comentários</div>,
}));
jest.mock('../form-details/comments_v1', () => ({
  CommentDetailsV1: () => <div>detalhes com todos os comentários</div>,
}));
jest.mock('../form-details/reset_case', () => ({
  ResetCaseButton: () => <button>Resetar caso</button>,
}));
jest.mock('../download-report-button', () => ({
  DownloadReportButton: () => <button>Baixar laudo</button>,
}));

const mockPush = jest.fn();

function buildCase(overrides: Partial<CaseFull> = {}): CaseFull {
  return { ...caseDetailsFixture, ...overrides } as CaseFull;
}

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

describe('CaseDetails', () => {
  it('shows the case, customer and product data around the status form', () => {
    render(<CaseDetails crmCase={buildCase()} userRole={UserRole.ADMIN} />);

    expect(screen.getByText('SIN-1000')).toBeInTheDocument();
    expect(screen.getByText('Seguradora Exemplo')).toBeInTheDocument();
    expect(screen.getByText('D+')).toBeInTheDocument();
    expect(screen.getByText('Carlos Eduardo Pereira')).toBeInTheDocument();
    expect(screen.getByText('Máquina de lavar')).toBeInTheDocument();
    expect(screen.getByText('formulário do status')).toBeInTheDocument();
  });

  it('keeps the single details card for a case outside the v2 flow', () => {
    render(<CaseDetails crmCase={buildCase()} userRole={UserRole.ADMIN} />);

    expect(
      screen.getByText('detalhes com todos os comentários')
    ).toBeInTheDocument();
    expect(screen.queryByText('momentos do caso')).not.toBeInTheDocument();
    expect(screen.queryByText('comentários')).not.toBeInTheDocument();
  });

  it('splits the details into moments and comments for a v2 case', () => {
    render(
      <CaseDetails
        crmCase={buildCase({
          metadata: {
            ...caseDetailsFixture.metadata,
            [ONGOING_FLOW_VERSION_METADATA_KEY]: ONGOING_FLOW_VERSION_V2_VALUE,
          },
        })}
        userRole={UserRole.ADMIN}
      />
    );

    expect(screen.getByText('momentos do caso')).toBeInTheDocument();
    expect(screen.getByText('comentários')).toBeInTheDocument();
    expect(
      screen.queryByText('detalhes com todos os comentários')
    ).not.toBeInTheDocument();
  });

  it('shows the scheduled visit only while the case is ongoing', () => {
    const { rerender } = render(
      <CaseDetails crmCase={buildCase()} userRole={UserRole.ADMIN} />
    );
    expect(screen.getByText('Data agendada:')).toBeInTheDocument();

    rerender(
      <CaseDetails
        crmCase={buildCase({ status: CaseStatus.WAITING_PARTNER })}
        userRole={UserRole.ADMIN}
      />
    );
    expect(screen.queryByText('Data agendada:')).not.toBeInTheDocument();
  });

  it('offers the report download once the case is past the report', () => {
    render(
      <CaseDetails
        crmCase={buildCase({ status: CaseStatus.PAYMENT })}
        userRole={UserRole.ADMIN}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Baixar laudo' })
    ).toBeInTheDocument();
  });

  it('sends an operator away from an admin-only status', () => {
    render(
      <CaseDetails
        crmCase={buildCase({ status: CaseStatus.REPORT })}
        userRole={UserRole.OPERATOR}
      />
    );

    expect(mockPush).toHaveBeenCalledWith('/cases');
  });

  it('keeps an operator on an ongoing case, without the reset button', () => {
    render(<CaseDetails crmCase={buildCase()} userRole={UserRole.OPERATOR} />);

    expect(mockPush).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: 'Resetar caso' })
    ).not.toBeInTheDocument();
  });

  it('copes with a case missing its related records', () => {
    render(
      <CaseDetails
        crmCase={buildCase({
          contractor: undefined,
          customer: undefined,
          product: undefined,
          owner: undefined,
          partner: undefined,
          metadata: {},
        })}
        userRole={UserRole.ADMIN}
      />
    );

    expect(screen.getByText('Dados do caso')).toBeInTheDocument();
    expect(screen.queryByText('Técnico:')).not.toBeInTheDocument();
  });
});
